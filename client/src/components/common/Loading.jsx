import React from 'react';

const Loading = () => {
  return (
    <div className="fixed inset-0 bg-dark-500 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl animate-pulse"></div>
          <div className="absolute inset-2 bg-dark-500 rounded-xl flex items-center justify-center">
            <span className="text-3xl font-bold gradient-text">F</span>
          </div>
          {/* Spinning Ring */}
          <div className="absolute -inset-2 border-4 border-transparent border-t-primary-500 rounded-full animate-spin"></div>
        </div>
        
        {/* Loading Text */}
        <p className="text-gray-400 font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
