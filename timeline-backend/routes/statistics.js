/**
 * Statistics Routes
 * @description REST endpoints for player statistics and analytics
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const statistics = require('../utils/statistics');
const leaderboards = require('../utils/leaderboards');
const logger = require('../utils/logger');
const StatisticsService = require('../services/StatisticsService');
const { shouldUsePrisma } = require('../utils/featureFlags');

/**
 * GET /api/statistics/player/:playerName
 * Get comprehensive statistics for a player
 */
router.get('/player/:playerName', async (req, res) => {
  try {
    const { playerName } = req.params;
    const { type = 'full' } = req.query; // 'basic', 'advanced', 'full'
    
    if (!playerName || playerName.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Player name is required'
      });
    }

    logger.info(`📊 Fetching statistics for player: ${playerName}, type: ${type}`);
    
    let playerStats;
    let source;
    
    if (shouldUsePrisma('statistics', type)) {
      const statisticsService = new StatisticsService();
      
      switch (type) {
        case 'basic':
          playerStats = await statisticsService.getPlayerBasicStats(playerName);
          source = 'prisma_basic';
          break;
        case 'advanced':
          playerStats = await statisticsService.getPlayerAdvancedStats(playerName);
          source = 'prisma_advanced';
          break;
        default:
          playerStats = await statisticsService.calculatePlayerStatistics(playerName);
          source = 'prisma_full';
          break;
      }
      
      // Add favorite categories and difficulty for all types
      const [favoriteCategories, favoriteDifficulty] = await Promise.all([
        statisticsService.getFavoriteCategories(playerName),
        statisticsService.getFavoriteDifficulty(playerName)
      ]);
      
      playerStats.favorite_categories = favoriteCategories;
      playerStats.favorite_difficulty = favoriteDifficulty;
    } else {
      // Use existing query builders for complex analytics
      const [stats, favoriteCategories, favoriteDifficulty] = await Promise.all([
        statistics.calculatePlayerStatistics(playerName),
        statistics.getFavoriteCategories(playerName),
        statistics.getFavoriteDifficulty(playerName)
      ]);
      
      playerStats = stats;
      playerStats.favorite_categories = favoriteCategories;
      playerStats.favorite_difficulty = favoriteDifficulty;
      source = 'query_builder';
    }

    res.json({
      success: true,
      source,
      type,
      data: playerStats
    });

  } catch (error) {
    logger.error('Error fetching player statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch player statistics'
    });
  }
});

/**
 * GET /api/statistics/player/:playerName/categories
 * Get category-specific statistics for a player
 */
router.get('/player/:playerName/categories', async (req, res) => {
  try {
    const { playerName } = req.params;
    const { category, type = 'basic' } = req.query;
    
    if (!playerName || playerName.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Player name is required'
      });
    }

    logger.info(`📊 Fetching category statistics for player: ${playerName}${category ? `, category: ${category}` : ''}, type: ${type}`);
    
    let categoryStats;
    let source;
    
    if (shouldUsePrisma('statistics', type)) {
      const statisticsService = new StatisticsService();
      categoryStats = await statisticsService.getCategoryStatistics(playerName, category);
      source = 'prisma';
    } else {
      categoryStats = await statistics.calculateCategoryStatistics(playerName, category);
      source = 'query_builder';
    }

    res.json({
      success: true,
      source,
      type,
      data: {
        player_name: playerName,
        category: category || 'all',
        statistics: categoryStats
      }
    });

  } catch (error) {
    logger.error('Error fetching category statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category statistics'
    });
  }
});

/**
 * GET /api/statistics/player/:playerName/difficulty
 * Get difficulty-level statistics for a player
 */
