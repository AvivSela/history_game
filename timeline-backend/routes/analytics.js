/**
 * Analytics Routes
 * @description REST endpoints for game analytics and reporting
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const logger = require('../utils/logger');

/**
 * GET /api/analytics/overview
 * Get overall game analytics overview
 */
router.get('/overview', async (req, res) => {
  try {
    logger.info('📊 Fetching game analytics overview');
    
    // Get overall statistics
    const overallStats = await query(`
      SELECT 
        COUNT(*) as total_games,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_games,
        COUNT(CASE WHEN status = 'abandoned' THEN 1 END) as abandoned_games,
        COUNT(DISTINCT player_name) as unique_players,
        COALESCE(AVG(score), 0) as average_score,
        COALESCE(AVG(duration_seconds), 0) as average_duration,
        COALESCE(AVG(total_moves), 0) as average_moves,
        COALESCE(AVG(correct_moves::float / NULLIF(total_moves, 0)), 0) * 100 as average_accuracy
      FROM game_sessions
    `);

    // Get difficulty distribution
    const difficultyStats = await query(`
      SELECT 
        difficulty_level,
        COUNT(*) as games_played,
        COUNT(CASE WHEN status = 'completed' AND score > 0 THEN 1 END) as games_won,
        COALESCE(AVG(score), 0) as average_score,
        COALESCE(AVG(duration_seconds), 0) as average_duration,
        COALESCE(AVG(correct_moves::float / NULLIF(total_moves, 0)), 0) * 100 as average_accuracy
      FROM game_sessions
      GROUP BY difficulty_level
      ORDER BY difficulty_level
    `);

    // Get category performance
    const categoryStats = await query(`
      SELECT 
        unnest(categories) as category,
        COUNT(*) as games_played,
        COUNT(CASE WHEN status = 'completed' AND score > 0 THEN 1 END) as games_won,
        COALESCE(AVG(score), 0) as average_score,
        COALESCE(AVG(duration_seconds), 0) as average_duration,
        COALESCE(AVG(correct_moves::float / NULLIF(total_moves, 0)), 0) * 100 as average_accuracy
      FROM game_sessions
      GROUP BY category
      ORDER BY games_played DESC
    `);

    // Get recent activity (last 30 days)
    const recentActivity = await query(`
      SELECT 
        DATE(start_time) as date,
        COUNT(*) as games_played,
        COUNT(DISTINCT player_name) as active_players,
        COALESCE(AVG(score), 0) as average_score
      FROM game_sessions
      WHERE start_time >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(start_time)
      ORDER BY date DESC
      LIMIT 30
    `);

    const overview = {
      overall: {
        total_games: parseInt(overallStats.rows[0].total_games),
        completed_games: parseInt(overallStats.rows[0].completed_games),
        abandoned_games: parseInt(overallStats.rows[0].abandoned_games),
        unique_players: parseInt(overallStats.rows[0].unique_players),
        completion_rate: overallStats.rows[0].total_games > 0 
          ? parseFloat(((overallStats.rows[0].completed_games / overallStats.rows[0].total_games) * 100).toFixed(2))
          : 0,
        average_score: parseFloat((Number(overallStats.rows[0].average_score) || 0).toFixed(2)),
        average_duration_seconds: parseInt(overallStats.rows[0].average_duration),
        average_moves: parseFloat((Number(overallStats.rows[0].average_moves) || 0).toFixed(2)),
        average_accuracy: parseFloat((Number(overallStats.rows[0].average_accuracy) || 0).toFixed(2))
      },
      difficulty_distribution: difficultyStats.rows.map(row => ({
        difficulty_level: parseInt(row.difficulty_level),
        games_played: parseInt(row.games_played),
        games_won: parseInt(row.games_won),
        win_rate: row.games_played > 0 
          ? parseFloat(((row.games_won / row.games_played) * 100).toFixed(2))
          : 0,
        average_score: parseFloat((Number(row.average_score) || 0).toFixed(2)),
        average_duration_seconds: parseInt(row.average_duration),
        average_accuracy: parseFloat((Number(row.average_accuracy) || 0).toFixed(2))
      })),
      category_performance: categoryStats.rows.map(row => ({
        category: row.category,
        games_played: parseInt(row.games_played),
        games_won: parseInt(row.games_won),
        win_rate: row.games_played > 0 
          ? parseFloat(((row.games_won / row.games_played) * 100).toFixed(2))
          : 0,
        average_score: parseFloat((Number(row.average_score) || 0).toFixed(2)),
        average_duration_seconds: parseInt(row.average_duration),
        average_accuracy: parseFloat((Number(row.average_accuracy) || 0).toFixed(2))
      })),
      recent_activity: recentActivity.rows.map(row => ({
        date: row.date,
        games_played: parseInt(row.games_played),
        active_players: parseInt(row.active_players),
        average_score: parseFloat((Number(row.average_score) || 0).toFixed(2))
      }))
    };

    res.json({
      success: true,
      data: overview
    });

  } catch (error) {
    logger.error('Error fetching analytics overview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics overview'
    });
  }
});

