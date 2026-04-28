import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, registerUser, getCurrentUser } from '../api/authApi';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Check auth on initial load
  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await getCurrentUser();
      setUser(response?.data?.user || response?.data); 
    } catch (error) {
      console.error('Auth verification failed:', error);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await loginUser(credentials);
      const extractedToken = response?.data?.token;
      const extractedUser = response?.data?.user;

      if (extractedToken && extractedUser) {
        localStorage.setItem('token', extractedToken);
        setToken(extractedToken);
        setUser(extractedUser);
        return;
      }
      throw new Error('Invalid response from server');
    } catch (err) {
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const response = await registerUser(userData);
      const extractedToken = response?.data?.token;
      const extractedUser = response?.data?.user;

      if (extractedToken && extractedUser) {
        localStorage.setItem('token', extractedToken);
        setToken(extractedToken);
        setUser(extractedUser);
        return;
      }
      throw new Error('Invalid response from server');
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};