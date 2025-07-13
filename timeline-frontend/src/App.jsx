import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Game from './pages/Game';
import Settings from './pages/Settings';

// Navigation component
const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  return (
    <header className="bg-gradient-to-br from-primary to-secondary text-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <Link to="/" className="flex flex-col gap-0.5 no-underline text-inherit transition-all duration-300 hover:scale-105">
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
        
        <main className="flex-1 flex flex-col w-full max-w-none pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game" element={<Game />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;
