import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import CustomerDashboard from './components/Dashboard/CustomerDashboard';
import ProviderDashboard from './components/Dashboard/ProviderDashboard';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import { isAuthenticated, getCurrentUser } from './services/authService';

// Simple private route implementation
const PrivateRoute = ({ children, requiredRole }) => {
  const authenticated = isAuthenticated();
  const user = getCurrentUser();
  
  if (!authenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to the appropriate dashboard based on role
    if (user?.role === 'customer' || user?.role === 'student') {
      return <Navigate to="/customer/dashboard" />;
    }
    if (user?.role === 'provider' || user?.role === 'supplier') {
      return <Navigate to="/provider/dashboard" />;
    }
    // If no valid role, send to home
    return <Navigate to="/" />;
  }
  
  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route 
          path="/customer/dashboard" 
          element={
            <PrivateRoute requiredRole="customer">
              <CustomerDashboard />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/provider/dashboard" 
          element={
            <PrivateRoute requiredRole="provider">
              <ProviderDashboard />
            </PrivateRoute>
          } 
        />
        
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;