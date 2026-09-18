'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '@/app/services/auth.service';
import { AUTH_SESSION_EXPIRED_EVENT, apiClient } from '@/lib/apiClient';
import { sessionStore, type SessionUser } from '@/lib/session';
import { isPlatformAdmin } from '@/lib/roles';
import { logger } from '@/lib/logger';
import { LoginCredentials } from '../types/auth';

/** Where an unauthenticated visitor is sent. */
export const LOGIN_ROUTE = '/talimadminlogin';

interface AuthContextType {
  /** The signed-in administrator, or `null`. */
  user: SessionUser | null;
  /** True only when a signed-in user is a platform administrator. */
  isAuthenticated: boolean;
  /** True until the cold-start refresh has settled. */
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<SessionUser>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => undefined,
  logout: async () => undefined,
  updateUser: () => undefined,
});

/**
 * The session for the current tree.
 *
 * @returns The auth context value.
 */
export const useAuthContext = () => useContext(AuthContext);

/**
 * Owns the session.
 *
 * The access token never touches a cookie or web storage: it lives in
 * {@link sessionStore} in memory for the life of the tab. Durability comes from
 * the httpOnly `refreshToken` cookie the backend sets on `/auth/admin-login`,
 * which this provider exchanges for a fresh access token on mount and whenever
 * a request comes back 401.
 *
 * @param props - Standard children.
 * @param props.children - The application tree.
 * @returns The provider element.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();
  const hasBootstrapped = useRef(false);

  const clearSession = useCallback(() => {
    sessionStore.clear();
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  /**
   * Mints a fresh access token from the refresh cookie and, the first time
   * round, resolves the user behind it. Returns false when there is no session.
   */
  const refreshSession = useCallback(async (): Promise<boolean> => {
    const accessToken = await authService.refresh();
    if (!accessToken) {
      clearSession();
      return false;
    }

    sessionStore.setToken(accessToken);

    if (sessionStore.getUser()) return true;

    const resolved = await authService.introspect(accessToken);
    if (!resolved || !isPlatformAdmin(resolved)) {
      // A valid Talim session that is not a platform administrator: the portal
      // is not theirs, so the session is dropped rather than half-rendered.
      clearSession();
      return false;
    }

    sessionStore.set(resolved, accessToken);
    setUser(resolved);
    return true;
  }, [clearSession]);

  // The client refreshes through the same path the provider does, so a 401 in
  // any service call recovers without every caller knowing about auth.
  useEffect(() => {
    apiClient.setRefreshCallback(refreshSession);
  }, [refreshSession]);

  useEffect(() => {
    if (hasBootstrapped.current) return;
    hasBootstrapped.current = true;

    void (async () => {
      try {
        await refreshSession();
      } catch (error) {
        logger.error('auth', 'Session bootstrap failed', error);
        clearSession();
      } finally {
        setIsLoading(false);
      }
    })();
  }, [refreshSession, clearSession]);

  useEffect(() => {
    const handleSessionExpired = () => {
      clearSession();
      router.replace(LOGIN_ROUTE);
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, [router, clearSession]);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<void> => {
      const { accessToken, user: loggedInUser } = await authService.login(credentials);
      sessionStore.set(loggedInUser, accessToken);
      setUser(loggedInUser);
    },
    [],
  );

  const logout = useCallback(async (): Promise<void> => {
    await authService.logout();
    clearSession();
    router.replace(LOGIN_ROUTE);
  }, [router, clearSession]);

  const updateUser = useCallback((patch: Partial<SessionUser>): void => {
    sessionStore.patchUser(patch);
    setUser(sessionStore.getUser());
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: isPlatformAdmin(user),
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
