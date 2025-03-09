import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import nookies from 'nookies';
import { authService } from '../services/auth.service';
import { LoginCredentials, User } from '../types/auth';

export const useAuth = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      console.log('Attempting login...', credentials.email);
      const response = await authService.login(credentials);
      console.log('Login response received:', response);
      
      // Save tokens in cookies
      nookies.set(null, 'access_token', response.access_token, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });

      nookies.set(null, 'refresh_token', response.refresh_token, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });

      // Save user data
      localStorage.setItem('user', JSON.stringify(response.user));

      toast.success('Login successful!');
      
      // Try multiple navigation approaches
      try {
        console.log('Attempting navigation...');
        router.push('/dashboard');
        
        // If router.push doesn't work, try window.location after a short delay
        setTimeout(() => {
          if (window.location.pathname !== '/dashboard') {
            console.log('Fallback to window.location...');
            window.location.href = '/dashboard';
          }
        }, 500);
      } catch (navError) {
        console.error('Navigation error:', navError);
        // Fallback to window.location
        window.location.href = '/dashboard';
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear cookies
    nookies.destroy(null, 'access_token');
    nookies.destroy(null, 'refresh_token');
    
    // Clear local storage
    localStorage.removeItem('user');
    
    // Use both navigation methods for logout as well
    router.push('/');
    window.location.href = '/';
  };

  const getUser = (): User | null => {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  };

  return {
    login,
    logout,
    getUser,
    isLoading,
  };
}; 