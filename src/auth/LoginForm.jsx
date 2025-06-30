// components/auth/LoginForm.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { authAPI } from '../services/api';

const LoginForm = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [tempAuthData, setTempAuthData] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
        const response = await authAPI.login({ identifier, password });      
      if (response.data.requires_2fa) {
        setTempAuthData({
          tempToken: response.data.temp_token,
          userId: response.data.user_id,
          userType: response.data.user_type
        });
        setRequires2FA(true);
      } else {
        // Student login - no 2FA
        localStorage.setItem('token', response.data.token);
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await api.post('/verify-2fa', {
        temp_token: tempAuthData.tempToken,
        code: twoFACode
      });

      localStorage.setItem('token', response.data.token);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid verification code');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      
      {!requires2FA ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Admission Number (Students) or Phone/Name (Staff)</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
      ) : (
        <form onSubmit={handle2FASubmit}>
          <div className="form-group">
            <label>Enter 6-digit code sent to your phone</label>
            <input
              type="text"
              value={twoFACode}
              onChange={(e) => setTwoFACode(e.target.value)}
              maxLength="6"
              required
            />
          </div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      )}
    </div>
  );
};

export default LoginForm;