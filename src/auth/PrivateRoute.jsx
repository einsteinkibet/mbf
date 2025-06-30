import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PrivateRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  return isLoggedIn ? children : (
    <Navigate 
      to="/login" 
      state={{ from: location }} 
      replace 
    />
  );
};

export default PrivateRoute;