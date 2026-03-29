import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'var(--white)',
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '500px',
          boxShadow: 'var(--shadow-lg)'
        }}
        onClick={e => e.stopPropagation()}
        className="animate-fade-in"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{title}</h2>
          <button 
            onClick={onClose}
            style={{ color: 'var(--text-secondary)', fontSize: '1.5rem', lineHeight: 1 }}
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
