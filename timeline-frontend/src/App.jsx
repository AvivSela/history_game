import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

// Lazy load page components for better performance
const Home = lazy(() => import('./pages/Home'));
const Game = lazy(() => import('./pages/Game'));
const Settings = lazy(() => import('./pages/Settings'));

// Loading component for lazy-loaded routes
const PageLoader = () => (
  <div className="min-h-[calc(100vh-140px)] bg-gradient-to-br from-gray-50 to-blue-100 p-5 px-6 w-full max-w-none">
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="text-center bg-card p-10 rounded-lg shadow-lg">
        <div className="inline-block w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-5"></div>
        <h2 className="text-primary text-xl font-bold mb-2">Loading...</h2>
        <p className="text-text-light">Please wait while we load the page</p>
      </div>
    </div>
  </div>
);

// Navigation component
const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  return (
    <header className="bg-gradient-to-br from-slate-900 to-primary text-white shadow-lg">
      <nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto transform-none">
        <Link to="/" className="flex flex-col gap-0.5 no-underline text-inherit">
          <h1 className="logo-text">⏰ Timeline</h1>
          <span className="logo-subtitle">Historical Card Game</span>
        </Link>
        <div className="flex gap-6 items-center">
          <Link to="/" className={isActive('/')}>
            Home
          </Link>
          <Link to="/game" className={isActive('/game')}>
            Play
          </Link>
          <Link to="/settings" className={isActive('/settings')}>
            Settings
          </Link>
        </div>
      </nav>
    </header>
  );
};

// Footer component
const Footer = () => {
  return (
    <footer className="bg-primary text-white py-5 text-center mt-auto">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6">
        <p className="m-0 text-sm opacity-90">&copy; 2025 Timeline Game. Test your historical knowledge!</p>
        <div className="text-xs opacity-70">
          <span>Built with React & Node.js</span>
        </div>
      </div>
    </footer>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col w-full max-w-none">
        <Navigation />
        
        <main className="flex-1 flex flex-col w-full max-w-none">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/game" element={<Game />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Suspense>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;
