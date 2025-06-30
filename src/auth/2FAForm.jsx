// components/auth/2FAForm.jsx
import React, { useState } from 'react';
import api from '../services/api';

const TwoFAForm = ({ tempToken, onSuccess }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await api.post('/verify-2fa', {
        temp_token: tempToken,
        code: code,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);

      onSuccess(); // navigate or refresh auth state
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid verification code');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="twofa-container">
      <h3>Two-Factor Authentication</h3>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Enter the 6-digit code sent to your phone</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength="6"
            className="form-control"
            required
          />
        </div>
        <button type="submit" className="btn btn-success mt-3" disabled={isSubmitting}>
          {isSubmitting ? 'Verifying...' : 'Verify'}
        </button>
      </form>
    </div>
  );
};

export default TwoFAForm;