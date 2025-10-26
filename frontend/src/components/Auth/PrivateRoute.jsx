import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../services/authService';

const PrivateRoute = ({ children }) => {
  // Check if the user is authenticated
  const auth = isAuthenticated();
  
  // If not authenticated, redirect to login
  if (!auth) {
    return <Navigate to="/login" />;
  }
  
  // Otherwise, render the protected component
  return children;
};

export default PrivateRoute;