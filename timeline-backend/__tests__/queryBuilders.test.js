/**
 * Query Builders Unit Tests
 * @description Tests for SQL query construction utilities
 */

const { QueryBuilder, CardQueryBuilder, StatisticsQueryBuilder } = require('../utils/queryBuilders');

describe('QueryBuilder', () => {
  let queryBuilder;

  beforeEach(() => {
    queryBuilder = new QueryBuilder();
  });

  describe('Basic functionality', () => {
    it('should initialize with empty state', () => {
      expect(queryBuilder.sql).toBe('');
      expect(queryBuilder.params).toEqual([]);
      expect(queryBuilder.conditions).toEqual([]);
    });

    it('should add WHERE condition', () => {
      queryBuilder.where('category = $1', 'History');
      
      expect(queryBuilder.conditions).toEqual(['category = $1']);
      expect(queryBuilder.params).toEqual(['History']);
    });

    it('should ignore null values in WHERE condition', () => {
      queryBuilder.where('category = $1', null);
      
      expect(queryBuilder.conditions).toEqual([]);
      expect(queryBuilder.params).toEqual([]);
    });

    it('should ignore undefined values in WHERE condition', () => {
      queryBuilder.where('category = $1', undefined);
      
      expect(queryBuilder.conditions).toEqual([]);
      expect(queryBuilder.params).toEqual([]);
    });

    it('should ignore empty string values in WHERE condition', () => {
      queryBuilder.where('category = $1', '');
      
      expect(queryBuilder.conditions).toEqual([]);
      expect(queryBuilder.params).toEqual([]);
    });

    it('should add multiple WHERE conditions', () => {
      queryBuilder.whereMultiple([
        { condition: 'category = $1', value: 'History' },
        { condition: 'difficulty = $2', value: 3 }
      ]);
      
      expect(queryBuilder.conditions).toEqual(['category = $1', 'difficulty = $2']);
      expect(queryBuilder.params).toEqual(['History', 3]);
    });

    it('should build WHERE clause correctly', () => {
      queryBuilder.where('category = $1', 'History');
      queryBuilder.where('difficulty = $2', 3);
      
      const whereClause = queryBuilder.buildWhereClause();
      expect(whereClause).toBe(' WHERE category = $1 AND difficulty = $2');
    });

    it('should return empty WHERE clause when no conditions', () => {
      const whereClause = queryBuilder.buildWhereClause();
      expect(whereClause).toBe('');
    });

    it('should build complete query', () => {
      queryBuilder.sql = 'SELECT * FROM cards';
      queryBuilder.where('category = $1', 'History');
      
      const result = queryBuilder.build();
      expect(result.sql).toBe('SELECT * FROM cards WHERE category = $1');
      expect(result.params).toEqual(['History']);
    });
  });

  describe('Chaining', () => {
    it('should support method chaining', () => {
      const result = queryBuilder
        .where('category = $1', 'History')
        .where('difficulty = $2', 3)
        .build();
      
      expect(result.params).toEqual(['History', 3]);
    });
  });
});

