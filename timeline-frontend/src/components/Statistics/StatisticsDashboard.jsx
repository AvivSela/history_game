/**
 * Statistics Dashboard Component
 * @description Main statistics dashboard displaying player stats, leaderboards, and analytics
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { gameAPI, extractData, handleAPIError } from '../../utils/api';
import PlayerStats from './PlayerStats';
import LeaderboardDisplay from './LeaderboardDisplay';
import AnalyticsOverview from './AnalyticsOverview';
import './StatisticsDashboard.css';

/**
 * Statistics Dashboard Component
 * @param {Object} props - Component props
 * @param {string} props.playerName - Current player name
 * @param {boolean} props.isVisible - Whether the dashboard is visible
 * @param {Function} props.onClose - Function to close the dashboard
 * @returns {JSX.Element} Statistics dashboard component
 */
const StatisticsDashboard = ({ playerName, isVisible, onClose }) => {
  const [activeTab, setActiveTab] = useState('player');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  /**
   * Load player statistics data
   */
  const loadPlayerStats = async () => {
    if (!playerName) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await gameAPI.getPlayerStatistics(playerName);
      const data = extractData(response);
      setPlayerStats(data);
    } catch (err) {
      setError(handleAPIError(err, 'Failed to load player statistics'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load leaderboard data
   */
  const loadLeaderboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [globalResponse, summaryResponse] = await Promise.all([
        gameAPI.getGlobalLeaderboard('score', 'desc', 20),
        gameAPI.getLeaderboardSummary()
      ]);
      
      setLeaderboardData({
        global: extractData(globalResponse),
        summary: extractData(summaryResponse)
      });
    } catch (err) {
      setError(handleAPIError(err, 'Failed to load leaderboard data'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load analytics data
   */
  const loadAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await gameAPI.getAnalyticsOverview();
      const data = extractData(response);
      setAnalyticsData(data);
    } catch (err) {
      setError(handleAPIError(err, 'Failed to load analytics data'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle tab change
   */
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null);
    
    // Load data for the selected tab
    switch (tab) {
      case 'player':
        loadPlayerStats();
        break;
      case 'leaderboard':
        loadLeaderboardData();
        break;
      case 'analytics':
        loadAnalyticsData();
        break;
      default:
        break;
    }
  };

  // Load initial data when component mounts or player changes
  useEffect(() => {
    if (isVisible && playerName) {
      loadPlayerStats();
    }
  }, [isVisible, playerName]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="statistics-dashboard">
      <div className="statistics-dashboard__header">
        <h2 className="statistics-dashboard__title">Game Statistics</h2>
        <button 
          className="statistics-dashboard__close-btn"
          onClick={onClose}
          aria-label="Close statistics dashboard"
        >
          ×
        </button>
      </div>

      <div className="statistics-dashboard__tabs">
        <button
          className={`statistics-dashboard__tab ${activeTab === 'player' ? 'active' : ''}`}
          onClick={() => handleTabChange('player')}
        >
          Player Stats
        </button>
        <button
          className={`statistics-dashboard__tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => handleTabChange('leaderboard')}
        >
          Leaderboards
        </button>
        <button
          className={`statistics-dashboard__tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => handleTabChange('analytics')}
        >
          Analytics
        </button>
      </div>

      <div className="statistics-dashboard__content">
        {error && (
          <div className="statistics-dashboard__error">
            <p>{error}</p>
            <button onClick={() => handleTabChange(activeTab)}>Retry</button>
          </div>
        )}

        {loading && (
          <div className="statistics-dashboard__loading">
            <div className="loading-spinner"></div>
            <p>Loading statistics...</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {activeTab === 'player' && (
              <PlayerStats 
                playerName={playerName}
                playerStats={playerStats}
                onRefresh={loadPlayerStats}
              />
            )}
            
            {activeTab === 'leaderboard' && (
              <LeaderboardDisplay 
                leaderboardData={leaderboardData}
                onRefresh={loadLeaderboardData}
              />
            )}
            
            {activeTab === 'analytics' && (
              <AnalyticsOverview 
                analyticsData={analyticsData}
                onRefresh={loadAnalyticsData}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StatisticsDashboard; 