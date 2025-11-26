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
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();
  
  const RESIDENCES = [
    'Cluster 8', 'C9', 'C10', 'C11', 'C12', 'C13', 
    'Bus Terminal', 'Nelson Mandela Res', 'Dr James Moroka', 
    'Kgosi Dick', 'A2_F', 'A5', 'Boss-Mike', 
    'Steve Bhiko House', 'Lost City', 'Khayelitsha', 'Hopeville'
  ];

  const validatePassword = (pwd) => {
    const errors = [];
    
    if (pwd.length < 8) {
      errors.push('At least 8 characters');
    }
    if (pwd.length > 12) {
      errors.push('Maximum 12 characters');
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push('At least one uppercase letter');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      errors.push('At least one special character (!@#$%^&*)');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length (simplified)
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    // Validate phone for providers
    if (role === 'provider' && (!phone || phone.length < 10)) {
      setError('Phone number is required for service providers (minimum 10 digits)');
      setLoading(false);
      return;
    }

    // Validate residence for customers
    if (role === 'customer' && !residence) {
      setError('Residence is required for customers');
      setLoading(false);
      return;
    }

    try {
      const userData = {
        name,
        email,
        password,
        role,
        phone: phone || '0000000000',
        residence: role === 'customer' ? residence : '',
      };

      const response = await register(userData);
      navigate(role === 'customer' ? '/customer/dashboard' : '/provider/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="auth-header">
          <img src="/images/Amanzi Logo.png" alt="Amanzi Logo" className="auth-logo" />
          <h2>Create Your Account</h2>
          <p>Join Amanzi for water delivery</p>
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
          
          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                minLength="8"
                maxLength="12"
                style={{ paddingRight: '45px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  color: '#6b7280',
                  padding: '5px'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {password && validatePassword(password).length > 0 && (
              <div style={{ 
                marginTop: '8px', 
                padding: '8px', 
                backgroundColor: '#FEF3C7', 
                borderRadius: '4px',
                fontSize: '0.85rem'
              }}>
                <strong>Password must have:</strong>
                <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
                  {validatePassword(password).map((err, idx) => (
                    <li key={idx} style={{ color: '#92400E' }}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                minLength="8"
                maxLength="12"
                style={{ paddingRight: '45px' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  color: '#6b7280',
                  padding: '5px'
                }}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
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

          <div className="form-group">
            <label htmlFor="phone">
              Phone Number {role === 'provider' && <span style={{ color: 'red' }}>*</span>}
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g., 0123456789"
              required={role === 'provider'}
              minLength={10}
              maxLength={15}
              pattern="[0-9]+"
            />
            {role === 'provider' && (
              <small className="form-text">
                Phone number is required for service providers to allow customers to contact you
              </small>
            )}
          </div>
          
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