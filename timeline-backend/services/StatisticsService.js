/**
 * Statistics Service
 * @description Hybrid statistics service using Prisma for simple operations and query builders for complex analytics
 * @version 1.0.0
 */

const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');
const statistics = require('../utils/statistics');
const { shouldUsePrisma } = require('../utils/featureFlags');

/**
 * Performance monitoring utility
 */
class PerformanceMonitor {
  static async measureQuery(operation, operationName) {
    const start = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - start;
      
      logger.debug(`${operationName} completed in ${duration.toFixed(2)}ms`);
      
      if (duration > 1000) {
        logger.warn(`Slow query detected: ${operationName} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      logger.error(`${operationName} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }
}

/**
 * Statistics Service with hybrid approach
 */
class StatisticsService {
  constructor(prisma = null) {
    this.prisma = prisma || new PrismaClient();
  }

  /**
   * Get basic player statistics using Prisma
   * @param {string} playerName - Player name
   * @returns {Promise<Object>} Basic player statistics
   */
  async getPlayerBasicStats(playerName) {
    return PerformanceMonitor.measureQuery(async () => {
      const sessions = await this.prisma.game_sessions.findMany({
        where: { player_name: playerName },
        select: {
          id: true,
          player_name: true,
          status: true,
          score: true,
          total_moves: true,
          correct_moves: true,
          incorrect_moves: true,
          duration_seconds: true,
          start_time: true,
          end_time: true
        }
      });

      if (sessions.length === 0) {
        return {
          player_name: playerName,
          total_games_played: 0,
          total_games_won: 0,
          total_games_lost: 0,
          total_games_abandoned: 0,
          total_score: 0,
          total_moves: 0,
          total_correct_moves: 0,
          total_incorrect_moves: 0,
          total_play_time_seconds: 0,
          average_score_per_game: 0,
          average_accuracy: 0,
          best_score: 0,
          worst_score: 0,
          average_game_duration_seconds: 0,
          win_rate: 0,
          last_played_at: null,
          first_played_at: null
        };
      }

      const totalGames = sessions.length;
      const gamesWon = sessions.filter(s => s.status === 'completed' && s.score > 0).length;
      const gamesLost = sessions.filter(s => s.status === 'completed' && s.score === 0).length;
      const gamesAbandoned = sessions.filter(s => s.status === 'abandoned').length;
      
      const totalScore = sessions.reduce((sum, s) => sum + (s.score || 0), 0);
      const totalMoves = sessions.reduce((sum, s) => sum + (s.total_moves || 0), 0);
      const totalCorrectMoves = sessions.reduce((sum, s) => sum + (s.correct_moves || 0), 0);
      const totalIncorrectMoves = sessions.reduce((sum, s) => sum + (s.incorrect_moves || 0), 0);
      const totalPlayTime = sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
      
      const averageScore = totalGames > 0 ? totalScore / totalGames : 0;
      const accuracy = totalMoves > 0 ? (totalCorrectMoves / totalMoves) * 100 : 0;
      const winRate = totalGames > 0 ? (gamesWon / totalGames) * 100 : 0;
      
      const scores = sessions.map(s => s.score || 0).filter(s => s > 0);
      const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
      const worstScore = scores.length > 0 ? Math.min(...scores) : 0;
      
      const averageDuration = totalGames > 0 ? totalPlayTime / totalGames : 0;
      
      const lastPlayed = sessions.reduce((latest, s) => 
        s.end_time && (!latest || s.end_time > latest) ? s.end_time : latest, null);
      const firstPlayed = sessions.reduce((earliest, s) => 
        s.start_time && (!earliest || s.start_time < earliest) ? s.start_time : earliest, null);

      return {
        player_name: playerName,
        total_games_played: totalGames,
        total_games_won: gamesWon,
        total_games_lost: gamesLost,
        total_games_abandoned: gamesAbandoned,
        total_score: totalScore,
        total_moves: totalMoves,
        total_correct_moves: totalCorrectMoves,
        total_incorrect_moves: totalIncorrectMoves,
        total_play_time_seconds: totalPlayTime,
        average_score_per_game: parseFloat(averageScore.toFixed(2)),
        average_accuracy: parseFloat(accuracy.toFixed(2)),
        best_score: bestScore,
        worst_score: worstScore,
        average_game_duration_seconds: Math.round(averageDuration),
        win_rate: parseFloat(winRate.toFixed(2)),
        last_played_at: lastPlayed,
        first_played_at: firstPlayed
      };
    }, `StatisticsService.getPlayerBasicStats(${playerName})`);
  }

  /**
   * Get advanced player statistics using raw SQL
   * @param {string} playerName - Player name
   * @returns {Promise<Object>} Advanced player statistics
   */
  async getPlayerAdvancedStats(playerName) {
    return PerformanceMonitor.measureQuery(async () => {
      const result = await this.prisma.$queryRaw`
        SELECT 
          player_name,
          COUNT(*) as games_played,
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
          COALESCE(AVG(correct_moves::float / NULLIF(total_moves, 0)), 0) * 100 as average_accuracy,
          COALESCE(AVG(CASE WHEN status = 'completed' AND score > 0 THEN 1.0 ELSE 0.0 END), 0) * 100 as win_rate,
          MAX(end_time) as last_played_at,
          MIN(start_time) as first_played_at,
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY score) as median_score,
          PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY score) as q1_score,
          PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY score) as q3_score,
          STDDEV(score) as score_stddev,
          VARIANCE(score) as score_variance
        FROM game_sessions 
        WHERE player_name = ${playerName}
        GROUP BY player_name
      `;

      return result[0] || {
        player_name: playerName,
        games_played: 0,
        games_won: 0,
        games_lost: 0,
        games_abandoned: 0,
        total_score: 0,
        total_moves: 0,
        total_correct_moves: 0,
        total_incorrect_moves: 0,
        total_play_time: 0,
        average_score: 0,
        best_score: 0,
        worst_score: 0,
        average_duration: 0,
        average_accuracy: 0,
        win_rate: 0,
        last_played_at: null,
        first_played_at: null,
        median_score: 0,
        q1_score: 0,
        q3_score: 0,
        score_stddev: 0,
        score_variance: 0
      };
    }, `StatisticsService.getPlayerAdvancedStats(${playerName})`);
  }

  /**
   * Get comprehensive player statistics using existing query builders
   * @param {string} playerName - Player name
   * @returns {Promise<Object>} Comprehensive player statistics
   */
  async calculatePlayerStatistics(playerName) {
    return PerformanceMonitor.measureQuery(async () => {
      return statistics.calculatePlayerStatistics(playerName);
    }, `StatisticsService.calculatePlayerStatistics(${playerName})`);
  }

  /**
   * Get category statistics using hybrid approach
   * @param {string} playerName - Player name
   * @param {string} category - Category filter (optional)
   * @returns {Promise<Array>} Category statistics
   */
  async getCategoryStatistics(playerName, category = null) {
    return PerformanceMonitor.measureQuery(async () => {
      if (shouldUsePrisma('statistics', 'basic')) {
        // Use Prisma for basic category stats
        const sessions = await this.prisma.game_sessions.findMany({
          where: {
            player_name: playerName
          },
          select: {
            categories: true,
            status: true,
            score: true,
            total_moves: true,
            correct_moves: true,
            incorrect_moves: true,
            duration_seconds: true,
            end_time: true
          }
        });

        // Group by category
        const categoryMap = new Map();
        
        sessions.forEach(session => {
          session.categories.forEach(cat => {
            if (category && cat !== category) return;
            
            if (!categoryMap.has(cat)) {
              categoryMap.set(cat, {
                category: cat,
                games_played: 0,
                games_won: 0,
                total_score: 0,
                total_moves: 0,
                correct_moves: 0,
                incorrect_moves: 0,
                average_score: 0,
                best_score: 0,
                average_game_duration_seconds: 0,
                last_played_at: null
              });
            }
            
            const stats = categoryMap.get(cat);
            stats.games_played++;
            if (session.status === 'completed' && session.score > 0) stats.games_won++;
            stats.total_score += session.score || 0;
            stats.total_moves += session.total_moves || 0;
            stats.correct_moves += session.correct_moves || 0;
            stats.incorrect_moves += session.incorrect_moves || 0;
            stats.average_game_duration_seconds += session.duration_seconds || 0;
            
            if (session.score > stats.best_score) stats.best_score = session.score;
            if (session.end_time && (!stats.last_played_at || session.end_time > stats.last_played_at)) {
              stats.last_played_at = session.end_time;
            }
          });
        });

        // Calculate averages and percentages
        return Array.from(categoryMap.values()).map(stats => {
          const accuracy = stats.total_moves > 0 ? (stats.correct_moves / stats.total_moves) * 100 : 0;
          const winRate = stats.games_played > 0 ? (stats.games_won / stats.games_played) * 100 : 0;
          const avgScore = stats.games_played > 0 ? stats.total_score / stats.games_played : 0;
          const avgDuration = stats.games_played > 0 ? stats.average_game_duration_seconds / stats.games_played : 0;

          return {
            category: stats.category,
            games_played: stats.games_played,
            games_won: stats.games_won,
            total_score: stats.total_score,
            total_moves: stats.total_moves,
            correct_moves: stats.correct_moves,
            incorrect_moves: stats.incorrect_moves,
            average_score: parseFloat(avgScore.toFixed(2)),
            accuracy: parseFloat(accuracy.toFixed(2)),
            best_score: stats.best_score,
            average_game_duration_seconds: Math.round(avgDuration),
            win_rate: parseFloat(winRate.toFixed(2)),
            last_played_at: stats.last_played_at
          };
        }).sort((a, b) => b.games_played - a.games_played);
      } else {
        // Use existing query builders for complex analytics
        return statistics.calculateCategoryStatistics(playerName, category);
      }
    }, `StatisticsService.getCategoryStatistics(${playerName}, ${category})`);
  }

  /**
   * Get difficulty statistics using hybrid approach
   * @param {string} playerName - Player name
   * @param {number} difficultyLevel - Difficulty level filter (optional)
   * @returns {Promise<Array>} Difficulty statistics
   */
  async getDifficultyStatistics(playerName, difficultyLevel = null) {
    return PerformanceMonitor.measureQuery(async () => {
      if (shouldUsePrisma('statistics', 'basic')) {
        // Use Prisma for basic difficulty stats
        const sessions = await this.prisma.game_sessions.findMany({
          where: {
            player_name: playerName,
            ...(difficultyLevel && { difficulty_level: difficultyLevel })
          },
          select: {
            difficulty_level: true,
            status: true,
            score: true,
            total_moves: true,
            correct_moves: true,
            incorrect_moves: true,
            duration_seconds: true,
            end_time: true
          }
        });

        // Group by difficulty level
        const difficultyMap = new Map();
        
        sessions.forEach(session => {
          const level = session.difficulty_level;
          
          if (!difficultyMap.has(level)) {
            difficultyMap.set(level, {
              difficulty_level: level,
              games_played: 0,
              games_won: 0,
              total_score: 0,
              total_moves: 0,
              correct_moves: 0,
              incorrect_moves: 0,
              average_score: 0,
              best_score: 0,
              average_game_duration_seconds: 0,
              last_played_at: null
            });
          }
          
          const stats = difficultyMap.get(level);
          stats.games_played++;
          if (session.status === 'completed' && session.score > 0) stats.games_won++;
          stats.total_score += session.score || 0;
          stats.total_moves += session.total_moves || 0;
          stats.correct_moves += session.correct_moves || 0;
          stats.incorrect_moves += session.incorrect_moves || 0;
          stats.average_game_duration_seconds += session.duration_seconds || 0;
          
          if (session.score > stats.best_score) stats.best_score = session.score;
          if (session.end_time && (!stats.last_played_at || session.end_time > stats.last_played_at)) {
            stats.last_played_at = session.end_time;
          }
        });

        // Calculate averages and percentages
        return Array.from(difficultyMap.values()).map(stats => {
          const accuracy = stats.total_moves > 0 ? (stats.correct_moves / stats.total_moves) * 100 : 0;
          const winRate = stats.games_played > 0 ? (stats.games_won / stats.games_played) * 100 : 0;
          const avgScore = stats.games_played > 0 ? stats.total_score / stats.games_played : 0;
          const avgDuration = stats.games_played > 0 ? stats.average_game_duration_seconds / stats.games_played : 0;

          return {
            difficulty_level: stats.difficulty_level,
            games_played: stats.games_played,
            games_won: stats.games_won,
            total_score: stats.total_score,
            total_moves: stats.total_moves,
            correct_moves: stats.correct_moves,
            incorrect_moves: stats.incorrect_moves,
            average_score: parseFloat(avgScore.toFixed(2)),
            accuracy: parseFloat(accuracy.toFixed(2)),
            best_score: stats.best_score,
            average_game_duration_seconds: Math.round(avgDuration),
            win_rate: parseFloat(winRate.toFixed(2)),
            last_played_at: stats.last_played_at
          };
        }).sort((a, b) => a.difficulty_level - b.difficulty_level);
      } else {
        // Use existing query builders for complex analytics
        return statistics.calculateDifficultyStatistics(playerName, difficultyLevel);
      }
    }, `StatisticsService.getDifficultyStatistics(${playerName}, ${difficultyLevel})`);
  }

  /**
   * Get daily statistics using hybrid approach
   * @param {string} playerName - Player name
   * @param {number} days - Number of days to look back
   * @returns {Promise<Array>} Daily statistics
   */
  async getDailyStatistics(playerName, days = 30) {
    return PerformanceMonitor.measureQuery(async () => {
      if (shouldUsePrisma('statistics', 'basic')) {
        // Use Prisma for basic daily stats
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const sessions = await this.prisma.game_sessions.findMany({
          where: {
            player_name: playerName,
            end_time: {
              gte: cutoffDate
            }
          },
          select: {
            end_time: true,
            status: true,
            score: true,
            total_moves: true,
            correct_moves: true,
            incorrect_moves: true,
            duration_seconds: true
          }
        });

        // Group by date
        const dateMap = new Map();
        
        sessions.forEach(session => {
          const date = session.end_time.toISOString().split('T')[0];
          
          if (!dateMap.has(date)) {
            dateMap.set(date, {
              date: date,
              games_played: 0,
              games_won: 0,
              total_score: 0,
              total_moves: 0,
              correct_moves: 0,
              incorrect_moves: 0,
              average_score: 0,
              total_play_time_seconds: 0
            });
          }
          
          const stats = dateMap.get(date);
          stats.games_played++;
          if (session.status === 'completed' && session.score > 0) stats.games_won++;
          stats.total_score += session.score || 0;
          stats.total_moves += session.total_moves || 0;
          stats.correct_moves += session.correct_moves || 0;
          stats.incorrect_moves += session.incorrect_moves || 0;
          stats.total_play_time_seconds += session.duration_seconds || 0;
        });

        // Calculate averages and percentages
        return Array.from(dateMap.values()).map(stats => {
          const accuracy = stats.total_moves > 0 ? (stats.correct_moves / stats.total_moves) * 100 : 0;
          const winRate = stats.games_played > 0 ? (stats.games_won / stats.games_played) * 100 : 0;
          const avgScore = stats.games_played > 0 ? stats.total_score / stats.games_played : 0;

          return {
            date: stats.date,
            games_played: stats.games_played,
            games_won: stats.games_won,
            total_score: stats.total_score,
            total_moves: stats.total_moves,
            correct_moves: stats.correct_moves,
            incorrect_moves: stats.incorrect_moves,
            average_score: parseFloat(avgScore.toFixed(2)),
            accuracy: parseFloat(accuracy.toFixed(2)),
            total_play_time_seconds: stats.total_play_time_seconds,
            win_rate: parseFloat(winRate.toFixed(2))
          };
        }).sort((a, b) => b.date.localeCompare(a.date));
      } else {
        // Use existing query builders for complex analytics
        return statistics.calculateDailyStatistics(playerName, days);
      }
    }, `StatisticsService.getDailyStatistics(${playerName}, ${days})`);
  }

  /**
   * Get weekly statistics using hybrid approach
   * @param {string} playerName - Player name
   * @param {number} weeks - Number of weeks to look back
   * @returns {Promise<Array>} Weekly statistics
   */
  async getWeeklyStatistics(playerName, weeks = 12) {
    return PerformanceMonitor.measureQuery(async () => {
      if (shouldUsePrisma('statistics', 'basic')) {
        // Use Prisma for basic weekly stats
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - (weeks * 7));

        const sessions = await this.prisma.game_sessions.findMany({
          where: {
            player_name: playerName,
            end_time: {
              gte: cutoffDate
            }
          },
          select: {
            end_time: true,
            status: true,
            score: true,
            total_moves: true,
            correct_moves: true,
            incorrect_moves: true,
            duration_seconds: true
          }
        });

        // Group by week
        const weekMap = new Map();
        
        sessions.forEach(session => {
          const date = new Date(session.end_time);
          const year = date.getFullYear();
          const week = getWeekNumber(date);
          const weekKey = `${year}-W${week.toString().padStart(2, '0')}`;
          
          if (!weekMap.has(weekKey)) {
            weekMap.set(weekKey, {
              year: year,
              week: week,
              games_played: 0,
              games_won: 0,
              total_score: 0,
              total_moves: 0,
              correct_moves: 0,
              incorrect_moves: 0,
              average_score: 0,
              total_play_time_seconds: 0
            });
          }
          
          const stats = weekMap.get(weekKey);
          stats.games_played++;
          if (session.status === 'completed' && session.score > 0) stats.games_won++;
          stats.total_score += session.score || 0;
          stats.total_moves += session.total_moves || 0;
          stats.correct_moves += session.correct_moves || 0;
          stats.incorrect_moves += session.incorrect_moves || 0;
          stats.total_play_time_seconds += session.duration_seconds || 0;
        });

        // Calculate averages and percentages
        return Array.from(weekMap.values()).map(stats => {
          const accuracy = stats.total_moves > 0 ? (stats.correct_moves / stats.total_moves) * 100 : 0;
          const winRate = stats.games_played > 0 ? (stats.games_won / stats.games_played) * 100 : 0;
          const avgScore = stats.games_played > 0 ? stats.total_score / stats.games_played : 0;

          return {
            year: stats.year,
            week: stats.week,
            games_played: stats.games_played,
            games_won: stats.games_won,
            total_score: stats.total_score,
            total_moves: stats.total_moves,
            correct_moves: stats.correct_moves,
            incorrect_moves: stats.incorrect_moves,
            average_score: parseFloat(avgScore.toFixed(2)),
            accuracy: parseFloat(accuracy.toFixed(2)),
            total_play_time_seconds: stats.total_play_time_seconds,
            win_rate: parseFloat(winRate.toFixed(2))
          };
        }).sort((a, b) => b.year - a.year || b.week - a.week);
      } else {
        // Use existing query builders for complex analytics
        return statistics.calculateWeeklyStatistics(playerName, weeks);
      }
    }, `StatisticsService.getWeeklyStatistics(${playerName}, ${weeks})`);
  }

  /**
   * Get player progression using hybrid approach
   * @param {string} playerName - Player name
   * @returns {Promise<Object>} Player progression data
   */
  async getPlayerProgression(playerName) {
    return PerformanceMonitor.measureQuery(async () => {
      if (shouldUsePrisma('statistics', 'basic')) {
        // Use Prisma for basic progression data
        const sessions = await this.prisma.game_sessions.findMany({
          where: {
            player_name: playerName,
            status: 'completed'
          },
          select: {
            start_time: true,
            score: true,
            difficulty_level: true,
            total_moves: true,
            correct_moves: true,
            duration_seconds: true
          },
          orderBy: {
            start_time: 'asc'
          }
        });

        const progression = sessions.map((session, index) => ({
          game_number: index + 1,
          date: session.start_time,
          score: session.score || 0,
          difficulty_level: session.difficulty_level,
          total_moves: session.total_moves || 0,
          correct_moves: session.correct_moves || 0,
          accuracy: session.total_moves > 0 ? (session.correct_moves / session.total_moves) * 100 : 0,
          duration_seconds: session.duration_seconds || 0
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
      } else {
        // Use existing query builders for complex analytics
        return statistics.calculatePlayerProgression(playerName);
      }
    }, `StatisticsService.getPlayerProgression(${playerName})`);
  }

  /**
   * Get favorite categories using hybrid approach
   * @param {string} playerName - Player name
   * @returns {Promise<Array>} Favorite categories
   */
  async getFavoriteCategories(playerName) {
    return PerformanceMonitor.measureQuery(async () => {
      if (shouldUsePrisma('statistics', 'basic')) {
        // Use Prisma for basic favorite categories
        const sessions = await this.prisma.game_sessions.findMany({
          where: { player_name: playerName },
          select: { categories: true }
        });

        const categoryCount = new Map();
        
        sessions.forEach(session => {
          session.categories.forEach(category => {
            categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
          });
        });

        return Array.from(categoryCount.entries())
          .map(([category, play_count]) => ({ category, play_count }))
          .sort((a, b) => b.play_count - a.play_count)
          .slice(0, 5);
      } else {
        // Use existing query builders for complex analytics
        return statistics.getFavoriteCategories(playerName);
      }
    }, `StatisticsService.getFavoriteCategories(${playerName})`);
  }

  /**
   * Get favorite difficulty using hybrid approach
   * @param {string} playerName - Player name
   * @returns {Promise<Object>} Favorite difficulty
   */
  async getFavoriteDifficulty(playerName) {
    return PerformanceMonitor.measureQuery(async () => {
      if (shouldUsePrisma('statistics', 'basic')) {
        // Use Prisma for basic favorite difficulty
        const sessions = await this.prisma.game_sessions.findMany({
          where: { player_name: playerName },
          select: { difficulty_level: true }
        });

        const difficultyCount = new Map();
        
        sessions.forEach(session => {
          const level = session.difficulty_level;
          difficultyCount.set(level, (difficultyCount.get(level) || 0) + 1);
        });

        if (difficultyCount.size === 0) {
          return { difficulty_level: 1, play_count: 0 };
        }

        const [favoriteLevel, playCount] = Array.from(difficultyCount.entries())
          .reduce((max, current) => current[1] > max[1] ? current : max);

        return {
          difficulty_level: favoriteLevel,
          play_count: playCount
        };
      } else {
        // Use existing query builders for complex analytics
        return statistics.getFavoriteDifficulty(playerName);
      }
    }, `StatisticsService.getFavoriteDifficulty(${playerName})`);
  }

  /**
   * Execute operation within transaction
   * @param {Function} operation - Operation to execute
   * @returns {Promise<any>} Operation result
   */
  async withTransaction(operation) {
    return this.prisma.$transaction(operation);
  }

  /**
   * Disconnect from database
   */
  async disconnect() {
    await this.prisma.$disconnect();
  }
}

/**
 * Get week number for a date
 * @param {Date} date - Date to get week number for
 * @returns {number} Week number
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

module.exports = StatisticsService; 