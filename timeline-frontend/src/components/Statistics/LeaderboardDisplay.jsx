/**
 * Leaderboard Display Component
 * @description Displays global and category leaderboards with player rankings
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { gameAPI, extractData, handleAPIError } from '../../utils/api';
import './LeaderboardDisplay.css';

/**
 * Leaderboard Display Component
 * @param {Object} props - Component props
 * @param {Object} props.leaderboardData - Leaderboard data
 * @param {Function} props.onRefresh - Function to refresh data
 * @returns {JSX.Element} Leaderboard display component
 */
const LeaderboardDisplay = ({ leaderboardData, onRefresh }) => {
  const [activeLeaderboard, setActiveLeaderboard] = useState('global');
  const [categoryLeaderboard, setCategoryLeaderboard] = useState(null);
  const [dailyLeaderboard, setDailyLeaderboard] = useState(null);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  /**
   * Load categories for category leaderboard
   */
  const loadCategories = async () => {
    try {
      const response = await gameAPI.getCategories();
      const data = extractData(response);
      setCategories(data);
      if (data.length > 0) {
        setSelectedCategory(data[0]);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  /**
   * Load category leaderboard
   */
  const loadCategoryLeaderboard = async (category) => {
    if (!category) return;
    
    setLoading(true);
    try {
      const response = await gameAPI.getCategoryLeaderboard(category, 'score', 'desc', 20);
      const data = extractData(response);
      setCategoryLeaderboard(data);
    } catch (err) {
      console.error('Failed to load category leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load daily leaderboard
   */
  const loadDailyLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await gameAPI.getDailyLeaderboard(20);
      const data = extractData(response);
      setDailyLeaderboard(data);
    } catch (err) {
      console.error('Failed to load daily leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load weekly leaderboard
   */
  const loadWeeklyLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await gameAPI.getWeeklyLeaderboard(20);
      const data = extractData(response);
      setWeeklyLeaderboard(data);
    } catch (err) {
      console.error('Failed to load weekly leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle leaderboard change
   */
  const handleLeaderboardChange = (leaderboard) => {
    setActiveLeaderboard(leaderboard);
    
    switch (leaderboard) {
      case 'category':
        if (selectedCategory) {
          loadCategoryLeaderboard(selectedCategory);
        }
        break;
      case 'daily':
        loadDailyLeaderboard();
        break;
      case 'weekly':
        loadWeeklyLeaderboard();
        break;
      default:
        break;
    }
  };

  /**
   * Handle category selection
   */
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (activeLeaderboard === 'category') {
      loadCategoryLeaderboard(category);
    }
  };

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const formatScore = (score) => {
    return score ? score.toFixed(1) : '0';
  };

  const formatAccuracy = (accuracy) => {
    return accuracy ? `${(accuracy * 100).toFixed(1)}%` : '0%';
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const renderLeaderboardTable = (data, title) => {
    if (!data || !data.leaderboard) {
      return <p>No leaderboard data available.</p>;
    }

    return (
      <div className="leaderboard-table">
        <h3>{title}</h3>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Score</th>
              <th>Games</th>
              <th>Win Rate</th>
              <th>Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {data.leaderboard.map((player, index) => (
              <tr key={index} className={index < 3 ? 'leaderboard-top' : ''}>
                <td className="leaderboard-rank">
                  <span className="rank-icon">{getRankIcon(index + 1)}</span>
                </td>
                <td className="leaderboard-player">{player.player_name}</td>
                <td className="leaderboard-score">{formatScore(player.score)}</td>
                <td className="leaderboard-games">{player.games_played}</td>
                <td className="leaderboard-winrate">{formatAccuracy(player.win_rate)}</td>
                <td className="leaderboard-accuracy">{formatAccuracy(player.accuracy)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="leaderboard-display">
      <div className="leaderboard-display__header">
        <h3 className="leaderboard-display__title">Leaderboards</h3>
        <button 
          className="leaderboard-display__refresh-btn"
          onClick={onRefresh}
          aria-label="Refresh leaderboards"
        >
          ↻
        </button>
      </div>

      <div className="leaderboard-display__navigation">
        <button
          className={`leaderboard-display__nav-btn ${activeLeaderboard === 'global' ? 'active' : ''}`}
          onClick={() => setActiveLeaderboard('global')}
        >
          Global
        </button>
        <button
          className={`leaderboard-display__nav-btn ${activeLeaderboard === 'category' ? 'active' : ''}`}
          onClick={() => handleLeaderboardChange('category')}
        >
          Category
        </button>
        <button
          className={`leaderboard-display__nav-btn ${activeLeaderboard === 'daily' ? 'active' : ''}`}
          onClick={() => handleLeaderboardChange('daily')}
        >
          Daily
        </button>
        <button
          className={`leaderboard-display__nav-btn ${activeLeaderboard === 'weekly' ? 'active' : ''}`}
          onClick={() => handleLeaderboardChange('weekly')}
        >
          Weekly
        </button>
      </div>

      {activeLeaderboard === 'category' && (
        <div className="leaderboard-display__category-selector">
          <label htmlFor="category-select">Select Category:</label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="leaderboard-display__content">
        {loading && (
          <div className="leaderboard-display__loading">
            <p>Loading leaderboard...</p>
          </div>
        )}

        {!loading && (
          <>
            {activeLeaderboard === 'global' && leaderboardData?.global && (
              renderLeaderboardTable(leaderboardData.global, 'Global Leaderboard')
            )}

            {activeLeaderboard === 'category' && categoryLeaderboard && (
              renderLeaderboardTable(categoryLeaderboard, `${selectedCategory} Leaderboard`)
            )}

            {activeLeaderboard === 'daily' && dailyLeaderboard && (
              renderLeaderboardTable(dailyLeaderboard, 'Daily Leaderboard')
            )}

            {activeLeaderboard === 'weekly' && weeklyLeaderboard && (
              renderLeaderboardTable(weeklyLeaderboard, 'Weekly Leaderboard')
            )}
          </>
        )}

        {leaderboardData?.summary && (
          <div className="leaderboard-display__summary">
            <h4>Leaderboard Summary</h4>
            <div className="leaderboard-summary-grid">
              <div className="summary-item">
                <span className="summary-label">Total Players:</span>
                <span className="summary-value">{leaderboardData.summary.total_players}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Active Players:</span>
                <span className="summary-value">{leaderboardData.summary.active_players}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Average Score:</span>
                <span className="summary-value">{formatScore(leaderboardData.summary.average_score)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Top Score:</span>
                <span className="summary-value">{formatScore(leaderboardData.summary.top_score)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardDisplay; 