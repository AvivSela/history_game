import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Game from './pages/Game';
import Settings from './pages/Settings';
import './styles/globals.css';
import './App.css';

// Navigation component
const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  return (
    <header className="app-header">
      <div className="container">
        <nav className="navbar">
          <Link to="/" className="logo-section">
            <h1 className="logo">⏰ Timeline</h1>
            <span className="logo-subtitle">Historical Card Game</span>
          </Link>
          <div className="nav-links">
            <Link to="/" className={isActive('/')}>Home</Link>
            <Link to="/game" className={isActive('/game')}>Play</Link>
            <Link to="/settings" className={isActive('/settings')}>Settings</Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

// Footer component
const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="container">
        <p>&copy; 2025 Timeline Game. Test your historical knowledge!</p>
        <div className="footer-links">
          <span>Built with React & Node.js</span>
        </div>
      </div>
    </footer>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        
        <main className="main-content">
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
