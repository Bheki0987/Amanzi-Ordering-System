import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import CustomerDashboard from './pages/CustomerDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import Payment from './components/Payment/StripePayment';
import { isAuthenticated, getCurrentUser } from './services/authService';

// Simple private route implementation
const PrivateRoute = ({ children, requiredRole }) => {
  const authenticated = isAuthenticated();
  const user = getCurrentUser();
  
  if (!authenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    if (user?.role === 'customer') {
      return <Navigate to="/customer/dashboard" />;
    }
    if (user?.role === 'provider') {
      return <Navigate to="/provider/dashboard" />;
    }
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
          path="/customer/payment/:orderId" 
          element={
            <PrivateRoute requiredRole="customer">
              <Payment />
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
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;