router.get('/player/:playerName/difficulty', async (req, res) => {
  try {
    const { playerName } = req.params;
    const { level, type = 'basic' } = req.query;
    
    if (!playerName || playerName.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Player name is required'
      });
    }

    // Validate difficulty level if provided
    if (level && (isNaN(level) || level < 1 || level > 5)) {
      return res.status(400).json({
        success: false,
        error: 'Difficulty level must be between 1 and 5'
      });
    }

    const difficultyLevel = level ? parseInt(level) : null;
    
    logger.info(`📊 Fetching difficulty statistics for player: ${playerName}${difficultyLevel ? `, level: ${difficultyLevel}` : ''}, type: ${type}`);
    
    let difficultyStats;
    let source;
    
    if (shouldUsePrisma('statistics', type)) {
      const statisticsService = new StatisticsService();
      difficultyStats = await statisticsService.getDifficultyStatistics(playerName, difficultyLevel);
      source = 'prisma';
    } else {
      difficultyStats = await statistics.calculateDifficultyStatistics(playerName, difficultyLevel);
      source = 'query_builder';
    }

    res.json({
      success: true,
      source,
      type,
      data: {
        player_name: playerName,
        difficulty_level: difficultyLevel || 'all',
        statistics: difficultyStats
      }
    });

  } catch (error) {
    logger.error('Error fetching difficulty statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch difficulty statistics'
    });
  }
});

/**
 * GET /api/statistics/player/:playerName/progress
 * Get player progression over time
 */
router.get('/player/:playerName/progress', async (req, res) => {
  try {
    const { playerName } = req.params;
    const { type = 'basic' } = req.query;
    
    if (!playerName || playerName.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Player name is required'
      });
    }

    logger.info(`📊 Fetching progression data for player: ${playerName}, type: ${type}`);
    
    let progression;
    let source;
    
    if (shouldUsePrisma('statistics', type)) {
      const statisticsService = new StatisticsService();
      progression = await statisticsService.getPlayerProgression(playerName);
      source = 'prisma';
    } else {
      progression = await statistics.calculatePlayerProgression(playerName);
      source = 'query_builder';
    }

    res.json({
      success: true,
      source,
      type,
      data: {
        player_name: playerName,
        ...progression
      }
    });

  } catch (error) {
    logger.error('Error fetching player progression:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch player progression'
    });
  }
});

/**
 * GET /api/statistics/player/:playerName/daily
 * Get daily performance trends for a player
 */
router.get('/player/:playerName/daily', async (req, res) => {
  try {
    const { playerName } = req.params;
    const { days = 30, type = 'basic' } = req.query;
    
    if (!playerName || playerName.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Player name is required'
      });
    }

    // Validate days parameter
    const daysNum = parseInt(days);
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
      return res.status(400).json({
        success: false,
        error: 'Days parameter must be between 1 and 365'
      });
    }

    logger.info(`📊 Fetching daily statistics for player: ${playerName}, days: ${daysNum}, type: ${type}`);
    
    let dailyStats;
    let source;
    
    if (shouldUsePrisma('statistics', type)) {
      const statisticsService = new StatisticsService();
      dailyStats = await statisticsService.getDailyStatistics(playerName, daysNum);
      source = 'prisma';
    } else {
      dailyStats = await statistics.calculateDailyStatistics(playerName, daysNum);
      source = 'query_builder';
    }

    res.json({
      success: true,
      source,
      type,
      data: {
        player_name: playerName,
        days: daysNum,
        statistics: dailyStats
      }
    });

  } catch (error) {
    logger.error('Error fetching daily statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch daily statistics'
    });
  }
});

/**
 * GET /api/statistics/player/:playerName/weekly
 * Get weekly performance trends for a player
 */
router.get('/player/:playerName/weekly', async (req, res) => {
  try {
    const { playerName } = req.params;
    const { weeks = 12, type = 'basic' } = req.query;
    
    if (!playerName || playerName.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Player name is required'
      });
    }

    // Validate weeks parameter
    const weeksNum = parseInt(weeks);
    if (isNaN(weeksNum) || weeksNum < 1 || weeksNum > 52) {
      return res.status(400).json({
        success: false,
        error: 'Weeks parameter must be between 1 and 52'
      });
    }

    logger.info(`📊 Fetching weekly statistics for player: ${playerName}, weeks: ${weeksNum}, type: ${type}`);
    
    let weeklyStats;
    let source;
    
    if (shouldUsePrisma('statistics', type)) {
      const statisticsService = new StatisticsService();
      weeklyStats = await statisticsService.getWeeklyStatistics(playerName, weeksNum);
      source = 'prisma';
    } else {
      weeklyStats = await statistics.calculateWeeklyStatistics(playerName, weeksNum);
      source = 'query_builder';
    }

    res.json({
      success: true,
      source,
      type,
      data: {
        player_name: playerName,
        weeks: weeksNum,
        statistics: weeklyStats
      }
    });

  } catch (error) {
    logger.error('Error fetching weekly statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weekly statistics'
    });
  }
});

