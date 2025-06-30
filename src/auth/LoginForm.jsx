import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api'; // Import from your api.jsx

const LoginForm = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Using the authAPI from api.jsx
      const response = await authAPI.login({ identifier, password });
      
      if (response.data.requires_2fa) {
        setTempToken(response.data.temp_token);
        setShow2FA(true);
      } else {
        // Tokens are automatically handled by api.jsx interceptors
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handle2FASubmit = async (code) => {
    try {
      setIsSubmitting(true);
      // Using the authAPI from api.jsx
      await authAPI.verify2FA({ 
        temp_token: tempToken,
        code 
      });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid verification code');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (show2FA) {
    return (
      <div className="container mt-5" style={{ maxWidth: '500px' }}>
        <div className="card shadow">
          <div className="card-body">
            <h2 className="card-title text-center mb-4">Two-Factor Authentication</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            
            <div className="mb-3">
              <label>Enter 6-digit code</label>
              <input
                type="text"
                className="form-control"
                maxLength="6"
                placeholder="123456"
              />
            </div>
            
            <button 
              onClick={() => handle2FASubmit('123456')} // You'd get this from user input
              className="btn btn-primary w-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5" style={{ maxWidth: '500px' }}>
      <div className="card shadow">
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Login</h2>
          
          {error && <div className="alert alert-danger">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label>Username or Email</label>
              <input
                type="text"
                className="form-control"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-3">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary w-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;