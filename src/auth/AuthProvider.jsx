// auth/AuthProvider.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    user: null,
    loading: true,
  });

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthState({ isLoggedIn: false, user: null, loading: false });
        return;
      }

      // Verify token with backend
      const response = await api.get('/auth/verify');
      setAuthState({
        isLoggedIn: true,
        user: response.data.user,
        loading: false,
      });
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setAuthState({ isLoggedIn: false, user: null, loading: false });
    }
  }, []);

  useEffect(() => {
    initializeAuth();
    
    // Set up periodic token verification (every 5 minutes)
    const interval = setInterval(initializeAuth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [initializeAuth]);

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      setAuthState({
        isLoggedIn: true,
        user: response.data.user,
        loading: false,
      });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setAuthState({ isLoggedIn: false, user: null, loading: false });
    }
  };

  const value = {
    ...authState,
    login,
    logout,
    isAdmin: authState.user?.role === 'admin',
    isStaff: authState.user?.type === 'staff',
    isStudent: authState.user?.type === 'student',
  };

  return (
    <AuthContext.Provider value={value}>
      {!authState.loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);