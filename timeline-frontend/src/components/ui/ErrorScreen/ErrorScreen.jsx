import React, { memo } from 'react';

/**
 * ErrorScreen - Component for displaying error states with recovery options
 * 
 * This component provides a user-friendly error interface when something goes wrong
 * in the application. It displays the error message and provides action buttons
 * for retrying the operation or returning to the home page.
 * 
 * @component
 * @example
 * ```jsx
 * <ErrorScreen
 *   error="Failed to load game data"
 *   onRetry={handleRetry}
 *   onGoHome={handleGoHome}
 * />
 * ```
 * 
 * @param {Object} props - Component props
 * @param {string} props.error - Error message to display
 * @param {Function} props.onRetry - Callback function to retry the failed operation
 * @param {Function} props.onGoHome - Callback function to navigate to home page
 * 
 * @returns {JSX.Element} Error screen with message and action buttons
 */
const ErrorScreen = memo(({ error, onRetry, onGoHome }) => {
  return (
    <div className="min-h-[calc(100vh-140px)] bg-gradient-to-br from-gray-50 to-blue-100 p-5 px-6 w-full max-w-none">
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="bg-card p-10 rounded-lg shadow-lg text-center border-2 border-accent max-w-lg">
          <h2 className="text-accent text-xl font-bold mb-4">🚫 Oops! Something went wrong</h2>
          <p className="text-text-light mb-6 text-base">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={onRetry} className="btn btn-primary">
              🔄 Try Again
            </button>
            <button onClick={onGoHome} className="btn btn-secondary">
              🏠 Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

ErrorScreen.displayName = 'ErrorScreen';

export default ErrorScreen; 