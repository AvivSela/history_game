/**
 * Admin Routes
 * @description REST endpoints for admin dashboard and administrative functions
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const logger = require('../utils/logger');

/**
 * GET /api/admin/dashboard
 * Get admin dashboard overview data
 */
router.get('/dashboard', async (req, res) => {
  try {
    logger.info('🔧 Fetching admin dashboard data');
    
    // Get system overview
    const systemOverview = await query(`
      SELECT 
        COUNT(*) as total_games,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_games,
        COUNT(CASE WHEN status = 'abandoned' THEN 1 END) as abandoned_games,
        COUNT(DISTINCT player_name) as unique_players,
        COALESCE(AVG(score), 0) as average_score,
        COALESCE(AVG(duration_seconds), 0) as average_duration
      FROM game_sessions
    `);

    // Get recent activity (last 7 days)
    const recentActivity = await query(`
      SELECT 
        DATE(start_time) as date,
        COUNT(*) as games_played,
        COUNT(DISTINCT player_name) as active_players,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_games
      FROM game_sessions
      WHERE start_time >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(start_time)
      ORDER BY date DESC
    `);

    // Get top players
    const topPlayers = await query(`
      SELECT 
        player_name,
        COUNT(*) as games_played,
        COUNT(CASE WHEN status = 'completed' AND score > 0 THEN 1 END) as games_won,
        COALESCE(AVG(score), 0) as average_score,
        COALESCE(MAX(score), 0) as best_score,
        MAX(start_time) as last_played
      FROM game_sessions
      GROUP BY player_name
      ORDER BY games_played DESC, average_score DESC
      LIMIT 10
    `);

    // Get category popularity
    const categoryPopularity = await query(`
      SELECT 
        unnest(categories) as category,
        COUNT(*) as games_played,
        COUNT(CASE WHEN status = 'completed' AND score > 0 THEN 1 END) as games_won,
        COALESCE(AVG(score), 0) as average_score
      FROM game_sessions
      GROUP BY category
      ORDER BY games_played DESC
      LIMIT 10
    `);

    // Get difficulty distribution
    const difficultyDistribution = await query(`
      SELECT 
        difficulty_level,
        COUNT(*) as games_played,
        COUNT(CASE WHEN status = 'completed' AND score > 0 THEN 1 END) as games_won,
        COALESCE(AVG(score), 0) as average_score
      FROM game_sessions
      GROUP BY difficulty_level
      ORDER BY difficulty_level
    `);

    const dashboard = {
      system_overview: {
        total_games: parseInt(systemOverview.rows[0].total_games),
        completed_games: parseInt(systemOverview.rows[0].completed_games),
        abandoned_games: parseInt(systemOverview.rows[0].abandoned_games),
        unique_players: parseInt(systemOverview.rows[0].unique_players),
        completion_rate: systemOverview.rows[0].total_games > 0 
          ? parseFloat(((systemOverview.rows[0].completed_games / systemOverview.rows[0].total_games) * 100).toFixed(2))
          : 0,
        average_score: parseFloat((Number(systemOverview.rows[0].average_score) || 0).toFixed(2)),
        average_duration_seconds: parseInt(systemOverview.rows[0].average_duration)
      },
      recent_activity: recentActivity.rows.map(row => ({
        date: row.date,
        games_played: parseInt(row.games_played),
        active_players: parseInt(row.active_players),
        completed_games: parseInt(row.completed_games),
        completion_rate: row.games_played > 0 
          ? parseFloat(((row.completed_games / row.games_played) * 100).toFixed(2))
          : 0
      })),
      top_players: topPlayers.rows.map(row => ({
        player_name: row.player_name,
        games_played: parseInt(row.games_played),
        games_won: parseInt(row.games_won),
        win_rate: row.games_played > 0 
          ? parseFloat(((row.games_won / row.games_played) * 100).toFixed(2))
          : 0,
        average_score: parseFloat((Number(row.average_score) || 0).toFixed(2)),
        best_score: parseInt(row.best_score),
        last_played: row.last_played
      })),
      category_popularity: categoryPopularity.rows.map(row => ({
        category: row.category,
        games_played: parseInt(row.games_played),
        games_won: parseInt(row.games_won),
        win_rate: row.games_played > 0 
          ? parseFloat(((row.games_won / row.games_played) * 100).toFixed(2))
          : 0,
        average_score: parseFloat((Number(row.average_score) || 0).toFixed(2))
      })),
      difficulty_distribution: difficultyDistribution.rows.map(row => ({
        difficulty_level: parseInt(row.difficulty_level),
        games_played: parseInt(row.games_played),
        games_won: parseInt(row.games_won),
        win_rate: row.games_played > 0 
          ? parseFloat(((row.games_won / row.games_played) * 100).toFixed(2))
          : 0,
        average_score: parseFloat((Number(row.average_score) || 0).toFixed(2))
      }))
    };

    res.json({
      success: true,
      data: dashboard
    });

  } catch (error) {
    logger.error('Error fetching admin dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin dashboard'
    });
  }
});