describe('CardQueryBuilder', () => {
  let cardQueryBuilder;

  beforeEach(() => {
    cardQueryBuilder = new CardQueryBuilder();
  });

  describe('select', () => {
    it('should build basic SELECT query', () => {
      const { sql, params } = cardQueryBuilder.select();
      
      expect(sql).toBe('SELECT * FROM cards ORDER BY date_occurred ASC');
      expect(params).toEqual([]);
    });

    it('should add category filter', () => {
      const { sql, params } = cardQueryBuilder.select({ category: 'History' });
      
      expect(sql).toBe('SELECT * FROM cards WHERE category = $1 ORDER BY date_occurred ASC');
      expect(params).toEqual(['History']);
    });

    it('should add difficulty filter', () => {
      const { sql, params } = cardQueryBuilder.select({ difficulty: 3 });
      
      expect(sql).toBe('SELECT * FROM cards WHERE difficulty = $1 ORDER BY date_occurred ASC');
      expect(params).toEqual([3]);
    });

    it('should add multiple filters', () => {
      const { sql, params } = cardQueryBuilder.select({ 
        category: 'History', 
        difficulty: 3 
      });
      
      expect(sql).toBe('SELECT * FROM cards WHERE category = $1 AND difficulty = $2 ORDER BY date_occurred ASC');
      expect(params).toEqual(['History', 3]);
    });

    it('should add LIMIT clause', () => {
      const { sql, params } = cardQueryBuilder.select({ limit: 10 });
      
      expect(sql).toBe('SELECT * FROM cards ORDER BY date_occurred ASC LIMIT $1');
      expect(params).toEqual([10]);
    });

    it('should add OFFSET clause', () => {
      const { sql, params } = cardQueryBuilder.select({ offset: 20 });
      
      expect(sql).toBe('SELECT * FROM cards ORDER BY date_occurred ASC OFFSET $1');
      expect(params).toEqual([20]);
    });

    it('should add both LIMIT and OFFSET', () => {
      const { sql, params } = cardQueryBuilder.select({ limit: 10, offset: 20 });
      
      expect(sql).toBe('SELECT * FROM cards ORDER BY date_occurred ASC LIMIT $1 OFFSET $2');
      expect(params).toEqual([10, 20]);
    });

    it('should use RANDOM ordering when random option is true', () => {
      const { sql, params } = cardQueryBuilder.select({ random: true });
      
      expect(sql).toBe('SELECT * FROM cards ORDER BY RANDOM()');
      expect(params).toEqual([]);
    });

    it('should combine random ordering with filters and pagination', () => {
      const { sql, params } = cardQueryBuilder.select({ 
        category: 'History',
        limit: 5,
        random: true
      });
      
      expect(sql).toBe('SELECT * FROM cards WHERE category = $1 ORDER BY RANDOM() LIMIT $2');
      expect(params).toEqual(['History', 5]);
    });

    it('should ignore null and undefined filters', () => {
      const { sql, params } = cardQueryBuilder.select({ 
        category: null,
        difficulty: undefined,
        limit: 10
      });
      
      expect(sql).toBe('SELECT * FROM cards ORDER BY date_occurred ASC LIMIT $1');
      expect(params).toEqual([10]);
    });
  });

  describe('selectById', () => {
    it('should build SELECT query for specific ID', () => {
      const { sql, params } = cardQueryBuilder.selectById(123);
      
      expect(sql).toBe('SELECT * FROM cards WHERE id = $1');
      expect(params).toEqual([123]);
    });
  });

  describe('selectByCategory', () => {
    it('should build SELECT query for category', () => {
      const { sql, params } = cardQueryBuilder.selectByCategory('History');
      
      expect(sql).toBe('SELECT * FROM cards WHERE category = $1 ORDER BY date_occurred ASC');
      expect(params).toEqual(['History']);
    });
  });

  describe('count', () => {
    it('should build basic COUNT query', () => {
      const { sql, params } = cardQueryBuilder.count();
      
      expect(sql).toBe('SELECT COUNT(*) FROM cards');
      expect(params).toEqual([]);
    });

    it('should add filters to COUNT query', () => {
      const { sql, params } = cardQueryBuilder.count({ 
        category: 'History',
        difficulty: 3
      });
      
      expect(sql).toBe('SELECT COUNT(*) FROM cards WHERE category = $1 AND difficulty = $2');
      expect(params).toEqual(['History', 3]);
    });
  });

  describe('selectCategories', () => {
    it('should build categories query', () => {
      const { sql, params } = cardQueryBuilder.selectCategories();
      
      expect(sql).toBe('SELECT DISTINCT category FROM cards ORDER BY category');
      expect(params).toEqual([]);
    });
  });

  describe('selectCategoryStats', () => {
    it('should build category statistics query', () => {
      const { sql, params } = cardQueryBuilder.selectCategoryStats();
      
      expect(sql).toBe('SELECT category, COUNT(*) as count FROM cards GROUP BY category ORDER BY count DESC');
      expect(params).toEqual([]);
    });
  });

  describe('selectDifficultyStats', () => {
    it('should build difficulty statistics query', () => {
      const { sql, params } = cardQueryBuilder.selectDifficultyStats();
      
      expect(sql).toBe('SELECT difficulty, COUNT(*) as count FROM cards GROUP BY difficulty ORDER BY difficulty');
      expect(params).toEqual([]);
    });
  });
});

