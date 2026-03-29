import React from 'react';

const Loader = ({ fullScreen = false }) => {
  const alignStyle = fullScreen 
    ? { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }
    : { display: 'flex', justifyContent: 'center', padding: '2rem' };

  return (
    <div style={alignStyle} aria-live="polite">
      <div className="spinner"></div>
    </div>
  );
};

export default Loader;
