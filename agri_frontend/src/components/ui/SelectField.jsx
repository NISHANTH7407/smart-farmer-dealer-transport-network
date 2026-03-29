import React from 'react';

const SelectField = React.forwardRef(({ 
  label, 
  error, 
  id,
  options = [],
  className = '',
  ...props 
}, ref) => {
  const inputClass = `input ${error ? 'input-error' : ''} ${className}`;
  
  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && <label htmlFor={id} className="label">{label}</label>}
      <select 
        id={id} 
        ref={ref} 
        className={inputClass} 
        {...props}
      >
        <option value="" disabled>Select an option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="error-msg" role="alert">{error}</span>}
    </div>
  );
});

SelectField.displayName = 'SelectField';

export default SelectField;
