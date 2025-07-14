import React, { memo } from 'react';

/**
 * LoadingScreen - Component for displaying a loading state while game data is being fetched
 * 
 * This component provides a user-friendly loading interface with a spinning animation
 * and informative text. It's displayed while the application is fetching historical
 * events and initializing the game state. The component uses a gradient background
 * and centered layout to provide a polished loading experience.
 * 
 * @component
 * @example
 * ```jsx
 * <LoadingScreen />
 * ```
 * 
 * @returns {JSX.Element} The loading screen with spinner and loading message
 */
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