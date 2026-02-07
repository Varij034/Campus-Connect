'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types/api';
import { authApi, getToken, setToken, removeToken, getUser, setUser, removeUser } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: 'student' | 'hr' | 'tpo') => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      const savedUser = getUser();

      if (token && savedUser) {
        setUserState(savedUser);
        // Verify token is still valid by fetching user info
        try {
          const currentUser = await authApi.getMe();
          setUserState(currentUser);
          setUser(currentUser);
        } catch (error) {
          // Token is invalid, clear auth
          removeToken();
          removeUser();
          setUserState(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const tokenResponse = await authApi.login(email, password);
      setToken(tokenResponse.access_token);

      // Fetch user info
      const userInfo = await authApi.getMe();
      setUserState(userInfo);
      setUser(userInfo);
    } catch (error) {
      removeToken();
      removeUser();
      setUserState(null);
      throw error;
    }
  };

  const register = async (email: string, password: string, role: 'student' | 'hr' | 'tpo') => {
    try {
      // Map client roles to backend roles
      const backendRole = role === 'hr' ? 'recruiter' : role === 'tpo' ? 'tpo' : 'student';
      const newUser = await authApi.register(email, password, backendRole);
      
      // Auto-login after registration
      await login(email, password);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    removeToken();
    removeUser();
    setUserState(null);
  };

  const refreshUser = async () => {
    try {
      const userInfo = await authApi.getMe();
      setUserState(userInfo);
      setUser(userInfo);
    } catch (error) {
      // If refresh fails, logout
      logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
