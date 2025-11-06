"use client";

import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data } = await api.get('/users/me');
        setUser(prevUser => ({
          ...prevUser,
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role,
        }));
      } catch (error) {
        console.error('Failed to fetch user profile', error);
        logout();
      }
    };

    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      const decodedUser: User = jwtDecode(storedToken);
      setUser(decodedUser);
      setToken(storedToken);
      api.defaults.headers.Authorization = `Bearer ${storedToken}`;
      fetchUserProfile();
    }
    setIsLoading(false);
  }, []);

  const login = async (newToken: string) => {
    const decodedUser: User = jwtDecode(newToken);
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    api.defaults.headers.Authorization = `Bearer ${newToken}`;

    try {
      const { data } = await api.get('/users/me');
      setUser({
        ...decodedUser,
        name: data.name,
        role: data.role,
      });
    } catch (error) {
      console.error('Failed to fetch user profile after login', error);
      setUser(decodedUser);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setToken(null);
    delete api.defaults.headers.Authorization;
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, updateUser, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