/**
 * GET /api/analytics/difficulty/:level
 * Get detailed analytics for a specific difficulty level
 */
router.get('/difficulty/:level', async (req, res) => {
  try {
    const { level } = req.params;
    
    // Validate difficulty level
    const difficultyLevel = parseInt(level);
    if (isNaN(difficultyLevel) || difficultyLevel < 1 || difficultyLevel > 5) {
      return res.status(400).json({
        success: false,
        error: 'Difficulty level must be between 1 and 5'
      });
    }

    logger.info(`📊 Fetching analytics for difficulty level: ${difficultyLevel}`);
    
    // Get difficulty-specific statistics
    const difficultyStats = await query(`
      SELECT 
        COUNT(*) as total_games,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_games,
        COUNT(CASE WHEN status = 'abandoned' THEN 1 END) as abandoned_games,
        COUNT(DISTINCT player_name) as unique_players,
        COALESCE(AVG(score), 0) as average_score,
        COALESCE(AVG(duration_seconds), 0) as average_duration,
        COALESCE(AVG(total_moves), 0) as average_moves,
        COALESCE(AVG(correct_moves::float / NULLIF(total_moves, 0)), 0) * 100 as average_accuracy,
        COALESCE(MAX(score), 0) as best_score,
        COALESCE(MIN(score), 0) as worst_score
      FROM game_sessions
      WHERE difficulty_level = $1
    `, [difficultyLevel]);

    // Get category performance for this difficulty
    const categoryStats = await query(`
      SELECT 
        unnest(categories) as category,
        COUNT(*) as games_played,
        COUNT(CASE WHEN status = 'completed' AND score > 0 THEN 1 END) as games_won,
        COALESCE(AVG(score), 0) as average_score,
        COALESCE(AVG(duration_seconds), 0) as average_duration,
        COALESCE(AVG(correct_moves::float / NULLIF(total_moves, 0)), 0) * 100 as average_accuracy
      FROM game_sessions
      WHERE difficulty_level = $1
      GROUP BY category
      ORDER BY games_played DESC
    `, [difficultyLevel]);

    // Get player performance distribution
    const playerStats = await query(`
      SELECT 
        player_name,
        COUNT(*) as games_played,
        COUNT(CASE WHEN status = 'completed' AND score > 0 THEN 1 END) as games_won,
        COALESCE(AVG(score), 0) as average_score,
        COALESCE(MAX(score), 0) as best_score,
        COALESCE(AVG(correct_moves::float / NULLIF(total_moves, 0)), 0) * 100 as average_accuracy
      FROM game_sessions
      WHERE difficulty_level = $1
      GROUP BY player_name
      ORDER BY average_score DESC
      LIMIT 20
    `, [difficultyLevel]);

    // Get recent activity for this difficulty
    const recentActivity = await query(`
      SELECT 
        DATE(start_time) as date,
        COUNT(*) as games_played,
        COUNT(DISTINCT player_name) as active_players,
        COALESCE(AVG(score), 0) as average_score
      FROM game_sessions
      WHERE difficulty_level = $1 AND start_time >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(start_time)
      ORDER BY date DESC
      LIMIT 30
    `, [difficultyLevel]);

    const stats = difficultyStats.rows[0];
    const analytics = {
      difficulty_level: difficultyLevel,
      overview: {
        total_games: parseInt(stats.total_games),
        completed_games: parseInt(stats.completed_games),
        abandoned_games: parseInt(stats.abandoned_games),
        unique_players: parseInt(stats.unique_players),
        completion_rate: stats.total_games > 0 
          ? parseFloat(((stats.completed_games / stats.total_games) * 100).toFixed(2))
          : 0,
        average_score: parseFloat((Number(stats.average_score) || 0).toFixed(2)),
        average_duration_seconds: parseInt(stats.average_duration),
        average_moves: parseFloat((Number(stats.average_moves) || 0).toFixed(2)),
        average_accuracy: parseFloat((Number(stats.average_accuracy) || 0).toFixed(2)),
        best_score: parseInt(stats.best_score),
        worst_score: parseInt(stats.worst_score)
      },
      category_performance: categoryStats.rows.map(row => ({
        category: row.category,
        games_played: parseInt(row.games_played),
        games_won: parseInt(row.games_won),
        win_rate: row.games_played > 0 
          ? parseFloat(((row.games_won / row.games_played) * 100).toFixed(2))
          : 0,
        average_score: parseFloat((Number(row.average_score) || 0).toFixed(2)),
        average_duration_seconds: parseInt(row.average_duration),
        average_accuracy: parseFloat((Number(row.average_accuracy) || 0).toFixed(2))
      })),
      top_players: playerStats.rows.map(row => ({
        player_name: row.player_name,
        games_played: parseInt(row.games_played),
        games_won: parseInt(row.games_won),
        win_rate: row.games_played > 0 
          ? parseFloat(((row.games_won / row.games_played) * 100).toFixed(2))
          : 0,
        average_score: parseFloat((Number(row.average_score) || 0).toFixed(2)),
        best_score: parseInt(row.best_score),
        average_accuracy: parseFloat((Number(row.average_accuracy) || 0).toFixed(2))
      })),
      recent_activity: recentActivity.rows.map(row => ({
        date: row.date,
        games_played: parseInt(row.games_played),
        active_players: parseInt(row.active_players),
        average_score: parseFloat((Number(row.average_score) || 0).toFixed(2))
      }))
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    logger.error(`Error fetching analytics for difficulty level ${req.params.level}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch difficulty analytics'
    });
  }
});

/**
 * GET /api/analytics/category/:category
 * Get detailed analytics for a specific category
 */
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    if (!category || category.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Category is required'
      });
    }

    logger.info(`📊 Fetching analytics for category: ${category}`);
    
    // Get category-specific statistics
    const categoryStats = await query(`
      SELECT 
        COUNT(*) as total_games,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_games,
        COUNT(CASE WHEN status = 'abandoned' THEN 1 END) as abandoned_games,
        COUNT(DISTINCT player_name) as unique_players,
        COALESCE(AVG(score), 0) as average_score,
        COALESCE(AVG(duration_seconds), 0) as average_duration,
        COALESCE(AVG(total_moves), 0) as average_moves,
        COALESCE(AVG(correct_moves::float / NULLIF(total_moves, 0)), 0) * 100 as average_accuracy,
        COALESCE(MAX(score), 0) as best_score,
        COALESCE(MIN(score), 0) as worst_score
      FROM game_sessions
      WHERE $1 = ANY(categories)
    `, [category]);

    // Get difficulty performance for this category
    const difficultyStats = await query(`
      SELECT 
        difficulty_level,
        COUNT(*) as games_played,
        COUNT(CASE WHEN status = 'completed' AND score > 0 THEN 1 END) as games_won,
        COALESCE(AVG(score), 0) as average_score,
        COALESCE(AVG(duration_seconds), 0) as average_duration,
        COALESCE(AVG(correct_moves::float / NULLIF(total_moves, 0)), 0) * 100 as average_accuracy
      FROM game_sessions
      WHERE $1 = ANY(categories)
      GROUP BY difficulty_level
      ORDER BY difficulty_level
    `, [category]);

    // Get player performance for this category
    const playerStats = await query(`
      SELECT 
        player_name,
        COUNT(*) as games_played,
        COUNT(CASE WHEN status = 'completed' AND score > 0 THEN 1 END) as games_won,
        COALESCE(AVG(score), 0) as average_score,
        COALESCE(MAX(score), 0) as best_score,
        COALESCE(AVG(correct_moves::float / NULLIF(total_moves, 0)), 0) * 100 as average_accuracy
      FROM game_sessions
      WHERE $1 = ANY(categories)
      GROUP BY player_name
      ORDER BY average_score DESC
      LIMIT 20
    `, [category]);

    // Get recent activity for this category
    const recentActivity = await query(`
      SELECT 
        DATE(start_time) as date,
        COUNT(*) as games_played,
        COUNT(DISTINCT player_name) as active_players,
        COALESCE(AVG(score), 0) as average_score
      FROM game_sessions
      WHERE $1 = ANY(categories) AND start_time >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(start_time)
      ORDER BY date DESC
      LIMIT 30
    `, [category]);

    const stats = categoryStats.rows[0];
    const analytics = {
      category: category,
      overview: {
        total_games: parseInt(stats.total_games),
        completed_games: parseInt(stats.completed_games),
        abandoned_games: parseInt(stats.abandoned_games),
        unique_players: parseInt(stats.unique_players),
        completion_rate: stats.total_games > 0 
          ? parseFloat(((stats.completed_games / stats.total_games) * 100).toFixed(2))
          : 0,
        average_score: parseFloat((Number(stats.average_score) || 0).toFixed(2)),
        average_duration_seconds: parseInt(stats.average_duration),
        average_moves: parseFloat((Number(stats.average_moves) || 0).toFixed(2)),
        average_accuracy: parseFloat((Number(stats.average_accuracy) || 0).toFixed(2)),
        best_score: parseInt(stats.best_score),
        worst_score: parseInt(stats.worst_score)
      },
      difficulty_performance: difficultyStats.rows.map(row => ({
        difficulty_level: parseInt(row.difficulty_level),
        games_played: parseInt(row.games_played),
        games_won: parseInt(row.games_won),
        win_rate: row.games_played > 0 
          ? parseFloat(((row.games_won / row.games_played) * 100).toFixed(2))
          : 0,
        average_score: parseFloat((Number(row.average_score) || 0).toFixed(2)),
        average_duration_seconds: parseInt(row.average_duration),
        average_accuracy: parseFloat((Number(row.average_accuracy) || 0).toFixed(2))
      })),
      top_players: playerStats.rows.map(row => ({
        player_name: row.player_name,
        games_played: parseInt(row.games_played),
        games_won: parseInt(row.games_won),
        win_rate: row.games_played > 0 
          ? parseFloat(((row.games_won / row.games_played) * 100).toFixed(2))
          : 0,
        average_score: parseFloat((Number(row.average_score) || 0).toFixed(2)),
        best_score: parseInt(row.best_score),
        average_accuracy: parseFloat((Number(row.average_accuracy) || 0).toFixed(2))
      })),
      recent_activity: recentActivity.rows.map(row => ({
        date: row.date,
        games_played: parseInt(row.games_played),
        active_players: parseInt(row.active_players),
        average_score: parseFloat((Number(row.average_score) || 0).toFixed(2))
      }))
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    logger.error(`Error fetching analytics for category ${req.params.category}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category analytics'
    });
  }
});

