import React, { useState, useEffect } from 'react';
import { gameAPI, extractData, handleAPIError } from '../../utils/api';
import { API } from '../../constants/gameConstants';

/**
 * GameStats - Component for displaying real-time game statistics
 *
 * This component fetches and displays current game statistics from the backend,
 * including player performance, game progress, and achievement tracking.
 *
 * @component
 * @example
 * ```jsx
 * <GameStats playerName="Player" />
 * ```
 *
 * @param {Object} props - Component props
 * @param {string} props.playerName - Name of the player to fetch stats for
 * @param {boolean} [props.showDetails=true] - Whether to show detailed statistics
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Game statistics display
 */
const GameStats = ({ 
  playerName = 'Player', 
  showDetails = true, 
  className = '' 
}) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  /**
   * Fetch player statistics from backend
   */
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await gameAPI.getPlayerStatistics(playerName);
      const data = extractData(response);
      
      setStats(data);
      setLastUpdated(new Date());
    } catch (error) {
      const errorMessage = handleAPIError(error, 'Failed to load statistics');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats on mount and when player name changes
  useEffect(() => {
    if (playerName) {
      fetchStats();
    }
  }, [playerName]);

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerName && !loading) {
        fetchStats();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [playerName, loading]);

  if (loading) {
    return (
      <div className={`game-stats loading ${className}`}>
              <div className="stats-loading">
        <div className="loading-spinner" data-testid="loading-spinner"></div>
        <span>Loading statistics...</span>
      </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`game-stats error ${className}`}>
        <div className="stats-error">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{error}</span>
          <button 
            className="retry-button"
            onClick={fetchStats}
            aria-label="Retry loading statistics"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`game-stats empty ${className}`}>
        <div className="stats-empty">
          <span>No statistics available</span>
        </div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatPercentage = (value) => {
    return `${Math.round(value * 100)}%`;
  };

  return (
    <div className={`game-stats ${className}`}>
      <div className="stats-header">
        <h3 className="stats-title">Game Statistics</h3>
        <div className="stats-player">
          <span className="player-name">{stats.player_name}</span>
          {lastUpdated && (
            <span className="last-updated">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="stats-grid">
        {/* Overview Stats */}
        <div className="stats-section overview">
          <h4 className="section-title">Overview</h4>
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-label">Games Played</span>
              <span className="stat-value">{stats.total_games_played}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Games Won</span>
              <span className="stat-value">{stats.total_games_won}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Win Rate</span>
              <span className="stat-value">{formatPercentage(stats.win_rate)}</span>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="stats-section performance">
          <h4 className="section-title">Performance</h4>
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-label">Total Score</span>
              <span className="stat-value">{stats.total_score.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Best Score</span>
              <span className="stat-value">{stats.best_score.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Avg Score</span>
              <span className="stat-value">{Math.round(stats.average_score_per_game).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Gameplay Stats */}
        <div className="stats-section gameplay">
          <h4 className="section-title">Gameplay</h4>
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-label">Total Moves</span>
              <span className="stat-value">{stats.total_moves}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Accuracy</span>
              <span className="stat-value">{formatPercentage(stats.average_accuracy)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Avg Duration</span>
              <span className="stat-value">{formatTime(stats.average_game_duration_seconds)}</span>
            </div>
          </div>
        </div>

        {/* Detailed Stats (if enabled) */}
        {showDetails && (
          <>
            {/* Move Breakdown */}
            <div className="stats-section moves">
              <h4 className="section-title">Move Breakdown</h4>
              <div className="stats-row">
                <div className="stat-item">
                  <span className="stat-label">Correct Moves</span>
                  <span className="stat-value correct">{stats.total_correct_moves}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Incorrect Moves</span>
                  <span className="stat-value incorrect">{stats.total_incorrect_moves}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Play Time</span>
                  <span className="stat-value">{formatTime(stats.total_play_time_seconds)}</span>
                </div>
              </div>
            </div>

            {/* Category Performance */}
            {stats.favorite_categories && stats.favorite_categories.length > 0 && (
              <div className="stats-section categories">
                <h4 className="section-title">Favorite Categories</h4>
                <div className="category-list">
                  {stats.favorite_categories.map((category, index) => (
                    <div key={index} className="category-item">
                      <span className="category-name">{category.category}</span>
                      <span className="category-count">{category.play_count} games</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Difficulty Performance */}
            {stats.favorite_difficulty && (
              <div className="stats-section difficulty">
                <h4 className="section-title">Preferred Difficulty</h4>
                <div className="difficulty-item">
                  <span className="difficulty-level">Level {stats.favorite_difficulty.difficulty_level}</span>
                  <span className="difficulty-count">{stats.favorite_difficulty.play_count} games</span>
                </div>
              </div>
            )}

            {/* Activity Timeline */}
            <div className="stats-section activity">
              <h4 className="section-title">Activity</h4>
              <div className="activity-info">
                <div className="activity-item">
                  <span className="activity-label">First Game</span>
                  <span className="activity-value">
                    {stats.first_played_at ? new Date(stats.first_played_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="activity-item">
                  <span className="activity-label">Last Game</span>
                  <span className="activity-value">
                    {stats.last_played_at ? new Date(stats.last_played_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="stats-footer">
        <button 
          className="refresh-button"
          onClick={fetchStats}
          aria-label="Refresh statistics"
        >
          🔄 Refresh
        </button>
      </div>
    </div>
  );
};

export default GameStats; 