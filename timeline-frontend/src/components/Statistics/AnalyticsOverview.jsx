/**
 * Analytics Overview Component
 * @description Displays game analytics and system-wide statistics
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { gameAPI, extractData, handleAPIError } from '../../utils/api';
import './AnalyticsOverview.css';

/**
 * Analytics Overview Component
 * @param {Object} props - Component props
 * @param {Object} props.analyticsData - Analytics data
 * @param {Function} props.onRefresh - Function to refresh data
 * @returns {JSX.Element} Analytics overview component
 */
const AnalyticsOverview = ({ analyticsData, onRefresh }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [difficultyAnalytics, setDifficultyAnalytics] = useState(null);
  const [categoryAnalytics, setCategoryAnalytics] = useState(null);
  const [trendsData, setTrendsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  /**
   * Load categories for category analytics
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
   * Load difficulty analytics
   */
  const loadDifficultyAnalytics = async (level) => {
    setLoading(true);
    try {
      const response = await gameAPI.getDifficultyAnalytics(level);
      const data = extractData(response);
      setDifficultyAnalytics(data);
    } catch (err) {
      console.error('Failed to load difficulty analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load category analytics
   */
  const loadCategoryAnalytics = async (category) => {
    if (!category) return;
    
    setLoading(true);
    try {
      const response = await gameAPI.getCategoryAnalytics(category);
      const data = extractData(response);
      setCategoryAnalytics(data);
    } catch (err) {
      console.error('Failed to load category analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load trends data
   */
  const loadTrendsData = async () => {
    setLoading(true);
    try {
      const response = await gameAPI.getAnalyticsTrends('30d');
      const data = extractData(response);
      setTrendsData(data);
    } catch (err) {
      console.error('Failed to load trends data:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle section change
   */
  const handleSectionChange = (section) => {
    setActiveSection(section);
    
    switch (section) {
      case 'difficulty':
        loadDifficultyAnalytics(1);
        break;
      case 'category':
        if (selectedCategory) {
          loadCategoryAnalytics(selectedCategory);
        }
        break;
      case 'trends':
        loadTrendsData();
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
    if (activeSection === 'category') {
      loadCategoryAnalytics(category);
    }
  };

  /**
   * Handle difficulty level change
   */
  const handleDifficultyChange = (level) => {
    if (activeSection === 'difficulty') {
      loadDifficultyAnalytics(level);
    }
  };

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const formatPercentage = (value) => {
    return value ? `${(value * 100).toFixed(1)}%` : '0%';
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  const formatNumber = (num) => {
    return num ? num.toLocaleString() : '0';
  };

  return (
    <div className="analytics-overview">
      <div className="analytics-overview__header">
        <h3 className="analytics-overview__title">Game Analytics</h3>
        <button 
          className="analytics-overview__refresh-btn"
          onClick={onRefresh}
          aria-label="Refresh analytics"
        >
          ↻
        </button>
      </div>

      <div className="analytics-overview__navigation">
        <button
          className={`analytics-overview__nav-btn ${activeSection === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSection('overview')}
        >
          Overview
        </button>
        <button
          className={`analytics-overview__nav-btn ${activeSection === 'difficulty' ? 'active' : ''}`}
          onClick={() => handleSectionChange('difficulty')}
        >
          Difficulty
        </button>
        <button
          className={`analytics-overview__nav-btn ${activeSection === 'category' ? 'active' : ''}`}
          onClick={() => handleSectionChange('category')}
        >
          Categories
        </button>
        <button
          className={`analytics-overview__nav-btn ${activeSection === 'trends' ? 'active' : ''}`}
          onClick={() => handleSectionChange('trends')}
        >
          Trends
        </button>
      </div>

      <div className="analytics-overview__content">
        {activeSection === 'overview' && analyticsData && (
          <div className="analytics-overview__overview">
            <div className="analytics-overview__grid">
              <div className="analytics-overview__card">
                <h4>Total Games</h4>
                <p className="analytics-overview__value">{formatNumber(analyticsData.overall?.total_games)}</p>
              </div>
              <div className="analytics-overview__card">
                <h4>Completed Games</h4>
                <p className="analytics-overview__value">{formatNumber(analyticsData.overall?.completed_games)}</p>
              </div>
              <div className="analytics-overview__card">
                <h4>Completion Rate</h4>
                <p className="analytics-overview__value">{formatPercentage(analyticsData.overall?.completion_rate)}</p>
              </div>
              <div className="analytics-overview__card">
                <h4>Unique Players</h4>
                <p className="analytics-overview__value">{formatNumber(analyticsData.overall?.unique_players)}</p>
              </div>
              <div className="analytics-overview__card">
                <h4>Average Score</h4>
                <p className="analytics-overview__value">{analyticsData.overall?.average_score?.toFixed(1) || 0}</p>
              </div>
              <div className="analytics-overview__card">
                <h4>Average Duration</h4>
                <p className="analytics-overview__value">{formatDuration(analyticsData.overall?.average_duration_seconds)}</p>
              </div>
            </div>

            {analyticsData.difficulty_distribution && (
              <div className="analytics-overview__section">
                <h4>Difficulty Distribution</h4>
                <div className="analytics-overview__difficulty-list">
                  {analyticsData.difficulty_distribution.map((difficulty, index) => (
                    <div key={index} className="analytics-overview__difficulty-item">
                      <h5>Level {difficulty.difficulty_level}</h5>
                      <div className="analytics-overview__difficulty-stats">
                        <span>Games: {formatNumber(difficulty.games_played)}</span>
                        <span>Win Rate: {formatPercentage(difficulty.win_rate)}</span>
                        <span>Avg Score: {difficulty.average_score?.toFixed(1) || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analyticsData.category_performance && (
              <div className="analytics-overview__section">
                <h4>Category Performance</h4>
                <div className="analytics-overview__category-list">
                  {analyticsData.category_performance.slice(0, 5).map((category, index) => (
                    <div key={index} className="analytics-overview__category-item">
                      <h5>{category.category}</h5>
                      <div className="analytics-overview__category-stats">
                        <span>Games: {formatNumber(category.games_played)}</span>
                        <span>Win Rate: {formatPercentage(category.win_rate)}</span>
                        <span>Avg Score: {category.average_score?.toFixed(1) || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'difficulty' && (
          <div className="analytics-overview__difficulty">
            <div className="analytics-overview__difficulty-selector">
              <label htmlFor="difficulty-select">Select Difficulty Level:</label>
              <select
                id="difficulty-select"
                onChange={(e) => handleDifficultyChange(parseInt(e.target.value))}
                defaultValue="1"
              >
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
                <option value="3">Level 3</option>
                <option value="4">Level 4</option>
                <option value="5">Level 5</option>
              </select>
            </div>

            {loading ? (
              <p>Loading difficulty analytics...</p>
            ) : difficultyAnalytics ? (
              <div className="analytics-overview__difficulty-details">
                <div className="analytics-overview__difficulty-overview">
                  <h4>Difficulty Level {difficultyAnalytics.difficulty_level} Overview</h4>
                  <div className="analytics-overview__difficulty-grid">
                    <div className="analytics-overview__difficulty-stat">
                      <span>Total Games:</span>
                      <span>{formatNumber(difficultyAnalytics.total_games)}</span>
                    </div>
                    <div className="analytics-overview__difficulty-stat">
                      <span>Completion Rate:</span>
                      <span>{formatPercentage(difficultyAnalytics.completion_rate)}</span>
                    </div>
                    <div className="analytics-overview__difficulty-stat">
                      <span>Average Score:</span>
                      <span>{difficultyAnalytics.average_score?.toFixed(1) || 0}</span>
                    </div>
                    <div className="analytics-overview__difficulty-stat">
                      <span>Best Score:</span>
                      <span>{difficultyAnalytics.best_score || 0}</span>
                    </div>
                  </div>
                </div>

                {difficultyAnalytics.category_performance && (
                  <div className="analytics-overview__difficulty-categories">
                    <h4>Category Performance</h4>
                    <div className="analytics-overview__difficulty-category-list">
                      {difficultyAnalytics.category_performance.map((category, index) => (
                        <div key={index} className="analytics-overview__difficulty-category-item">
                          <h5>{category.category}</h5>
                          <div className="analytics-overview__difficulty-category-stats">
                            <span>Games: {formatNumber(category.games_played)}</span>
                            <span>Win Rate: {formatPercentage(category.win_rate)}</span>
                            <span>Avg Score: {category.average_score?.toFixed(1) || 0}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p>No difficulty analytics available.</p>
            )}
          </div>
        )}

        {activeSection === 'category' && (
          <div className="analytics-overview__category">
            <div className="analytics-overview__category-selector">
              <label htmlFor="category-analytics-select">Select Category:</label>
              <select
                id="category-analytics-select"
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

            {loading ? (
              <p>Loading category analytics...</p>
            ) : categoryAnalytics ? (
              <div className="analytics-overview__category-details">
                <h4>{selectedCategory} Analytics</h4>
                <div className="analytics-overview__category-overview">
                  <div className="analytics-overview__category-grid">
                    <div className="analytics-overview__category-stat">
                      <span>Total Games:</span>
                      <span>{formatNumber(categoryAnalytics.total_games)}</span>
                    </div>
                    <div className="analytics-overview__category-stat">
                      <span>Completion Rate:</span>
                      <span>{formatPercentage(categoryAnalytics.completion_rate)}</span>
                    </div>
                    <div className="analytics-overview__category-stat">
                      <span>Average Score:</span>
                      <span>{categoryAnalytics.average_score?.toFixed(1) || 0}</span>
                    </div>
                    <div className="analytics-overview__category-stat">
                      <span>Popularity Rank:</span>
                      <span>#{categoryAnalytics.popularity_rank || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p>No category analytics available.</p>
            )}
          </div>
        )}

        {activeSection === 'trends' && (
          <div className="analytics-overview__trends">
            {loading ? (
              <p>Loading trends data...</p>
            ) : trendsData ? (
              <div className="analytics-overview__trends-details">
                <h4>Game Trends (Last 30 Days)</h4>
                <div className="analytics-overview__trends-grid">
                  <div className="analytics-overview__trend-item">
                    <span>Player Growth:</span>
                    <span>{formatPercentage(trendsData.player_growth)}</span>
                  </div>
                  <div className="analytics-overview__trend-item">
                    <span>Game Activity:</span>
                    <span>{formatPercentage(trendsData.game_activity_change)}</span>
                  </div>
                  <div className="analytics-overview__trend-item">
                    <span>Score Improvement:</span>
                    <span>{formatPercentage(trendsData.score_improvement)}</span>
                  </div>
                  <div className="analytics-overview__trend-item">
                    <span>Retention Rate:</span>
                    <span>{formatPercentage(trendsData.retention_rate)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p>No trends data available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsOverview; 