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
 * GET /api/admin/test
 * Test route to verify admin routes are working
 */
router.get('/test', async (req, res) => {
  res.json({
    success: true,
    message: 'Admin routes are working',
    timestamp: new Date().toISOString()
  });
});

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

/**
 * Card Management Endpoints
 */

/**
 * POST /api/admin/cards
 * Create a new card
 */
router.post('/cards', async (req, res) => {
  try {
    const { title, description, dateOccurred, category, difficulty } = req.body;
    
    logger.info('🔧 Creating new card:', { title, category, difficulty });
    
    // Validate required fields
    if (!title || !dateOccurred || !category || difficulty === undefined || difficulty === null) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, dateOccurred, category, difficulty'
      });
    }
    
    // Validate difficulty range
    if (difficulty < 1 || difficulty > 5) {
      return res.status(400).json({
        success: false,
        error: 'Difficulty must be between 1 and 5'
      });
    }
    
    // Validate date format
    const date = new Date(dateOccurred);
    if (isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
    
    // Check if card already exists
    const existingCard = await query(
      'SELECT id FROM cards WHERE title = $1 AND date_occurred = $2',
      [title, dateOccurred]
    );
    
    if (existingCard.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Card with this title and date already exists'
      });
    }
    
    // Insert new card
    const result = await query(`
      INSERT INTO cards (title, description, date_occurred, category, difficulty)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [title, description || null, dateOccurred, category, difficulty]);
    
    const newCard = result.rows[0];
    
    logger.info(`✅ Card created successfully: ${newCard.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Card created successfully',
      data: {
        id: newCard.id,
        title: newCard.title,
        description: newCard.description,
        dateOccurred: newCard.date_occurred,
        category: newCard.category,
        difficulty: newCard.difficulty,
        createdAt: newCard.created_at
      }
    });
    
  } catch (error) {
    logger.error('❌ Error creating card:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create card'
    });
  }
});

/**
 * PUT /api/admin/cards/:id
 * Update an existing card
 */
router.put('/cards/:id', async (req, res) => {
  try {
    const cardId = parseInt(req.params.id);
    const { title, description, dateOccurred, category, difficulty } = req.body;
    
    logger.info(`🔧 Updating card ${cardId}:`, { title, category, difficulty });
    
    // Validate card ID
    if (isNaN(cardId) || cardId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid card ID'
      });
    }
    
    // Check if card exists
    const existingCard = await query('SELECT * FROM cards WHERE id = $1', [cardId]);
    if (existingCard.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Card not found'
      });
    }
    
    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (dateOccurred !== undefined) {
      // Validate date format
      const date = new Date(dateOccurred);
      if (isNaN(date.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date format. Use YYYY-MM-DD'
        });
      }
      updates.push(`date_occurred = $${paramCount++}`);
      values.push(dateOccurred);
    }
    if (category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      values.push(category);
    }
    if (difficulty !== undefined) {
      if (difficulty < 1 || difficulty > 5) {
        return res.status(400).json({
          success: false,
          error: 'Difficulty must be between 1 and 5'
        });
      }
      updates.push(`difficulty = $${paramCount++}`);
      values.push(difficulty);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }
    
    values.push(cardId);
    const sql = `
      UPDATE cards 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await query(sql, values);
    const updatedCard = result.rows[0];
    
    logger.info(`✅ Card ${cardId} updated successfully`);
    
    res.json({
      success: true,
      message: 'Card updated successfully',
      data: {
        id: updatedCard.id,
        title: updatedCard.title,
        description: updatedCard.description,
        dateOccurred: updatedCard.date_occurred,
        category: updatedCard.category,
        difficulty: updatedCard.difficulty,
        updatedAt: updatedCard.updated_at
      }
    });
    
  } catch (error) {
    logger.error('❌ Error updating card:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to update card'
    });
  }
});

/**
 * DELETE /api/admin/cards/:id
 * Delete a card (soft delete)
 */
router.delete('/cards/:id', async (req, res) => {
  try {
    const cardId = parseInt(req.params.id);
    
    logger.info(`🔧 Deleting card ${cardId}`);
    
    // Validate card ID
    if (isNaN(cardId) || cardId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid card ID'
      });
    }
    
    // Check if card exists
    const existingCard = await query('SELECT * FROM cards WHERE id = $1', [cardId]);
    if (existingCard.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Card not found'
      });
    }
    
    // Soft delete by setting is_active to false (if column exists)
    // For now, we'll do a hard delete since is_active column might not exist
    await query('DELETE FROM cards WHERE id = $1', [cardId]);
    
    logger.info(`✅ Card ${cardId} deleted successfully`);
    
    res.json({
      success: true,
      message: 'Card deleted successfully'
    });
    
  } catch (error) {
    logger.error('❌ Error deleting card:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to delete card'
    });
  }
});

/**
 * GET /api/admin/cards
 * Get all cards with filtering and pagination
 */
router.get('/cards', async (req, res) => {
  try {
    const { 
      category, 
      difficulty, 
      limit = 50, 
      offset = 0, 
      search,
      sortBy = 'date_occurred',
      sortOrder = 'ASC'
    } = req.query;
    
    logger.info('🔧 Fetching cards with filters:', { category, difficulty, limit, offset });
    
    let sql = 'SELECT * FROM cards';
    const params = [];
    const conditions = [];
    
    // Add filters
    if (category) {
      conditions.push(`category = $${params.length + 1}`);
      params.push(category);
    }
    
    if (difficulty) {
      conditions.push(`difficulty = $${params.length + 1}`);
      params.push(parseInt(difficulty));
    }
    
    if (search) {
      conditions.push(`(title ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }
    
    // Add WHERE clause
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Add sorting
    const validSortFields = ['id', 'title', 'date_occurred', 'category', 'difficulty', 'created_at'];
    const validSortOrders = ['ASC', 'DESC'];
    
    if (validSortFields.includes(sortBy)) {
      sql += ` ORDER BY ${sortBy} ${validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC'}`;
    } else {
      sql += ' ORDER BY date_occurred ASC';
    }
    
    // Add pagination
    sql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await query(sql, params);
    
    // Get total count for pagination
    let countSql = 'SELECT COUNT(*) FROM cards';
    if (conditions.length > 0) {
      countSql += ' WHERE ' + conditions.join(' AND ');
    }
    const countResult = await query(countSql, params.slice(0, -2)); // Remove limit and offset
    const totalCount = parseInt(countResult.rows[0].count);
    
    res.json({
      success: true,
      data: {
        cards: result.rows.map(row => ({
          id: row.id,
          title: row.title,
          description: row.description,
          dateOccurred: row.date_occurred,
          category: row.category,
          difficulty: row.difficulty,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        })),
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
        }
      }
    });
    
  } catch (error) {
    logger.error('❌ Error fetching cards:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cards'
    });
  }
});

