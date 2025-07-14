import React, { memo } from 'react';

const LoadingScreen = memo(() => {
  return (
    <div className="min-h-[calc(100vh-140px)] bg-gradient-to-br from-gray-50 to-blue-100 p-5 px-6 w-full max-w-none">
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center bg-card p-10 rounded-lg shadow-lg">
          <div className="inline-block w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-5"></div>
          <h2 className="text-primary text-xl font-bold mb-2">Loading Timeline Game...</h2>
          <p className="text-text-light">Fetching historical events from our database</p>
        </div>
      </div>
    </div>
  );
});

LoadingScreen.displayName = 'LoadingScreen';

export default LoadingScreen; 