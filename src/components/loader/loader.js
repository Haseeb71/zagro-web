// components/Loader.jsx
import React from 'react';

const Loader = ({ size = 50, color = '#514b82', className = '' }) => {
  return (
    <div 
      className={`inline-block ${className}`}
      style={{
        width: size,
        height: size,
        border: `3px solid ${color}20`,
        borderTop: `3px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}
    >
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loader;