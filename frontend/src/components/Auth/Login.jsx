import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { login } from '../../services/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    try {
      const token = localStorage.getItem('token');
      const userString = localStorage.getItem('user');
      
      if (token && userString) {
        const user = JSON.parse(userString);
        
        if (user?.role === 'customer') {
          navigate('/customer/dashboard');
        } else if (user?.role === 'provider') {
          navigate('/provider/dashboard');
        }
      }
    } catch (err) {
      console.error('Error checking authentication:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use real login API
      const response = await login(email, password);
      
      // Log the response for debugging
      console.log('Login response:', response);
      
      // Check if we have user data and token
      if (!response || !response.token) {
        throw new Error('Invalid response from server');
      }
      
      // Get user from response
      const user = response.user || {};
      
      // Redirect based on role
      if (user.role === 'customer') {
        navigate('/customer/dashboard');
      } else if (user.role === 'provider') {
        navigate('/provider/dashboard');
      } else {
        throw new Error('Invalid user role');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError(err?.response?.data?.message || err?.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Amanzi Ordering System</h1>
          <h2>Login to Your Account</h2>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="login-btn" 
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
             
        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
          <p>
            <Link to="/forgot-password">Forgot Password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;