/**
 * GET /api/analytics/trends
 * Get game trends over time
 */
router.get('/trends', async (req, res) => {
  try {
    const { days = 30, interval = 'day' } = req.query;
    
    // Validate parameters
    const daysNum = parseInt(days);
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
      return res.status(400).json({
        success: false,
        error: 'Days parameter must be between 1 and 365'
      });
    }

    if (!['day', 'week', 'month'].includes(interval)) {
      return res.status(400).json({
        success: false,
        error: 'Interval must be day, week, or month'
      });
    }

    logger.info(`📊 Fetching game trends: ${daysNum} days, ${interval} interval`);
    
    let timeGroup, timeFormat;
    switch (interval) {
      case 'day':
        timeGroup = 'DATE(start_time)';
        timeFormat = 'YYYY-MM-DD';
        break;
      case 'week':
        timeGroup = 'DATE_TRUNC(\'week\', start_time)';
        timeFormat = 'YYYY-MM-DD';
        break;
      case 'month':
        timeGroup = 'DATE_TRUNC(\'month\', start_time)';
        timeFormat = 'YYYY-MM';
        break;
    }

    const trends = await query(`
      SELECT 
        ${timeGroup} as time_period,
        COUNT(*) as games_played,
        COUNT(DISTINCT player_name) as active_players,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_games,
        COALESCE(AVG(score), 0) as average_score,
        COALESCE(AVG(duration_seconds), 0) as average_duration,
        COALESCE(AVG(correct_moves::float / NULLIF(total_moves, 0)), 0) * 100 as average_accuracy
      FROM game_sessions
      WHERE start_time >= CURRENT_DATE - INTERVAL '${daysNum} days'
      GROUP BY ${timeGroup}
      ORDER BY time_period DESC
    `);

    const trendData = trends.rows.map(row => ({
      time_period: row.time_period,
      games_played: parseInt(row.games_played),
      active_players: parseInt(row.active_players),
      completed_games: parseInt(row.completed_games),
      completion_rate: row.games_played > 0 
        ? parseFloat(((row.completed_games / row.games_played) * 100).toFixed(2))
        : 0,
      average_score: parseFloat((Number(row.average_score) || 0).toFixed(2)),
      average_duration_seconds: parseInt(row.average_duration),
      average_accuracy: parseFloat((Number(row.average_accuracy) || 0).toFixed(2))
    }));

    res.json({
      success: true,
      data: {
        period: `${daysNum} days`,
        interval: interval,
        trends: trendData
      }
    });

  } catch (error) {
    logger.error('Error fetching game trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch game trends'
    });
  }
});

module.exports = router; 