import React from 'react';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ fullPage = false, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg'
  };

  const spinner = (
    <div className={`spinner-border text-primary ${sizes[size]} ${className}`} role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  );

  if (fullPage) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        {spinner}
      </div>
    );
  }

  return spinner;
};

LoadingSpinner.propTypes = {
  fullPage: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string
};

export default LoadingSpinner;