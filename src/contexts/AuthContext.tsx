import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DEMO_USERS } from '../utils/mockData';

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
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (username: string, password: string): Promise<boolean> => {
    // Check against demo credentials
    const validUser = DEMO_USERS.find(
      u => u.username === username && u.password === password
    );

    if (validUser) {
      const userData = { 
        username: validUser.username, 
        role: validUser.role 
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    }

    // Fallback - accept any non-empty credentials for demo
    if (username && password) {
      const userData = { 
        username, 
        role: 'User' 
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    }

    return false;
  };

  const signup = async (username: string, password: string, confirmPassword: string): Promise<boolean> => {
    // Simulate API call with validation
    if (username && password && password === confirmPassword && password.length >= 6) {
      const userData = { 
        username, 
        role: 'New User' 
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
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