/**
 * GET /api/statistics/player/:playerName/summary
 * Get a comprehensive summary of player statistics
 */
router.get('/player/:playerName/summary', async (req, res) => {
  try {
    const { playerName } = req.params;
    
    if (!playerName || playerName.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Player name is required'
      });
    }

    logger.info(`📊 Fetching comprehensive summary for player: ${playerName}`);
    
    // Get all statistics in parallel
    const [
      playerStats,
      categoryStats,
      difficultyStats,
      favoriteCategories,
      favoriteDifficulty,
      progression
    ] = await Promise.all([
      statistics.calculatePlayerStatistics(playerName),
      statistics.calculateCategoryStatistics(playerName),
      statistics.calculateDifficultyStatistics(playerName),
      statistics.getFavoriteCategories(playerName),
      statistics.getFavoriteDifficulty(playerName),
      statistics.calculatePlayerProgression(playerName)
    ]);

    // Create summary object
    const summary = {
      player_name: playerName,
      overview: {
        ...playerStats,
        favorite_categories: favoriteCategories,
        favorite_difficulty: favoriteDifficulty
      },
      categories: {
        total_categories: categoryStats.length,
        statistics: categoryStats
      },
      difficulties: {
        total_difficulties: difficultyStats.length,
        statistics: difficultyStats
      },
      progression: {
        total_games: progression.total_games,
        improvement: progression.improvement
      },
      recent_performance: {
        last_30_days: await statistics.calculateDailyStatistics(playerName, 30),
        last_12_weeks: await statistics.calculateWeeklyStatistics(playerName, 12)
      }
    };

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    logger.error('Error fetching player summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch player summary'
    });
  }
});

/**
 * GET /api/statistics/players
 * Get statistics for multiple players (for comparison)
 */
router.get('/players', async (req, res) => {
  try {
    const { players } = req.query;
    
    if (!players) {
      return res.status(400).json({
        success: false,
        error: 'Players parameter is required (comma-separated list)'
      });
    }

    const playerNames = players.split(',').map(name => name.trim()).filter(name => name);
    
    if (playerNames.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one valid player name is required'
      });
    }

    if (playerNames.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 players can be compared at once'
      });
    }

    logger.info(`📊 Fetching comparison statistics for players: ${playerNames.join(', ')}`);
    
    // Get statistics for all players in parallel
    const playerStatsPromises = playerNames.map(async (playerName) => {
      try {
        const stats = await statistics.calculatePlayerStatistics(playerName);
        return {
          player_name: playerName,
          ...stats
        };
      } catch (error) {
        logger.error(`Error fetching stats for player ${playerName}:`, error);
        return {
          player_name: playerName,
          error: 'Failed to fetch statistics'
        };
      }
    });

    const playerStats = await Promise.all(playerStatsPromises);

    res.json({
      success: true,
      data: {
        players: playerNames,
        statistics: playerStats,
        comparison: {
          total_players: playerNames.length,
          best_score: Math.max(...playerStats.filter(p => !p.error).map(p => p.best_score)),
          highest_win_rate: Math.max(...playerStats.filter(p => !p.error).map(p => p.win_rate)),
          most_games: Math.max(...playerStats.filter(p => !p.error).map(p => p.total_games_played))
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching player comparison:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch player comparison'
    });
  }
});

// ============================================================================
// LEADERBOARD ENDPOINTS
// ============================================================================

/**
 * GET /api/statistics/leaderboards/global
 * Get global leaderboard
 */
router.get('/leaderboards/global', async (req, res) => {
  try {
    const { limit = 100, sortBy = 'score', order = 'desc' } = req.query;
    
    // Validate parameters
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Limit must be between 1 and 1000'
      });
    }

    logger.info(`🏆 Fetching global leaderboard: limit=${limitNum}, sortBy=${sortBy}, order=${order}`);
    
    const leaderboard = await leaderboards.getGlobalLeaderboard(limitNum, sortBy, order);

    res.json({
      success: true,
      data: {
        type: 'global',
        sort_by: sortBy,
        order: order,
        limit: limitNum,
        total_players: leaderboard.length,
        leaderboard: leaderboard
      }
    });

  } catch (error) {
    logger.error('Error fetching global leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch global leaderboard'
    });
  }
});