/**
 * GET /api/admin/players
 * Get player management data
 */
router.get('/players', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    logger.info(`🔧 Fetching player management data: page=${page}, limit=${limit}, search=${search}`);
    
    let whereClause = '';
    let params = [];
    
    if (search && search.trim() !== '') {
      whereClause = 'WHERE player_name ILIKE $1';
      params.push(`%${search.trim()}%`);
    }
    
    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT player_name) as total
      FROM game_sessions
      ${whereClause}
    `;
    const countResult = await query(countQuery, params);
    const totalPlayers = parseInt(countResult.rows[0].total);
    
    // Get players with pagination
    const playersQuery = `
      SELECT 
        player_name,
        COUNT(*) as total_games,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_games,
        COUNT(CASE WHEN status = 'abandoned' THEN 1 END) as abandoned_games,
        COALESCE(AVG(score), 0) as average_score,
        COALESCE(MAX(score), 0) as best_score,
        MAX(start_time) as last_played,
        MIN(start_time) as first_played
      FROM game_sessions
      ${whereClause}
      GROUP BY player_name
      ORDER BY total_games DESC, average_score DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    const playersResult = await query(playersQuery, [...params, parseInt(limit), offset]);
    
    const players = playersResult.rows.map(row => ({
      player_name: row.player_name,
      total_games: parseInt(row.total_games),
      completed_games: parseInt(row.completed_games),
      abandoned_games: parseInt(row.abandoned_games),
      completion_rate: row.total_games > 0 
        ? parseFloat(((row.completed_games / row.total_games) * 100).toFixed(2))
        : 0,
      average_score: parseFloat((Number(row.average_score) || 0).toFixed(2)),
      best_score: parseInt(row.best_score),
      last_played: row.last_played,
      first_played: row.first_played
    }));

    res.json({
      success: true,
      data: {
        players: players,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalPlayers,
          pages: Math.ceil(totalPlayers / parseInt(limit))
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching player management data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch player management data'
    });
  }
});

/**
 * GET /api/admin/games
 * Get game session management data
 */
router.get('/games', async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '', player = '' } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    logger.info(`🔧 Fetching game session management data: page=${page}, limit=${limit}, status=${status}, player=${player}`);
    
    let whereConditions = [];
    let params = [];
    let paramIndex = 1;
    
    if (status && status.trim() !== '') {
      whereConditions.push(`status = $${paramIndex++}`);
      params.push(status.trim());
    }
    
    if (player && player.trim() !== '') {
      whereConditions.push(`player_name ILIKE $${paramIndex++}`);
      params.push(`%${player.trim()}%`);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM game_sessions
      ${whereClause}
    `;
    const countResult = await query(countQuery, params);
    const totalGames = parseInt(countResult.rows[0].total);
    
    // Get games with pagination
    const gamesQuery = `
      SELECT 
        id,
        player_name,
        difficulty_level,
        card_count,
        categories,
        status,
        score,
        total_moves,
        correct_moves,
        incorrect_moves,
        start_time,
        end_time,
        duration_seconds
      FROM game_sessions
      ${whereClause}
      ORDER BY start_time DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    const gamesResult = await query(gamesQuery, [...params, parseInt(limit), offset]);
    
    const games = gamesResult.rows.map(row => ({
      id: row.id,
      player_name: row.player_name,
      difficulty_level: parseInt(row.difficulty_level),
      card_count: parseInt(row.card_count),
      categories: row.categories,
      status: row.status,
      score: parseInt(row.score),
      total_moves: parseInt(row.total_moves),
      correct_moves: parseInt(row.correct_moves),
      incorrect_moves: parseInt(row.incorrect_moves),
      accuracy: row.total_moves > 0 
        ? parseFloat(((row.correct_moves / row.total_moves) * 100).toFixed(2))
        : 0,
      start_time: row.start_time,
      end_time: row.end_time,
      duration_seconds: parseInt(row.duration_seconds)
    }));

    res.json({
      success: true,
      data: {
        games: games,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalGames,
          pages: Math.ceil(totalGames / parseInt(limit))
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching game session management data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch game session management data'
    });
  }
});