describe('StatisticsQueryBuilder', () => {
  let statsQueryBuilder;

  beforeEach(() => {
    statsQueryBuilder = new StatisticsQueryBuilder();
  });

  describe('selectGameSessions', () => {
    it('should build basic game sessions query', () => {
      const { sql, params } = statsQueryBuilder.selectGameSessions();
      
      expect(sql).toBe('SELECT * FROM game_sessions ORDER BY start_time DESC');
      expect(params).toEqual([]);
    });

    it('should add player name filter', () => {
      const { sql, params } = statsQueryBuilder.selectGameSessions({ 
        playerName: 'John'
      });
      
      expect(sql).toBe('SELECT * FROM game_sessions WHERE player_name ILIKE $1 ORDER BY start_time DESC');
      expect(params).toEqual(['%John%']);
    });

    it('should add status filter', () => {
      const { sql, params } = statsQueryBuilder.selectGameSessions({ 
        status: 'completed'
      });
      
      expect(sql).toBe('SELECT * FROM game_sessions WHERE status = $1 ORDER BY start_time DESC');
      expect(params).toEqual(['completed']);
    });

    it('should add date range filters', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      const { sql, params } = statsQueryBuilder.selectGameSessions({ 
        startDate,
        endDate
      });
      
      expect(sql).toBe('SELECT * FROM game_sessions WHERE start_time >= $1 AND start_time <= $2 ORDER BY start_time DESC');
      expect(params).toEqual([startDate, endDate]);
    });

    it('should add pagination', () => {
      const { sql, params } = statsQueryBuilder.selectGameSessions({ 
        limit: 10,
        offset: 20
      });
      
      expect(sql).toBe('SELECT * FROM game_sessions ORDER BY start_time DESC LIMIT $1 OFFSET $2');
      expect(params).toEqual([10, 20]);
    });

    it('should combine all filters', () => {
      const startDate = new Date('2024-01-01');
      const { sql, params } = statsQueryBuilder.selectGameSessions({ 
        playerName: 'John',
        status: 'completed',
        startDate,
        limit: 10
      });
      
      expect(sql).toBe('SELECT * FROM game_sessions WHERE player_name ILIKE $1 AND status = $2 AND start_time >= $3 ORDER BY start_time DESC LIMIT $4');
      expect(params).toEqual(['%John%', 'completed', startDate, 10]);
    });
  });

  describe('selectPlayerStats', () => {
    it('should build player statistics query', () => {
      const { sql, params } = statsQueryBuilder.selectPlayerStats('John');
      
      expect(sql).toContain('SELECT');
      expect(sql).toContain('player_name');
      expect(sql).toContain('total_games');
      expect(sql).toContain('completed_games');
      expect(sql).toContain('abandoned_games');
      expect(sql).toContain('avg_duration');
      expect(sql).toContain('first_game');
      expect(sql).toContain('last_game');
      expect(sql).toContain('FROM game_sessions');
      expect(sql).toContain('WHERE player_name = $1');
      expect(sql).toContain('GROUP BY player_name');
      expect(params).toEqual(['John']);
    });
  });

  describe('selectLeaderboard', () => {
    it('should build basic leaderboard query', () => {
      const { sql, params } = statsQueryBuilder.selectLeaderboard();
      
      expect(sql).toContain('SELECT');
      expect(sql).toContain('player_name');
      expect(sql).toContain('games_played');
      expect(sql).toContain('games_won');
      expect(sql).toContain('win_rate');
      expect(sql).toContain('FROM game_sessions');
      expect(sql).toContain('WHERE status IN (\'completed\', \'abandoned\')');
      expect(sql).toContain('GROUP BY player_name');
      expect(sql).toContain('HAVING COUNT(*) >= 1');
      expect(sql).toContain('ORDER BY win_rate DESC, games_won DESC');
      expect(sql).toContain('LIMIT $1');
      expect(params).toEqual([10]);
    });

    it('should add weekly timeframe filter', () => {
      const { sql, params } = statsQueryBuilder.selectLeaderboard({ 
        timeframe: 'week',
        limit: 5
      });
      
      expect(sql).toContain('AND start_time >= NOW() - INTERVAL \'7 days\'');
      expect(params).toEqual([5]);
    });

    it('should add monthly timeframe filter', () => {
      const { sql, params } = statsQueryBuilder.selectLeaderboard({ 
        timeframe: 'month',
        limit: 20
      });
      
      expect(sql).toContain('AND start_time >= NOW() - INTERVAL \'30 days\'');
      expect(params).toEqual([20]);
    });

    it('should not add timeframe filter for invalid value', () => {
      const { sql, params } = statsQueryBuilder.selectLeaderboard({ 
        timeframe: 'invalid',
        limit: 15
      });
      
      expect(sql).not.toContain('AND start_time >= NOW() - INTERVAL');
      expect(params).toEqual([15]);
    });
  });
});

