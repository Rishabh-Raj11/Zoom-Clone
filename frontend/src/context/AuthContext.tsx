'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { fetchAuthUser, loginUser as apiLogin, signupUser as apiSignup } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  signup: (name: string, email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const savedToken = typeof window !== 'undefined' ? localStorage.getItem('zoom_auth_token') : null;
        const savedUser = typeof window !== 'undefined' ? localStorage.getItem('zoom_auth_user') : null;

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        } else {
          // Fallback to default host profile for initial load
          const dbUser = await fetchAuthUser();
          if (dbUser) {
            setUser(dbUser);
            setToken(`token_${dbUser.id}`);
          }
        }
      } catch (e) {
        console.error('Session load error:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await apiLogin(email, pass);
    if (res.success && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('zoom_auth_token', res.token);
      localStorage.setItem('zoom_auth_user', JSON.stringify(res.user));
      return { success: true };
    }
    return { success: false, message: res.message || 'Invalid credentials' };
  };

  const signup = async (name: string, email: string, pass: string) => {
    const res = await apiSignup(name, email, pass);
    if (res.success && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('zoom_auth_token', res.token);
      localStorage.setItem('zoom_auth_user', JSON.stringify(res.user));
      return { success: true };
    }
    return { success: false, message: res.message || 'Signup failed' };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('zoom_auth_token');
    localStorage.removeItem('zoom_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
