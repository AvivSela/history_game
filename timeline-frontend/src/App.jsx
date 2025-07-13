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
            <header className="bg-gradient-to-br from-primary to-secondary text-white shadow-lg sticky top-0 z-50">
      <nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <Link to="/" className="flex flex-col gap-0.5 no-underline text-inherit transition-all duration-300 hover:scale-105">
          <h1 className="text-7xl font-bold m-0 bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent drop-shadow-sm">⏰ Timeline</h1>
          <span className="text-xs opacity-90 font-normal tracking-wider uppercase">Historical Card Game</span>
        </Link>
        <div className="flex gap-6 items-center">
          <Link to="/" className={`text-white no-underline font-medium text-base px-4 py-2 rounded-full transition-all duration-300 relative overflow-hidden ${isActive('/') === 'nav-link active' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10 hover:-translate-y-0.5'}`}>
            Home
          </Link>
          <Link to="/game" className={`text-white no-underline font-medium text-base px-4 py-2 rounded-full transition-all duration-300 relative overflow-hidden ${isActive('/game') === 'nav-link active' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10 hover:-translate-y-0.5'}`}>
            Play
          </Link>
          <Link to="/settings" className={`text-white no-underline font-medium text-base px-4 py-2 rounded-full transition-all duration-300 relative overflow-hidden ${isActive('/settings') === 'nav-link active' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10 hover:-translate-y-0.5'}`}>
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
