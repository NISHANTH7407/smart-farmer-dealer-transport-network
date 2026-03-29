import React from 'react';

const InputField = React.forwardRef(({ 
  label, 
  error, 
  type = 'text', 
  id,
  className = '',
  ...props 
}, ref) => {
  const inputClass = `input ${error ? 'input-error' : ''} ${className}`;
  
  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && <label htmlFor={id} className="label">{label}</label>}
      <input 
        id={id} 
        type={type} 
        ref={ref} 
        className={inputClass} 
        {...props} 
      />
      {error && <span className="error-msg" role="alert">{error}</span>}
    </div>
  );
});

InputField.displayName = 'InputField';

export default InputField;
