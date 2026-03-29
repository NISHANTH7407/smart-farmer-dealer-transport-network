import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  type = 'button', 
  disabled = false, 
  loading = false,
  className = '',
  ...props 
}) => {
  const baseClass = `btn btn-${variant} ${className}`;
  return (
    <button 
      type={type} 
      className={baseClass} 
      disabled={disabled || loading} 
      {...props}
    >
      {loading ? <span className="spinner"></span> : children}
    </button>
  );
};

export default Button;
