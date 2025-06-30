import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    user: null,
    loading: true,
    requires2FA: false,
    tempToken: null
  });

  // Initialize auth state and set up token refresh
  const initializeAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!token) {
        if (refreshToken) {
          // Attempt to refresh tokens if only refresh token exists
          await handleTokenRefresh(refreshToken);
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
        return;
      }

      // Verify the current token
      const response = await api.get('/auth/verify');
      setAuthState({
        isLoggedIn: true,
        user: response.data.user,
        loading: false,
        requires2FA: false,
        tempToken: null
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      await logout();
    }
  }, []);

  // Handle token refresh
  const handleTokenRefresh = useCallback(async (refreshToken) => {
    try {
      const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refresh_token);

      const verifyResponse = await api.get('/auth/verify');
      setAuthState({
        isLoggedIn: true,
        user: verifyResponse.data.user,
        loading: false,
        requires2FA: false,
        tempToken: null
      });
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      return false;
    }
  }, []);

  // Login handler
  const login = async (credentials) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      const response = await api.post('/login', credentials);

      if (response.data.requires_2fa) {
        setAuthState({
          isLoggedIn: false,
          user: null,
          loading: false,
          requires2FA: true,
          tempToken: response.data.temp_token
        });
        return { 
          success: true, 
          requires2FA: true,
          user_id: response.data.user_id
        };
      }

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refresh_token);

      setAuthState({
        isLoggedIn: true,
        user: response.data.user,
        loading: false,
        requires2FA: false,
        tempToken: null
      });

      return { success: true };
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      };
    }
  };

  // 2FA verification handler
  const verify2FA = async (code) => {
    try {
      if (!authState.tempToken) {
        throw new Error('No 2FA session found');
      }

      const response = await api.post('/2fa/verify', {
        temp_token: authState.tempToken,
        code
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refresh_token);

      setAuthState({
        isLoggedIn: true,
        user: response.data.user,
        loading: false,
        requires2FA: false,
        tempToken: null
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || '2FA verification failed'
      };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setAuthState({
        isLoggedIn: false,
        user: null,
        loading: false,
        requires2FA: false,
        tempToken: null
      });
    }
  };

  // Set up interceptors and periodic auth checks
  useEffect(() => {
    // Response interceptor for token refresh
    const responseInterceptor = api.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const refreshToken = localStorage.getItem('refreshToken');
          
          if (refreshToken && await handleTokenRefresh(refreshToken)) {
            originalRequest.headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
            return api(originalRequest);
          }
        }
        
        return Promise.reject(error);
      }
    );

    // Initialize auth and set up refresh interval
    initializeAuth();
    const interval = setInterval(initializeAuth, 4.5 * 60 * 1000); // Refresh every 4.5 minutes

    return () => {
      api.interceptors.response.eject(responseInterceptor);
      clearInterval(interval);
    };
  }, [initializeAuth, handleTokenRefresh]);

  // Context value
  const value = {
    ...authState,
    login,
    logout,
    verify2FA,
    isAdmin: authState.user?.role === 'admin',
    isStaff: authState.user?.type === 'staff',
    isStudent: authState.user?.type === 'student',
    isTeacher: authState.user?.role === 'teacher',
    isBursar: authState.user?.role === 'bursar',
    isDirector: authState.user?.role === 'director'
  };

  return (
    <AuthContext.Provider value={value}>
      {!authState.loading ? children : (
        <div className="auth-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
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