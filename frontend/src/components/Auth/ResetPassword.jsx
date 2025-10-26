import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { resetPassword, verifyResetToken } from '../../services/passwordService';
import './ForgotPassword.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const navigate = useNavigate();
  const { resetToken } = useParams();

  useEffect(() => {
    verifyToken();
  }, [resetToken]);

  const verifyToken = async () => {
    try {
      await verifyResetToken(resetToken);
      setTokenValid(true);
    } catch (err) {
      setError('Invalid or expired reset link');
      setTokenValid(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validate passwords
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword(resetToken, password);
      setMessage(response.message);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="loading-state">Verifying reset link...</div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="alert alert-error">
            {error || 'Invalid or expired reset link'}
          </div>
          <div className="forgot-password-footer">
            <Link to="/forgot-password">Request a new reset link</Link>
            <span> | </span>
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <div className="system-name">Amanzi Ordering System</div>
          <h2>Reset Password</h2>
          <p>Enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit} className="forgot-password-form">
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {message && (
            <div className="alert alert-success">
              {message}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
              disabled={loading}
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              disabled={loading}
              minLength="6"
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="forgot-password-footer">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;