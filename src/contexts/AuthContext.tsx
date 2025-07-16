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
    // On initial load, check for user and token in localStorage to persist session
    try {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('authToken');
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
      } else {
        // If either is missing, clear both to ensure a clean state
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error("Failed to initialize auth state from localStorage", error);
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const response = await loginUser(username, password);
    if (response.success && response.user && response.token) {
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('authToken', response.token); // Store JWT
      return true;
    }
    return false;
  };

  const signup = async (username: string, password: string, confirmPassword: string): Promise<boolean> => {
    if (password !== confirmPassword || password.length < 6) {
      // Basic validation, can be enhanced
      return false;
    }
    const response = await signupUser(username, password);
    if (response.success && response.user && response.token) {
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('authToken', response.token); // Store JWT
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken'); // Important: Clear JWT on logout
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
