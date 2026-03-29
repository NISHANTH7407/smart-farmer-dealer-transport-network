import React from 'react';

const Card = ({ children, title, className = '' }) => {
  return (
    <div className={`card ${className}`}>
      {title && <h3 style={{ marginBottom: '1rem' }}>{title}</h3>}
      {children}
    </div>
  );
};

export default Card;