/**
 * DELETE /api/admin/games/:id
 * Delete a specific game session (admin only)
 */
router.delete('/games/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    logger.info(`🔧 Admin deleting game session: ${id}`);
    
    // Check if game session exists
    const checkResult = await query('SELECT id FROM game_sessions WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found'
      });
    }
    
    // Delete the game session
    await query('DELETE FROM game_sessions WHERE id = $1', [id]);
    
    logger.info(`✅ Game session ${id} deleted successfully`);
    
    res.json({
      success: true,
      message: 'Game session deleted successfully'
    });

  } catch (error) {
    logger.error(`Error deleting game session ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete game session'
    });
  }
});

/**
 * GET /api/admin/system-health
 * Get system health and performance metrics
 */
router.get('/system-health', async (req, res) => {
  try {
    logger.info('🔧 Fetching system health metrics');
    
    // Get database performance metrics
    const dbMetrics = await query(`
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN start_time >= CURRENT_DATE - INTERVAL '1 hour' THEN 1 END) as sessions_last_hour,
        COUNT(CASE WHEN start_time >= CURRENT_DATE - INTERVAL '24 hours' THEN 1 END) as sessions_last_24h,
        COUNT(DISTINCT player_name) as active_players_24h,
        COALESCE(AVG(duration_seconds), 0) as avg_session_duration
      FROM game_sessions
    `);
    
    // Get error rates (if we had error logging)
    const errorMetrics = {
      total_errors: 0,
      errors_last_24h: 0,
      error_rate: 0
    };
    
    // Get system uptime and performance
    const systemMetrics = {
      uptime: process.uptime(),
      memory_usage: process.memoryUsage(),
      node_version: process.version,
      platform: process.platform
    };

    const health = {
      status: 'healthy',
      database: {
        total_sessions: parseInt(dbMetrics.rows[0].total_sessions),
        sessions_last_hour: parseInt(dbMetrics.rows[0].sessions_last_hour),
        sessions_last_24h: parseInt(dbMetrics.rows[0].sessions_last_24h),
        active_players_24h: parseInt(dbMetrics.rows[0].active_players_24h),
        avg_session_duration: parseInt(dbMetrics.rows[0].avg_session_duration)
      },
      errors: errorMetrics,
      system: systemMetrics,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: health
    });

  } catch (error) {
    logger.error('Error fetching system health:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system health'
    });
  }
});

/**
 * GET /api/admin/export/games
 * Export game sessions data
 */
router.get('/export/games', async (req, res) => {
  try {
    const { format = 'json', start_date, end_date, status } = req.query;
    
    logger.info(`🔧 Exporting games data: format=${format}, start_date=${start_date}, end_date=${end_date}, status=${status}`);
    
    let whereConditions = [];
    let params = [];
    let paramIndex = 1;
    
    if (start_date) {
      whereConditions.push(`start_time >= $${paramIndex++}`);
      params.push(start_date);
    }
    
    if (end_date) {
      whereConditions.push(`start_time <= $${paramIndex++}`);
      params.push(end_date);
    }
    
    if (status) {
      whereConditions.push(`status = $${paramIndex++}`);
      params.push(status);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    const gamesQuery = `
      SELECT 
        id,
        player_name,
        difficulty_level,
        card_count,
        categories,
        status,
        score,
        total_moves,
        correct_moves,
        incorrect_moves,
        start_time,
        end_time,
        duration_seconds,
        (correct_moves::float / NULLIF(total_moves, 0)) * 100 as accuracy
      FROM game_sessions
      ${whereClause}
      ORDER BY start_time DESC
    `;
    
    const gamesResult = await query(gamesQuery, params);
    
    const games = gamesResult.rows.map(row => ({
      id: row.id,
      player_name: row.player_name,
      difficulty_level: parseInt(row.difficulty_level),
      card_count: parseInt(row.card_count),
      categories: row.categories,
      status: row.status,
      score: parseInt(row.score),
      total_moves: parseInt(row.total_moves),
      correct_moves: parseInt(row.correct_moves),
      incorrect_moves: parseInt(row.incorrect_moves),
      accuracy: parseFloat((Number(row.accuracy) || 0).toFixed(2)),
      start_time: row.start_time,
      end_time: row.end_time,
      duration_seconds: parseInt(row.duration_seconds)
    }));

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = [
        'ID', 'Player Name', 'Difficulty Level', 'Card Count', 'Categories',
        'Status', 'Score', 'Total Moves', 'Correct Moves', 'Incorrect Moves',
        'Accuracy', 'Start Time', 'End Time', 'Duration (seconds)'
      ];
      
      const csvRows = games.map(game => [
        game.id,
        game.player_name,
        game.difficulty_level,
        game.card_count,
        game.categories.join(';'),
        game.status,
        game.score,
        game.total_moves,
        game.correct_moves,
        game.incorrect_moves,
        game.accuracy,
        game.start_time,
        game.end_time,
        game.duration_seconds
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="games_export_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } else {
      // JSON format
      res.json({
        success: true,
        data: {
          export_info: {
            format: 'json',
            total_records: games.length,
            export_date: new Date().toISOString(),
            filters: {
              start_date,
              end_date,
              status
            }
          },
          games: games
        }
      });
    }

  } catch (error) {
    logger.error('Error exporting games data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export games data'
    });
  }
});

/**
 * GET /api/admin/export/players
 * Export player statistics data
 */
router.get('/export/players', async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    
    logger.info(`🔧 Exporting players data: format=${format}`);
    
    const playersQuery = `
      SELECT 
        player_name,
        COUNT(*) as total_games,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_games,
        COUNT(CASE WHEN status = 'abandoned' THEN 1 END) as abandoned_games,
        COALESCE(AVG(score), 0) as average_score,
        COALESCE(MAX(score), 0) as best_score,
        COALESCE(MIN(score), 0) as worst_score,
        COALESCE(AVG(duration_seconds), 0) as average_duration,
        COALESCE(AVG(correct_moves::float / NULLIF(total_moves, 0)), 0) * 100 as average_accuracy,
        MAX(start_time) as last_played,
        MIN(start_time) as first_played
      FROM game_sessions
      GROUP BY player_name
      ORDER BY total_games DESC, average_score DESC
    `;
    
    const playersResult = await query(playersQuery);
    
    const players = playersResult.rows.map(row => ({
      player_name: row.player_name,
      total_games: parseInt(row.total_games),
      completed_games: parseInt(row.completed_games),
      abandoned_games: parseInt(row.abandoned_games),
      completion_rate: row.total_games > 0 
        ? parseFloat(((row.completed_games / row.total_games) * 100).toFixed(2))
        : 0,
      average_score: parseFloat((Number(row.average_score) || 0).toFixed(2)),
      best_score: parseInt(row.best_score),
      worst_score: parseInt(row.worst_score),
      average_duration_seconds: parseInt(row.average_duration),
      average_accuracy: parseFloat((Number(row.average_accuracy) || 0).toFixed(2)),
      last_played: row.last_played,
      first_played: row.first_played
    }));

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = [
        'Player Name', 'Total Games', 'Completed Games', 'Abandoned Games',
        'Completion Rate (%)', 'Average Score', 'Best Score', 'Worst Score',
        'Average Duration (seconds)', 'Average Accuracy (%)', 'Last Played', 'First Played'
      ];
      
      const csvRows = players.map(player => [
        player.player_name,
        player.total_games,
        player.completed_games,
        player.abandoned_games,
        player.completion_rate,
        player.average_score,
        player.best_score,
        player.worst_score,
        player.average_duration_seconds,
        player.average_accuracy,
        player.last_played,
        player.first_played
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="players_export_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } else {
      // JSON format
      res.json({
        success: true,
        data: {
          export_info: {
            format: 'json',
            total_records: players.length,
            export_date: new Date().toISOString()
          },
          players: players
        }
      });
    }

  } catch (error) {
    logger.error('Error exporting players data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export players data'
    });
  }
});

module.exports = router; 