import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';
import { register } from '../../services/authService';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [residence, setResidence] = useState('');
  const [phone, setPhone] = useState(''); // Add default empty phone 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  
  const RESIDENCES = [
    'Cluster 8', 'C9', 'C10', 'C11', 'C12', 'C13', 
    'Bus Terminal', 'Nelson Mandela Res', 'Dr James Moroka', 
    'Kgosi Dick', 'A2_F', 'A5', 'Boss-Mike', 
    'Steve Bhiko House', 'Lost City', 'Khayelitsha', 'Hopeville'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare registration data with guaranteed values for required fields
      const userData = {
        name,
        email,
        password,
        role,
        residence: role === 'customer' ? residence : '',
        phone: '0000000000', // Default phone number
        // Ensure location is never empty - for providers use "Provider Location" if residence is empty
        location: role === 'customer' ? residence : (residence || 'Provider Location')
      };
      
      // Call the actual register API function
      const response = await register(userData);
      
      console.log('Registration successful:', response);
      
      // Registration successful - redirect to login
      setLoading(false);
      navigate('/login');
      
    } catch (err) {
      console.error('Registration error:', err);
      setLoading(false);
      setError(err.response?.data?.message || err.message || 'Registration failed');
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="auth-header">
          <h1>Amanzi Ordering System</h1>
          <h2>Create Your Account</h2>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
          
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
          
          {/* Hidden phone field with default value */}
          <input 
            type="hidden"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              minLength="6"
            />
          </div>
          
          <div className="form-group">
            <label>Confirm Password</label>
            <input 
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              minLength="6"
            />
          </div>
          
          <div className="form-group">
            <label>I am a:</label>
            <div className="role-selector">
              <label className={`role-option ${role === 'customer' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="customer"
                  checked={role === 'customer'}
                  onChange={() => setRole('customer')}
                />
                <span>Student</span>
              </label>
              <label className={`role-option ${role === 'provider' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="provider"
                  checked={role === 'provider'}
                  onChange={() => setRole('provider')}
                />
                <span>Water Provider</span>
              </label>
            </div>
          </div>
          
          {role === 'customer' && (
            <div className="form-group">
              <label>Residence</label>
              <select
                value={residence}
                onChange={(e) => setResidence(e.target.value)}
                required={role === 'customer'}
              >
                <option value="">Select your residence</option>
                {RESIDENCES.map(res => (
                  <option key={res} value={res}>{res}</option>
                ))}
              </select>
            </div>
          )}
          
          <button 
            type="submit" 
            className="register-btn" 
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <div className="login-link">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;