describe('Integration scenarios', () => {
  describe('Complex filtering scenarios', () => {
    it('should handle complex card filtering', () => {
      const cardQueryBuilder = new CardQueryBuilder();
      const { sql, params } = cardQueryBuilder.select({
        category: 'History',
        difficulty: 3,
        limit: 10,
        offset: 20,
        random: false
      });
      
      expect(sql).toBe('SELECT * FROM cards WHERE category = $1 AND difficulty = $2 ORDER BY date_occurred ASC LIMIT $3 OFFSET $4');
      expect(params).toEqual(['History', 3, 10, 20]);
    });

    it('should handle complex game session filtering', () => {
      const statsQueryBuilder = new StatisticsQueryBuilder();
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      const { sql, params } = statsQueryBuilder.selectGameSessions({
        playerName: 'John',
        status: 'completed',
        startDate,
        endDate,
        limit: 50,
        offset: 100
      });
      
      expect(sql).toBe('SELECT * FROM game_sessions WHERE player_name ILIKE $1 AND status = $2 AND start_time >= $3 AND start_time <= $4 ORDER BY start_time DESC LIMIT $5 OFFSET $6');
      expect(params).toEqual(['%John%', 'completed', startDate, endDate, 50, 100]);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty options object', () => {
      const cardQueryBuilder = new CardQueryBuilder();
      const { sql, params } = cardQueryBuilder.select({});
      
      expect(sql).toBe('SELECT * FROM cards ORDER BY date_occurred ASC');
      expect(params).toEqual([]);
    });

    it('should handle undefined options', () => {
      const cardQueryBuilder = new CardQueryBuilder();
      const { sql, params } = cardQueryBuilder.select();
      
      expect(sql).toBe('SELECT * FROM cards ORDER BY date_occurred ASC');
      expect(params).toEqual([]);
    });

    it('should handle zero values', () => {
      const cardQueryBuilder = new CardQueryBuilder();
      const { sql, params } = cardQueryBuilder.select({
        difficulty: 0,
        limit: 0,
        offset: 0
      });
      
      expect(sql).toBe('SELECT * FROM cards WHERE difficulty = $1 ORDER BY date_occurred ASC LIMIT $2 OFFSET $3');
      expect(params).toEqual([0, 0, 0]);
    });
  });
}); 