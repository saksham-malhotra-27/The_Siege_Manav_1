// Loader.tsx
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="loader"></div>
      <style>{`
        .loader {
          border: 8px solid rgba(255, 255, 255, 0.2);
          border-left-color: #4f46e5;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Loader;
