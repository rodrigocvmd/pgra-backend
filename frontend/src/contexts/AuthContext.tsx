"use client";

import { createContext, useState, useContext, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '@/lib/api';
import { setCookie, deleteCookie } from 'cookies-next';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
  token: initialToken,
}: {
  children: ReactNode;
  token: string | null;
}) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof initialToken === 'string') {
      return jwtDecode(initialToken);
    }
    return null;
  });
  const [token, setToken] = useState<string | null>(initialToken);

  if (initialToken) {
    api.defaults.headers.Authorization = `Bearer ${initialToken}`;
  }

  const login = async (newToken: string) => {
    setCookie('authToken', newToken, {
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });
    api.defaults.headers.Authorization = `Bearer ${newToken}`;
    const decodedUser: User = jwtDecode(newToken);
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
    setToken(newToken);
  };

  const logout = () => {
    deleteCookie('authToken');
    delete api.defaults.headers.Authorization;
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
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
