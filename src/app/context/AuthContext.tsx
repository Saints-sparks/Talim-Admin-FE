'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/app/services/auth.service';
import { refreshAccessToken } from '@/app/lib/api/client';
import { AUTH_SESSION_EXPIRED_EVENT } from '@/app/lib/auth/events';
import {
  clearAuthSession,
  getAccessToken,
  getStoredUser,
  setStoredUser,
} from '@/app/lib/auth/session';
import { isTokenExpired } from '@/app/lib/auth/jwt';
import { LoginCredentials, User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  updateUser: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => undefined,
  logout: async () => undefined,
  checkAuth: async () => false,
  updateUser: () => undefined,
});

export const useAuthContext = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async (): Promise<boolean> => {
    try {
      let accessToken = getAccessToken();

      if (!accessToken) {
        clearAuthSession();
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }

      if (isTokenExpired(accessToken)) {
        const refreshedToken = await refreshAccessToken();
        if (!refreshedToken) {
          setIsAuthenticated(false);
          setUser(null);
          return false;
        }
        accessToken = refreshedToken;
      }

      const cachedUser = getStoredUser();
      if (cachedUser) {
        setUser(cachedUser);
        setIsAuthenticated(true);
        return true;
      }

      const currentUser = await authService.introspect(accessToken);
      if (currentUser) {
        setStoredUser(currentUser);
        setUser(currentUser);
        setIsAuthenticated(true);
        return true;
      }

      clearAuthSession();
      setUser(null);
      setIsAuthenticated(false);
      return false;
    } catch {
      clearAuthSession();
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    const { user: loggedInUser } = await authService.login(credentials);
    setStoredUser(loggedInUser);
    setUser(loggedInUser);
    setIsAuthenticated(true);
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    router.replace('/talimadminlogin');
  };

  const updateUser = (patch: Partial<User>): void => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...patch };
      setStoredUser(updated);
      return updated;
    });
  };

  useEffect(() => {
    void checkAuth();
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      setIsAuthenticated(false);
      router.replace('/talimadminlogin');
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => {
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuth,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
