import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, currency?: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('eventease_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch (error) {
          console.error("Token verification failed:", error);
          localStorage.removeItem('eventease_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const authData: AuthResponse = await api.login({ email, password });
    localStorage.setItem('eventease_token', authData.access_token);
    setToken(authData.access_token);
    const userData = await api.getMe();
    setUser(userData);
  };

  const register = async (name: string, email: string, password: string, currency?: string) => {
    const authData: AuthResponse = await api.register({ name, email, password, currency });
    localStorage.setItem('eventease_token', authData.access_token);
    setToken(authData.access_token);
    const userData = await api.getMe();
    setUser(userData);
  };

  const demoLogin = async () => {
    const authData: AuthResponse = await api.demoLogin();
    localStorage.setItem('eventease_token', authData.access_token);
    setToken(authData.access_token);
    const userData = await api.getMe();
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('eventease_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedUser });
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, demoLogin, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
