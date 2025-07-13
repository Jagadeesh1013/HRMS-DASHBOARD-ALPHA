import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { loginUser, signupUser } from '../services/apiService';

interface User {
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, password: string, confirmPassword: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user');
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const response = await loginUser(username, password);
    if (response.success && response.user) {
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      return true;
    }
    return false;
  };

  const signup = async (username: string, password: string, confirmPassword: string): Promise<boolean> => {
    if (password !== confirmPassword || password.length < 6) {
      return false;
    }
    const response = await signupUser(username, password);
    if (response.success && response.user) {
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
