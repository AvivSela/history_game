/**
 * Statistics Calculation Utilities
 * @description Utilities for calculating player statistics and analytics
 * @version 1.0.0
 */

const { query } = require('../config/database');
const logger = require('./logger');

/**
 * Calculate player statistics from game sessions
 * @param {string} playerName - Name of the player
 * @returns {Promise<Object>} Player statistics
 */
async function calculatePlayerStatistics(playerName) {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) as total_games,
        COUNT(CASE WHEN status = 'completed' AND score > 0 THEN 1 END) as games_won,
        COUNT(CASE WHEN status = 'completed' AND score = 0 THEN 1 END) as games_lost,
        COUNT(CASE WHEN status = 'abandoned' THEN 1 END) as games_abandoned,
        COALESCE(SUM(score), 0) as total_score,
        COALESCE(SUM(total_moves), 0) as total_moves,
        COALESCE(SUM(correct_moves), 0) as total_correct_moves,
        COALESCE(SUM(incorrect_moves), 0) as total_incorrect_moves,
        COALESCE(SUM(duration_seconds), 0) as total_play_time,
        COALESCE(AVG(score), 0) as average_score,
        COALESCE(MAX(score), 0) as best_score,
        COALESCE(MIN(score), 0) as worst_score,
        COALESCE(AVG(duration_seconds), 0) as average_duration,
        MAX(end_time) as last_played_at,
        MIN(start_time) as first_played_at
      FROM game_sessions 
      WHERE player_name = $1
    `, [playerName]);

    const stats = result.rows[0];
    
    // Calculate accuracy percentage
    const accuracy = stats.total_moves > 0 
      ? (stats.total_correct_moves / stats.total_moves) * 100 
      : 0;

    // Calculate win rate
    const winRate = stats.total_games > 0 
      ? (stats.games_won / stats.total_games) * 100 
      : 0;

    return {
      player_name: playerName,
      total_games_played: parseInt(stats.total_games),
      total_games_won: parseInt(stats.games_won),
      total_games_lost: parseInt(stats.games_lost),
      total_games_abandoned: parseInt(stats.games_abandoned),
      total_score: parseInt(stats.total_score),
      total_moves: parseInt(stats.total_moves),
      total_correct_moves: parseInt(stats.total_correct_moves),
      total_incorrect_moves: parseInt(stats.total_incorrect_moves),
      total_play_time_seconds: parseInt(stats.total_play_time),
      average_score_per_game: parseFloat((Number(stats.average_score) || 0).toFixed(2)),
      average_accuracy: parseFloat(accuracy.toFixed(2)),
      best_score: parseInt(stats.best_score),
      worst_score: parseInt(stats.worst_score),
      average_game_duration_seconds: parseInt(stats.average_duration),
      win_rate: parseFloat(winRate.toFixed(2)),
      last_played_at: stats.last_played_at,
      first_played_at: stats.first_played_at
    };
  } catch (error) {
    logger.error('Error calculating player statistics:', error);
    throw error;
  }
}

/**
 * Calculate category-specific statistics for a player
 * @param {string} playerName - Name of the player
 * @param {string} category - Category to analyze (optional, if not provided returns all categories)
 * @returns {Promise<Array>} Category statistics
 */
async function calculateCategoryStatistics(playerName, category = null) {
  try {
    let sql = `
      SELECT 
        unnest(categories) as category,
        COUNT(*) as games_played,
        COUNT(CASE WHEN status = 'completed' AND score > 0 THEN 1 END) as games_won,
        COALESCE(SUM(score), 0) as total_score,
        COALESCE(SUM(total_moves), 0) as total_moves,
        COALESCE(SUM(correct_moves), 0) as correct_moves,
        COALESCE(SUM(incorrect_moves), 0) as incorrect_moves,
        COALESCE(AVG(score), 0) as average_score,
        COALESCE(MAX(score), 0) as best_score,
        COALESCE(AVG(duration_seconds), 0) as average_duration,
        MAX(end_time) as last_played_at
      FROM game_sessions 
      WHERE player_name = $1
    `;
    
    const params = [playerName];
    
    if (category) {
      sql += ` AND $2 = ANY(categories)`;
      params.push(category);
    }
    
    sql += ` GROUP BY category ORDER BY games_played DESC`;

    const result = await query(sql, params);
    
    return result.rows.map(row => {
      const accuracy = row.total_moves > 0 
        ? (row.correct_moves / row.total_moves) * 100 
        : 0;
      
      const winRate = row.games_played > 0 
        ? (row.games_won / row.games_played) * 100 
        : 0;

      return {
        category: row.category,
        games_played: parseInt(row.games_played),
        games_won: parseInt(row.games_won),
        total_score: parseInt(row.total_score),
        total_moves: parseInt(row.total_moves),
        correct_moves: parseInt(row.correct_moves),
        incorrect_moves: parseInt(row.incorrect_moves),
        average_score: parseFloat(row.average_score.toFixed(2)),
        accuracy: parseFloat(accuracy.toFixed(2)),
        best_score: parseInt(row.best_score),
        average_game_duration_seconds: parseInt(row.average_duration),
        win_rate: parseFloat(winRate.toFixed(2)),
        last_played_at: row.last_played_at
      };
    });
  } catch (error) {
    logger.error('Error calculating category statistics:', error);
    throw error;
  }
}

/**
 * Calculate difficulty-level statistics for a player
 * @param {string} playerName - Name of the player
 * @param {number} difficultyLevel - Difficulty level to analyze (optional, if not provided returns all levels)
 * @returns {Promise<Array>} Difficulty statistics
 */
async function calculateDifficultyStatistics(playerName, difficultyLevel = null) {
  try {
    let sql = `
      SELECT 
        difficulty_level,
        COUNT(*) as games_played,
        COUNT(CASE WHEN status = 'completed' AND score > 0 THEN 1 END) as games_won,
        COALESCE(SUM(score), 0) as total_score,
        COALESCE(SUM(total_moves), 0) as total_moves,
        COALESCE(SUM(correct_moves), 0) as correct_moves,
        COALESCE(SUM(incorrect_moves), 0) as incorrect_moves,
        COALESCE(AVG(score), 0) as average_score,
        COALESCE(MAX(score), 0) as best_score,
        COALESCE(AVG(duration_seconds), 0) as average_duration,
        MAX(end_time) as last_played_at
      FROM game_sessions 
      WHERE player_name = $1
    `;
    
    const params = [playerName];
    
    if (difficultyLevel) {
      sql += ` AND difficulty_level = $2`;
      params.push(difficultyLevel);
    }
    
    sql += ` GROUP BY difficulty_level ORDER BY difficulty_level`;

    const result = await query(sql, params);
    
    return result.rows.map(row => {
      const accuracy = row.total_moves > 0 
        ? (row.correct_moves / row.total_moves) * 100 
        : 0;
      
      const winRate = row.games_played > 0 
        ? (row.games_won / row.games_played) * 100 
        : 0;

      return {
        difficulty_level: parseInt(row.difficulty_level),
        games_played: parseInt(row.games_played),
        games_won: parseInt(row.games_won),
        total_score: parseInt(row.total_score),
        total_moves: parseInt(row.total_moves),
        correct_moves: parseInt(row.correct_moves),
        incorrect_moves: parseInt(row.incorrect_moves),
        average_score: parseFloat(row.average_score.toFixed(2)),
        accuracy: parseFloat(accuracy.toFixed(2)),
        best_score: parseInt(row.best_score),
        average_game_duration_seconds: parseInt(row.average_duration),
        win_rate: parseFloat(winRate.toFixed(2)),
        last_played_at: row.last_played_at
      };
    });
  } catch (error) {
    logger.error('Error calculating difficulty statistics:', error);
    throw error;
  }
}

/**
 * Calculate daily performance trends for a player
 * @param {string} playerName - Name of the player
 * @param {number} days - Number of days to look back (default: 30)
 * @returns {Promise<Array>} Daily statistics
 */
async function calculateDailyStatistics(playerName, days = 30) {
  try {
    const result = await query(`
      SELECT 
        DATE(end_time) as date,
        COUNT(*) as games_played,
        COUNT(CASE WHEN status = 'completed' AND score > 0 THEN 1 END) as games_won,
        COALESCE(SUM(score), 0) as total_score,
        COALESCE(SUM(total_moves), 0) as total_moves,
        COALESCE(SUM(correct_moves), 0) as correct_moves,
        COALESCE(SUM(incorrect_moves), 0) as incorrect_moves,
        COALESCE(AVG(score), 0) as average_score,
        COALESCE(SUM(duration_seconds), 0) as total_play_time
      FROM game_sessions 
      WHERE player_name = $1 
        AND end_time >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(end_time)
      ORDER BY date DESC
    `, [playerName]);
    
    return result.rows.map(row => {
      const accuracy = row.total_moves > 0 
        ? (row.correct_moves / row.total_moves) * 100 
        : 0;
      
      const winRate = row.games_played > 0 
        ? (row.games_won / row.games_played) * 100 
        : 0;

      return {
        date: row.date,
        games_played: parseInt(row.games_played),
        games_won: parseInt(row.games_won),
        total_score: parseInt(row.total_score),
        total_moves: parseInt(row.total_moves),
        correct_moves: parseInt(row.correct_moves),
        incorrect_moves: parseInt(row.incorrect_moves),
        average_score: parseFloat(row.average_score.toFixed(2)),
        accuracy: parseFloat(accuracy.toFixed(2)),
        total_play_time_seconds: parseInt(row.total_play_time),
        win_rate: parseFloat(winRate.toFixed(2))
      };
    });
  } catch (error) {
    logger.error('Error calculating daily statistics:', error);
    throw error;
  }
}

/**
 * Calculate weekly performance trends for a player
 * @param {string} playerName - Name of the player
 * @param {number} weeks - Number of weeks to look back (default: 12)
 * @returns {Promise<Array>} Weekly statistics
 */
async function calculateWeeklyStatistics(playerName, weeks = 12) {
  try {
    const result = await query(`
      SELECT 
        EXTRACT(YEAR FROM end_time) as year,
        EXTRACT(WEEK FROM end_time) as week,
        COUNT(*) as games_played,
        COUNT(CASE WHEN status = 'completed' AND score > 0 THEN 1 END) as games_won,
        COALESCE(SUM(score), 0) as total_score,
        COALESCE(SUM(total_moves), 0) as total_moves,
        COALESCE(SUM(correct_moves), 0) as correct_moves,
        COALESCE(SUM(incorrect_moves), 0) as incorrect_moves,
        COALESCE(AVG(score), 0) as average_score,
        COALESCE(SUM(duration_seconds), 0) as total_play_time
      FROM game_sessions 
      WHERE player_name = $1 
        AND end_time >= CURRENT_DATE - INTERVAL '${weeks * 7} days'
      GROUP BY EXTRACT(YEAR FROM end_time), EXTRACT(WEEK FROM end_time)
      ORDER BY year DESC, week DESC
    `, [playerName]);
    
    return result.rows.map(row => {
      const accuracy = row.total_moves > 0 
        ? (row.correct_moves / row.total_moves) * 100 
        : 0;
      
      const winRate = row.games_played > 0 
        ? (row.games_won / row.games_played) * 100 
        : 0;

      return {
        year: parseInt(row.year),
        week: parseInt(row.week),
        games_played: parseInt(row.games_played),
        games_won: parseInt(row.games_won),
        total_score: parseInt(row.total_score),
        total_moves: parseInt(row.total_moves),
        correct_moves: parseInt(row.correct_moves),
        incorrect_moves: parseInt(row.incorrect_moves),
        average_score: parseFloat(row.average_score.toFixed(2)),
        accuracy: parseFloat(accuracy.toFixed(2)),
        total_play_time_seconds: parseInt(row.total_play_time),
        win_rate: parseFloat(winRate.toFixed(2))
      };
    });
  } catch (error) {
    logger.error('Error calculating weekly statistics:', error);
    throw error;
  }
}

/**
 * Calculate player progression over time
 * @param {string} playerName - Name of the player
 * @returns {Promise<Object>} Progression data
 */
async function calculatePlayerProgression(playerName) {
  try {
    const result = await query(`
      SELECT 
        start_time,
        score,
        difficulty_level,
        total_moves,
        correct_moves,
        duration_seconds
      FROM game_sessions 
      WHERE player_name = $1 
        AND status = 'completed'
      ORDER BY start_time ASC
    `, [playerName]);

    const progression = result.rows.map((row, index) => ({
      game_number: index + 1,
      date: row.start_time,
      score: parseInt(row.score),
      difficulty_level: parseInt(row.difficulty_level),
      total_moves: parseInt(row.total_moves),
      correct_moves: parseInt(row.correct_moves),
      accuracy: row.total_moves > 0 ? (row.correct_moves / row.total_moves) * 100 : 0,
      duration_seconds: parseInt(row.duration_seconds)
    }));

    // Calculate trends
    const recentGames = progression.slice(-10);
    const earlyGames = progression.slice(0, 10);
    
    const recentAvgScore = recentGames.length > 0 
      ? recentGames.reduce((sum, game) => sum + game.score, 0) / recentGames.length 
      : 0;
    
    const earlyAvgScore = earlyGames.length > 0 
      ? earlyGames.reduce((sum, game) => sum + game.score, 0) / earlyGames.length 
      : 0;

    const recentAvgAccuracy = recentGames.length > 0 
      ? recentGames.reduce((sum, game) => sum + game.accuracy, 0) / recentGames.length 
      : 0;
    
    const earlyAvgAccuracy = earlyGames.length > 0 
      ? earlyGames.reduce((sum, game) => sum + game.accuracy, 0) / earlyGames.length 
      : 0;

    return {
      total_games: progression.length,
      progression: progression,
      improvement: {
        score_improvement: parseFloat((recentAvgScore - earlyAvgScore).toFixed(2)),
        accuracy_improvement: parseFloat((recentAvgAccuracy - earlyAvgAccuracy).toFixed(2)),
        recent_avg_score: parseFloat(recentAvgScore.toFixed(2)),
        early_avg_score: parseFloat(earlyAvgScore.toFixed(2)),
        recent_avg_accuracy: parseFloat(recentAvgAccuracy.toFixed(2)),
        early_avg_accuracy: parseFloat(earlyAvgAccuracy.toFixed(2))
      }
    };
  } catch (error) {
    logger.error('Error calculating player progression:', error);
    throw error;
  }
}

/**
 * Get favorite categories for a player
 * @param {string} playerName - Name of the player
 * @returns {Promise<Array>} Favorite categories with play counts
 */
async function getFavoriteCategories(playerName) {
  try {
    const result = await query(`
      SELECT 
        unnest(categories) as category,
        COUNT(*) as play_count
      FROM game_sessions 
      WHERE player_name = $1
      GROUP BY category
      ORDER BY play_count DESC
      LIMIT 5
    `, [playerName]);

    return result.rows.map(row => ({
      category: row.category,
      play_count: parseInt(row.play_count)
    }));
  } catch (error) {
    logger.error('Error getting favorite categories:', error);
    throw error;
  }
}

/**
 * Get favorite difficulty level for a player
 * @param {string} playerName - Name of the player
 * @returns {Promise<Object>} Favorite difficulty with play count
 */
async function getFavoriteDifficulty(playerName) {
  try {
    const result = await query(`
      SELECT 
        difficulty_level,
        COUNT(*) as play_count
      FROM game_sessions 
      WHERE player_name = $1
      GROUP BY difficulty_level
      ORDER BY play_count DESC
      LIMIT 1
    `, [playerName]);

    if (result.rows.length === 0) {
      return { difficulty_level: 1, play_count: 0 };
    }

    return {
      difficulty_level: parseInt(result.rows[0].difficulty_level),
      play_count: parseInt(result.rows[0].play_count)
    };
  } catch (error) {
    logger.error('Error getting favorite difficulty:', error);
    throw error;
  }
}

module.exports = {
  calculatePlayerStatistics,
  calculateCategoryStatistics,
  calculateDifficultyStatistics,
  calculateDailyStatistics,
  calculateWeeklyStatistics,
  calculatePlayerProgression,
  getFavoriteCategories,
  getFavoriteDifficulty
}; 