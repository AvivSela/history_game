/**
 * Player Stats Component
 * @description Displays detailed player statistics and performance metrics
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { gameAPI, extractData, handleAPIError } from '../../utils/api';
import './PlayerStats.css';

/**
 * Player Stats Component
 * @param {Object} props - Component props
 * @param {string} props.playerName - Player name
 * @param {Object} props.playerStats - Player statistics data
 * @param {Function} props.onRefresh - Function to refresh data
 * @returns {JSX.Element} Player stats component
 */
const PlayerStats = ({ playerName, playerStats, onRefresh }) => {
  const [categoryStats, setCategoryStats] = useState(null);
  const [difficultyStats, setDifficultyStats] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [dailyStats, setDailyStats] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(false);

  /**
   * Load category statistics
   */
  const loadCategoryStats = async () => {
    if (!playerName) return;
    
    setLoading(true);
    try {
      const response = await gameAPI.getPlayerCategoryStatistics(playerName);
      const data = extractData(response);
      setCategoryStats(data);
    } catch (err) {
      console.error('Failed to load category stats:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load difficulty statistics
   */
  const loadDifficultyStats = async () => {
    if (!playerName) return;
    
    setLoading(true);
    try {
      const response = await gameAPI.getPlayerDifficultyStatistics(playerName);
      const data = extractData(response);
      setDifficultyStats(data);
    } catch (err) {
      console.error('Failed to load difficulty stats:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load progress data
   */
  const loadProgressData = async () => {
    if (!playerName) return;
    
    setLoading(true);
    try {
      const response = await gameAPI.getPlayerProgress(playerName);
      const data = extractData(response);
      setProgressData(data);
    } catch (err) {
      console.error('Failed to load progress data:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load daily statistics
   */
  const loadDailyStats = async () => {
    if (!playerName) return;
    
    setLoading(true);
    try {
      const response = await gameAPI.getPlayerDailyStats(playerName, 30);
      const data = extractData(response);
      setDailyStats(data);
    } catch (err) {
      console.error('Failed to load daily stats:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle section change
   */
  const handleSectionChange = (section) => {
    setActiveSection(section);
    
    // Load data for the selected section
    switch (section) {
      case 'categories':
        loadCategoryStats();
        break;
      case 'difficulty':
        loadDifficultyStats();
        break;
      case 'progress':
        loadProgressData();
        break;
      case 'daily':
        loadDailyStats();
        break;
      default:
        break;
    }
  };

  // Load initial data when component mounts
  useEffect(() => {
    if (playerName) {
      loadCategoryStats();
    }
  }, [playerName]);

  if (!playerStats) {
    return (
      <div className="player-stats">
        <div className="player-stats__loading">
          <p>Loading player statistics...</p>
        </div>
      </div>
    );
  }

  const formatPercentage = (value) => {
    return value ? `${(value * 100).toFixed(1)}%` : '0%';
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  return (
    <div className="player-stats">
      <div className="player-stats__header">
        <h3 className="player-stats__title">Player: {playerName}</h3>
        <button 
          className="player-stats__refresh-btn"
          onClick={onRefresh}
          aria-label="Refresh statistics"
        >
          ↻
        </button>
      </div>

      <div className="player-stats__navigation">
        <button
          className={`player-stats__nav-btn ${activeSection === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSection('overview')}
        >
          Overview
        </button>
        <button
          className={`player-stats__nav-btn ${activeSection === 'categories' ? 'active' : ''}`}
          onClick={() => handleSectionChange('categories')}
        >
          Categories
        </button>
        <button
          className={`player-stats__nav-btn ${activeSection === 'difficulty' ? 'active' : ''}`}
          onClick={() => handleSectionChange('difficulty')}
        >
          Difficulty
        </button>
        <button
          className={`player-stats__nav-btn ${activeSection === 'progress' ? 'active' : ''}`}
          onClick={() => handleSectionChange('progress')}
        >
          Progress
        </button>
        <button
          className={`player-stats__nav-btn ${activeSection === 'daily' ? 'active' : ''}`}
          onClick={() => handleSectionChange('daily')}
        >
          Daily Stats
        </button>
      </div>

      <div className="player-stats__content">
        {activeSection === 'overview' && (
          <div className="player-stats__overview">
            <div className="player-stats__grid">
              <div className="player-stats__card">
                <h4>Games Played</h4>
                <p className="player-stats__value">{playerStats.total_games || 0}</p>
              </div>
              <div className="player-stats__card">
                <h4>Games Won</h4>
                <p className="player-stats__value">{playerStats.games_won || 0}</p>
              </div>
              <div className="player-stats__card">
                <h4>Win Rate</h4>
                <p className="player-stats__value">{formatPercentage(playerStats.win_rate)}</p>
              </div>
              <div className="player-stats__card">
                <h4>Average Score</h4>
                <p className="player-stats__value">{playerStats.average_score?.toFixed(1) || 0}</p>
              </div>
              <div className="player-stats__card">
                <h4>Best Score</h4>
                <p className="player-stats__value">{playerStats.best_score || 0}</p>
              </div>
              <div className="player-stats__card">
                <h4>Average Accuracy</h4>
                <p className="player-stats__value">{formatPercentage(playerStats.average_accuracy)}</p>
              </div>
              <div className="player-stats__card">
                <h4>Average Duration</h4>
                <p className="player-stats__value">{formatDuration(playerStats.average_duration_seconds)}</p>
              </div>
              <div className="player-stats__card">
                <h4>Total Play Time</h4>
                <p className="player-stats__value">{formatDuration(playerStats.total_play_time_seconds)}</p>
              </div>
            </div>

            {playerStats.favorite_categories && (
              <div className="player-stats__favorites">
                <h4>Favorite Categories</h4>
                <div className="player-stats__favorites-list">
                  {playerStats.favorite_categories.map((category, index) => (
                    <span key={index} className="player-stats__favorite-tag">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {playerStats.favorite_difficulty && (
              <div className="player-stats__favorites">
                <h4>Favorite Difficulty</h4>
                <p>Level {playerStats.favorite_difficulty}</p>
              </div>
            )}
          </div>
        )}

        {activeSection === 'categories' && (
          <div className="player-stats__categories">
            {loading ? (
              <p>Loading category statistics...</p>
            ) : categoryStats?.statistics ? (
              <div className="player-stats__category-list">
                {categoryStats.statistics.map((category, index) => (
                  <div key={index} className="player-stats__category-item">
                    <h4>{category.category}</h4>
                    <div className="player-stats__category-stats">
                      <span>Games: {category.games_played}</span>
                      <span>Wins: {category.games_won}</span>
                      <span>Win Rate: {formatPercentage(category.win_rate)}</span>
                      <span>Avg Score: {category.average_score?.toFixed(1) || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No category statistics available.</p>
            )}
          </div>
        )}

        {activeSection === 'difficulty' && (
          <div className="player-stats__difficulty">
            {loading ? (
              <p>Loading difficulty statistics...</p>
            ) : difficultyStats?.statistics ? (
              <div className="player-stats__difficulty-list">
                {difficultyStats.statistics.map((difficulty, index) => (
                  <div key={index} className="player-stats__difficulty-item">
                    <h4>Level {difficulty.difficulty_level}</h4>
                    <div className="player-stats__difficulty-stats">
                      <span>Games: {difficulty.games_played}</span>
                      <span>Wins: {difficulty.games_won}</span>
                      <span>Win Rate: {formatPercentage(difficulty.win_rate)}</span>
                      <span>Avg Score: {difficulty.average_score?.toFixed(1) || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No difficulty statistics available.</p>
            )}
          </div>
        )}

        {activeSection === 'progress' && (
          <div className="player-stats__progress">
            {loading ? (
              <p>Loading progress data...</p>
            ) : progressData ? (
              <div className="player-stats__progress-data">
                <div className="player-stats__progress-item">
                  <h4>Skill Level</h4>
                  <p>{progressData.skill_level || 'Beginner'}</p>
                </div>
                <div className="player-stats__progress-item">
                  <h4>Improvement Rate</h4>
                  <p>{formatPercentage(progressData.improvement_rate)}</p>
                </div>
                <div className="player-stats__progress-item">
                  <h4>Consistency Score</h4>
                  <p>{progressData.consistency_score?.toFixed(1) || 0}</p>
                </div>
              </div>
            ) : (
              <p>No progress data available.</p>
            )}
          </div>
        )}

        {activeSection === 'daily' && (
          <div className="player-stats__daily">
            {loading ? (
              <p>Loading daily statistics...</p>
            ) : dailyStats?.daily_stats ? (
              <div className="player-stats__daily-list">
                {dailyStats.daily_stats.slice(0, 10).map((day, index) => (
                  <div key={index} className="player-stats__daily-item">
                    <h4>{new Date(day.date).toLocaleDateString()}</h4>
                    <div className="player-stats__daily-stats">
                      <span>Games: {day.games_played}</span>
                      <span>Wins: {day.games_won}</span>
                      <span>Avg Score: {day.average_score?.toFixed(1) || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No daily statistics available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerStats; 