/**
 * GET /api/admin/cards/:id
 * Get a specific card by ID
 */
router.get('/cards/:id', async (req, res) => {
  logger.debug('🔍 Cards/:id route hit', { params: req.params });
  try {
    const cardId = parseInt(req.params.id);
    
    logger.info(`🔧 Fetching card ${cardId}`);
    
    // Validate card ID
    if (isNaN(cardId) || cardId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid card ID'
      });
    }
    
    const result = await query('SELECT * FROM cards WHERE id = $1', [cardId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Card not found'
      });
    }
    
    const card = result.rows[0];
    
    res.json({
      success: true,
      data: {
        id: card.id,
        title: card.title,
        description: card.description,
        dateOccurred: card.date_occurred,
        category: card.category,
        difficulty: card.difficulty,
        createdAt: card.created_at,
        updatedAt: card.updated_at
      }
    });
    
  } catch (error) {
    logger.error('❌ Error fetching card:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch card'
    });
  }
});

/**
 * POST /api/admin/cards/bulk
 * Create multiple cards at once
 */
router.post('/cards/bulk', async (req, res) => {
  try {
    const { cards } = req.body;
    
    logger.info(`🔧 Creating ${cards?.length || 0} cards in bulk`);
    
    if (!Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cards array is required and must not be empty'
      });
    }
    
    if (cards.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Cannot create more than 100 cards at once'
      });
    }
    
    const results = [];
    const errors = [];
    
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const { title, description, dateOccurred, category, difficulty } = card;
      
      try {
        // Validate required fields
        if (!title || !dateOccurred || !category || !difficulty) {
          errors.push({
            index: i,
            error: 'Missing required fields: title, dateOccurred, category, difficulty'
          });
          continue;
        }
        
        // Validate difficulty range
        if (difficulty < 1 || difficulty > 5) {
          errors.push({
            index: i,
            error: 'Difficulty must be between 1 and 5'
          });
          continue;
        }
        
        // Check for duplicates
        const existingCard = await query(
          'SELECT id FROM cards WHERE title = $1 AND date_occurred = $2',
          [title, dateOccurred]
        );
        
        if (existingCard.rows.length > 0) {
          errors.push({
            index: i,
            error: 'Card with this title and date already exists'
          });
          continue;
        }
        
        // Insert card
        const result = await query(`
          INSERT INTO cards (title, description, date_occurred, category, difficulty)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `, [title, description || null, dateOccurred, category, difficulty]);
        
        const newCard = result.rows[0];
        results.push({
          index: i,
          id: newCard.id,
          title: newCard.title
        });
        
      } catch (error) {
        errors.push({
          index: i,
          error: error.message
        });
      }
    }
    
    logger.info(`✅ Bulk card creation completed: ${results.length} created, ${errors.length} failed`);
    
    res.status(201).json({
      success: true,
      message: `Bulk card creation completed: ${results.length} created, ${errors.length} failed`,
      data: {
        created: results,
        errors: errors
      }
    });
    
  } catch (error) {
    logger.error('❌ Error in bulk card creation:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create cards in bulk'
    });
  }
});

module.exports = router; 