/**
 * GET /api/statistics/leaderboards/category/:category
 * Get category-specific leaderboard
 */
router.get('/leaderboards/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 50, sortBy = 'score', order = 'desc' } = req.query;
    
    if (!category || category.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Category is required'
      });
    }

    // Validate parameters
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 500) {
      return res.status(400).json({
        success: false,
        error: 'Limit must be between 1 and 500'
      });
    }

    logger.info(`🏆 Fetching category leaderboard: category=${category}, limit=${limitNum}, sortBy=${sortBy}, order=${order}`);
    
    const leaderboard = await leaderboards.getCategoryLeaderboard(category, limitNum, sortBy, order);

    res.json({
      success: true,
      data: {
        type: 'category',
        category: category,
        sort_by: sortBy,
        order: order,
        limit: limitNum,
        total_players: leaderboard.length,
        leaderboard: leaderboard
      }
    });

  } catch (error) {
    logger.error(`Error fetching category leaderboard for ${req.params.category}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category leaderboard'
    });
  }
});

/**
 * GET /api/statistics/leaderboards/daily
 * Get daily leaderboard (last 24 hours)
 */
router.get('/leaderboards/daily', async (req, res) => {
  try {
    const { limit = 50, sortBy = 'score', order = 'desc' } = req.query;
    
    // Validate parameters
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 500) {
      return res.status(400).json({
        success: false,
        error: 'Limit must be between 1 and 500'
      });
    }

    logger.info(`🏆 Fetching daily leaderboard: limit=${limitNum}, sortBy=${sortBy}, order=${order}`);
    
    const leaderboard = await leaderboards.getDailyLeaderboard(limitNum, sortBy, order);

    res.json({
      success: true,
      data: {
        type: 'daily',
        date: new Date().toISOString().split('T')[0],
        sort_by: sortBy,
        order: order,
        limit: limitNum,
        total_players: leaderboard.length,
        leaderboard: leaderboard
      }
    });

  } catch (error) {
    logger.error('Error fetching daily leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch daily leaderboard'
    });
  }
});

/**
 * GET /api/statistics/leaderboards/weekly
 * Get weekly leaderboard (current week)
 */
router.get('/leaderboards/weekly', async (req, res) => {
  try {
    const { limit = 50, sortBy = 'score', order = 'desc' } = req.query;
    
    // Validate parameters
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 500) {
      return res.status(400).json({
        success: false,
        error: 'Limit must be between 1 and 500'
      });
    }

    logger.info(`🏆 Fetching weekly leaderboard: limit=${limitNum}, sortBy=${sortBy}, order=${order}`);
    
    const leaderboard = await leaderboards.getWeeklyLeaderboard(limitNum, sortBy, order);

    res.json({
      success: true,
      data: {
        type: 'weekly',
        week_start_date: new Date().toISOString().split('T')[0],
        sort_by: sortBy,
        order: order,
        limit: limitNum,
        total_players: leaderboard.length,
        leaderboard: leaderboard
      }
    });

  } catch (error) {
    logger.error('Error fetching weekly leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weekly leaderboard'
    });
  }
});

/**
 * GET /api/statistics/leaderboards/player/:playerName
 * Get player's ranking across all leaderboards
 */
router.get('/leaderboards/player/:playerName', async (req, res) => {
  try {
    const { playerName } = req.params;
    
    if (!playerName || playerName.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Player name is required'
      });
    }

    logger.info(`🏆 Fetching player rankings for: ${playerName}`);
    
    const rankings = await leaderboards.getPlayerRankings(playerName);

    res.json({
      success: true,
      data: {
        player_name: playerName,
        rankings: rankings
      }
    });

  } catch (error) {
    logger.error(`Error fetching player rankings for ${req.params.playerName}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch player rankings'
    });
  }
});

/**
 * GET /api/statistics/leaderboards/summary
 * Get leaderboard summary statistics
 */
router.get('/leaderboards/summary', async (req, res) => {
  try {
    logger.info('🏆 Fetching leaderboard summary');
    
    const summary = await leaderboards.getLeaderboardSummary();

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    logger.error('Error fetching leaderboard summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard summary'
    });
  }
});

module.exports = router; 