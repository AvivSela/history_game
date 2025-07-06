import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <div className="container">
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Welcome to Timeline</h1>
            <p className="hero-description">
              Test your knowledge of history by placing events in chronological order. 
              Each card shows a historical event - place it correctly on the timeline to win!
            </p>
            <div className="hero-actions">
              <Link to="/game" className="btn btn-primary btn-large">
                🎮 Start Playing
              </Link>
              <Link to="/settings" className="btn btn-secondary btn-large">
                ⚙️ Settings
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-cards">
              <div className="demo-card card-1">
                <span>Moon Landing</span>
                <small>1969</small>
              </div>
              <div className="demo-card card-2">
                <span>World War II</span>
                <small>1939-1945</small>
              </div>
              <div className="demo-card card-3">
                <span>Internet</span>
                <small>1989</small>
              </div>
            </div>
          </div>
        </div>
        
        <div className="features-section">
          <h2>How to Play</h2>
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">🎴</div>
              <h3>1. Draw Cards</h3>
              <p>Start with a hand of historical event cards showing only the event name.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">📍</div>
              <h3>2. Place in Order</h3>
              <p>Click cards to place where you think they belong on the timeline.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">✅</div>
              <h3>3. Check Your Answer</h3>
              <p>The date is revealed - if correct, the card stays on the timeline!</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🏆</div>
              <h3>4. Win the Game</h3>
              <p>Place all your cards correctly to complete the timeline!</p>
            </div>
          </div>
        </div>

        <div className="stats-section">
          <h2>Game Features</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">15+</div>
              <div className="stat-label">Historical Events</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">5</div>
              <div className="stat-label">Different Categories</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">3</div>
              <div className="stat-label">Difficulty Levels</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">∞</div>
              <div className="stat-label">Replayability</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
