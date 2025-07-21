/**
 * Query Builders Unit Tests
 * @description Tests for SQL query construction utilities with enhanced validation and error handling
 */

const { 
  QueryBuilder, 
  CardQueryBuilder, 
  StatisticsQueryBuilder,
  QueryBuilderError,
  InvalidQueryError,
  ValidationError,
  ValidationUtils
} = require('../utils/queryBuilders');

describe('ValidationUtils', () => {
  describe('validateString', () => {
    it('should validate valid strings', () => {
      expect(ValidationUtils.validateString('test', 'field')).toBe('test');
      expect(ValidationUtils.validateString('  test  ', 'field')).toBe('test');
    });

    it('should throw ValidationError for non-strings', () => {
      expect(() => ValidationUtils.validateString(123, 'field')).toThrow(ValidationError);
      expect(() => ValidationUtils.validateString(null, 'field')).toThrow(ValidationError);
      expect(() => ValidationUtils.validateString(undefined, 'field')).toThrow(ValidationError);
      expect(() => ValidationUtils.validateString({}, 'field')).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty strings', () => {
      expect(() => ValidationUtils.validateString('', 'field')).toThrow(ValidationError);
      expect(() => ValidationUtils.validateString('   ', 'field')).toThrow(ValidationError);
    });
  });

  describe('validateNumber', () => {
    it('should validate valid numbers', () => {
      expect(ValidationUtils.validateNumber(5, 'field')).toBe(5);
      expect(ValidationUtils.validateNumber(0, 'field')).toBe(0);
      expect(ValidationUtils.validateNumber(-1, 'field')).toBe(-1);
    });

    it('should validate numbers within range', () => {
      expect(ValidationUtils.validateNumber(5, 'field', 1, 10)).toBe(5);
      expect(ValidationUtils.validateNumber(1, 'field', 1, 10)).toBe(1);
      expect(ValidationUtils.validateNumber(10, 'field', 1, 10)).toBe(10);
    });

    it('should throw ValidationError for invalid numbers', () => {
      expect(() => ValidationUtils.validateNumber('5', 'field')).toThrow(ValidationError);
      expect(() => ValidationUtils.validateNumber(NaN, 'field')).toThrow(ValidationError);
      expect(() => ValidationUtils.validateNumber(null, 'field')).toThrow(ValidationError);
    });

    it('should throw ValidationError for out-of-range numbers', () => {
      expect(() => ValidationUtils.validateNumber(0, 'field', 1, 10)).toThrow(ValidationError);
      expect(() => ValidationUtils.validateNumber(11, 'field', 1, 10)).toThrow(ValidationError);
    });
  });

  describe('validateBoolean', () => {
    it('should validate valid booleans', () => {
      expect(ValidationUtils.validateBoolean(true, 'field')).toBe(true);
      expect(ValidationUtils.validateBoolean(false, 'field')).toBe(false);
    });

    it('should throw ValidationError for non-booleans', () => {
      expect(() => ValidationUtils.validateBoolean('true', 'field')).toThrow(ValidationError);
      expect(() => ValidationUtils.validateBoolean(1, 'field')).toThrow(ValidationError);
      expect(() => ValidationUtils.validateBoolean(null, 'field')).toThrow(ValidationError);
    });
  });

  describe('validateArray', () => {
    it('should validate valid arrays', () => {
      expect(ValidationUtils.validateArray([1, 2, 3], 'field')).toEqual([1, 2, 3]);
      expect(ValidationUtils.validateArray([], 'field')).toEqual([]);
    });

    it('should throw ValidationError for non-arrays', () => {
      expect(() => ValidationUtils.validateArray('array', 'field')).toThrow(ValidationError);
      expect(() => ValidationUtils.validateArray({}, 'field')).toThrow(ValidationError);
      expect(() => ValidationUtils.validateArray(null, 'field')).toThrow(ValidationError);
    });
  });
});

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

  describe('Input validation', () => {
    it('should throw ValidationError for invalid condition type', () => {
      expect(() => queryBuilder.where(123, 'value')).toThrow(ValidationError);
      expect(() => queryBuilder.where(null, 'value')).toThrow(ValidationError);
      expect(() => queryBuilder.where(undefined, 'value')).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty condition', () => {
      expect(() => queryBuilder.where('', 'value')).toThrow(ValidationError);
      expect(() => queryBuilder.where('   ', 'value')).toThrow(ValidationError);
    });

    it('should throw ValidationError for SQL injection patterns', () => {
      expect(() => queryBuilder.where('category = $1; DROP TABLE cards;', 'value')).toThrow(ValidationError);
      expect(() => queryBuilder.where('category = $1 -- comment', 'value')).toThrow(ValidationError);
      expect(() => queryBuilder.where('category = $1 UNION SELECT * FROM users', 'value')).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid conditions array', () => {
      expect(() => queryBuilder.whereMultiple('not an array')).toThrow(ValidationError);
      expect(() => queryBuilder.whereMultiple(null)).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid condition objects', () => {
      expect(() => queryBuilder.whereMultiple([
        { condition: 123, value: 'test' }
      ])).toThrow(ValidationError);
      
      expect(() => queryBuilder.whereMultiple([
        { condition: 'category = $1' } // missing value
      ])).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid startParamIndex', () => {
      expect(() => queryBuilder.whereMultipleWithIndex([], 'not a number')).toThrow(ValidationError);
      expect(() => queryBuilder.whereMultipleWithIndex([], 0)).toThrow(ValidationError); // less than 1
    });
  });

  describe('Error handling', () => {
    it('should throw InvalidQueryError when build fails', () => {
      // Mock a scenario where build fails by making the build method throw an error
      const originalBuildWhereClause = queryBuilder.buildWhereClause;
      queryBuilder.buildWhereClause = () => {
        throw new Error('Build failed');
      };
      
      expect(() => queryBuilder.build()).toThrow(InvalidQueryError);
      
      // Restore original method
      queryBuilder.buildWhereClause = originalBuildWhereClause;
    });

    it('should include context in QueryBuilderError', () => {
      try {
        queryBuilder.where('category = $1; DROP TABLE cards;', 'value');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.field).toBe('condition');
        expect(error.value).toBe('category = $1; DROP TABLE cards;');
        expect(error.timestamp).toBeDefined();
      }
    });
  });

  describe('Chaining', () => {
    it('should support method chaining', () => {
      const result = queryBuilder
        .where('category = $1', 'History')
        .where('difficulty = $2', 3)
        .build();
      
      expect(result.sql).toBe(' WHERE category = $1 AND difficulty = $2');
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
        random: true,
        limit: 10,
        offset: 20
      });
      
      expect(sql).toBe('SELECT * FROM cards WHERE category = $1 ORDER BY RANDOM() LIMIT $2 OFFSET $3');
      expect(params).toEqual(['History', 10, 20]);
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

  describe('Input validation', () => {
    it('should throw ValidationError for invalid category type', () => {
      expect(() => cardQueryBuilder.select({ category: 123 })).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty category', () => {
      expect(() => cardQueryBuilder.select({ category: '' })).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid difficulty range', () => {
      expect(() => cardQueryBuilder.select({ difficulty: -1 })).toThrow(ValidationError);
      expect(() => cardQueryBuilder.select({ difficulty: 6 })).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid limit', () => {
      expect(() => cardQueryBuilder.select({ limit: 0 })).toThrow(ValidationError);
      expect(() => cardQueryBuilder.select({ limit: 1001 })).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid offset', () => {
      expect(() => cardQueryBuilder.select({ offset: -1 })).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid random type', () => {
      expect(() => cardQueryBuilder.select({ random: 'true' })).toThrow(ValidationError);
    });
  });

  describe('selectById', () => {
    it('should build SELECT query for specific ID', () => {
      const { sql, params } = cardQueryBuilder.selectById(123);
      
      expect(sql).toBe('SELECT * FROM cards WHERE id = $1');
      expect(params).toEqual([123]);
    });

    it('should throw ValidationError for invalid ID', () => {
      expect(() => cardQueryBuilder.selectById(0)).toThrow(ValidationError);
      expect(() => cardQueryBuilder.selectById('123')).toThrow(ValidationError);
    });
  });

  describe('selectByCategory', () => {
    it('should build SELECT query for category', () => {
      const { sql, params } = cardQueryBuilder.selectByCategory('History');
      
      expect(sql).toBe('SELECT * FROM cards WHERE category = $1 ORDER BY date_occurred ASC');
      expect(params).toEqual(['History']);
    });

    it('should throw ValidationError for invalid category', () => {
      expect(() => cardQueryBuilder.selectByCategory(123)).toThrow(ValidationError);
      expect(() => cardQueryBuilder.selectByCategory('')).toThrow(ValidationError);
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

    it('should handle difficulty 0 consistently between select and count', () => {
      // Both methods should accept difficulty 0
      const selectResult = cardQueryBuilder.select({ difficulty: 0 });
      const countResult = cardQueryBuilder.count({ difficulty: 0 });
      
      expect(selectResult.params).toContain(0);
      expect(countResult.params).toContain(0);
    });

    it('should reject invalid difficulty values consistently', () => {
      // Both methods should reject the same invalid values
      expect(() => cardQueryBuilder.select({ difficulty: -1 })).toThrow(ValidationError);
      expect(() => cardQueryBuilder.count({ difficulty: -1 })).toThrow(ValidationError);
      
      expect(() => cardQueryBuilder.select({ difficulty: 6 })).toThrow(ValidationError);
      expect(() => cardQueryBuilder.count({ difficulty: 6 })).toThrow(ValidationError);
    });
  });

  describe('selectCategories', () => {
    it('should build categories query', () => {
      const { sql, params } = cardQueryBuilder.selectCategories();
      
      expect(sql).toBe('SELECT DISTINCT category FROM cards ORDER BY category ASC');
      expect(params).toEqual([]);
    });
  });

  describe('selectCategoryStats', () => {
    it('should build category statistics query', () => {
      const { sql, params } = cardQueryBuilder.selectCategoryStats();
      
      expect(sql).toContain('SELECT');
      expect(sql).toContain('category');
      expect(sql).toContain('COUNT(*)');
      expect(sql).toContain('AVG(difficulty)');
      expect(sql).toContain('GROUP BY category');
      expect(params).toEqual([]);
    });
  });

  describe('selectDifficultyStats', () => {
    it('should build difficulty statistics query', () => {
      const { sql, params } = cardQueryBuilder.selectDifficultyStats();
      
      expect(sql).toContain('SELECT');
      expect(sql).toContain('difficulty');
      expect(sql).toContain('COUNT(*)');
      expect(sql).toContain('GROUP BY difficulty');
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
      const { sql, params } = statsQueryBuilder.selectGameSessions({ 
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      });
      
      expect(sql).toBe('SELECT * FROM game_sessions WHERE start_time >= $1 AND start_time <= $2 ORDER BY start_time DESC');
      expect(params).toEqual(['2024-01-01', '2024-12-31']);
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
      const { sql, params } = statsQueryBuilder.selectGameSessions({ 
        playerName: 'John',
        status: 'completed',
        startDate: '2024-01-01',
        limit: 10
      });
      
      expect(sql).toBe('SELECT * FROM game_sessions WHERE player_name ILIKE $1 AND status = $2 AND start_time >= $3 ORDER BY start_time DESC LIMIT $4');
      expect(params).toEqual(['%John%', 'completed', '2024-01-01', 10]);
    });
  });

  describe('Input validation', () => {
    it('should throw ValidationError for invalid playerName type', () => {
      expect(() => statsQueryBuilder.selectGameSessions({ playerName: 123 })).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid status type', () => {
      expect(() => statsQueryBuilder.selectGameSessions({ status: 123 })).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid limit', () => {
      expect(() => statsQueryBuilder.selectGameSessions({ limit: 0 })).toThrow(ValidationError);
      expect(() => statsQueryBuilder.selectGameSessions({ limit: 1001 })).toThrow(ValidationError);
    });
  });

  describe('selectPlayerStats', () => {
    it('should build player statistics query', () => {
      const { sql, params } = statsQueryBuilder.selectPlayerStats('John');
      
      expect(sql).toContain('SELECT');
      expect(sql).toContain('player_name');
      expect(sql).toContain('COUNT(*)');
      expect(sql).toContain('AVG(score)');
      expect(sql).toContain('WHERE player_name = $1');
      expect(params).toEqual(['John']);
    });

    it('should throw ValidationError for invalid playerName', () => {
      expect(() => statsQueryBuilder.selectPlayerStats(123)).toThrow(ValidationError);
      expect(() => statsQueryBuilder.selectPlayerStats('')).toThrow(ValidationError);
    });
  });

  describe('selectLeaderboard', () => {
    it('should build basic leaderboard query', () => {
      const { sql, params } = statsQueryBuilder.selectLeaderboard();
      
      expect(sql).toContain('SELECT');
      expect(sql).toContain('player_name');
      expect(sql).toContain('COUNT(*)');
      expect(sql).toContain('AVG(score)');
      expect(sql).toContain('WHERE status = \'completed\'');
      expect(sql).toContain('ORDER BY avg_score DESC');
      expect(params).toEqual([]);
    });

    it('should add weekly timeframe filter', () => {
      const { sql, params } = statsQueryBuilder.selectLeaderboard({ timeframe: 'weekly' });
      
      expect(sql).toContain('AND start_time >= NOW() - INTERVAL \'7 days\'');
      expect(params).toEqual([]);
    });

    it('should add monthly timeframe filter', () => {
      const { sql, params } = statsQueryBuilder.selectLeaderboard({ timeframe: 'monthly' });
      
      expect(sql).toContain('AND start_time >= NOW() - INTERVAL \'30 days\'');
      expect(params).toEqual([]);
    });

    it('should not add timeframe filter for invalid value', () => {
      expect(() => statsQueryBuilder.selectLeaderboard({ timeframe: 'invalid' })).toThrow(ValidationError);
    });

    it('should add limit parameter', () => {
      const { sql, params } = statsQueryBuilder.selectLeaderboard({ limit: 10 });
      
      expect(sql).toContain('LIMIT $1');
      expect(params).toEqual([10]);
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
      const { sql, params } = statsQueryBuilder.selectGameSessions({
        playerName: 'John',
        status: 'completed',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        limit: 50,
        offset: 100
      });
      
      expect(sql).toBe('SELECT * FROM game_sessions WHERE player_name ILIKE $1 AND status = $2 AND start_time >= $3 AND start_time <= $4 ORDER BY start_time DESC LIMIT $5 OFFSET $6');
      expect(params).toEqual(['%John%', 'completed', '2024-01-01', '2024-12-31', 50, 100]);
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
        offset: 0
      });
      
      // Zero values should be treated as valid for difficulty and offset
      expect(sql).toBe('SELECT * FROM cards WHERE difficulty = $1 ORDER BY date_occurred ASC OFFSET $2');
      expect(params).toEqual([0, 0]);
    });
  });

  describe('Error scenarios', () => {
    it('should handle SQL injection attempts', () => {
      const queryBuilder = new QueryBuilder();
      
      expect(() => queryBuilder.where('category = $1; DROP TABLE cards;', 'value')).toThrow(ValidationError);
      expect(() => queryBuilder.where('category = $1 UNION SELECT * FROM users', 'value')).toThrow(ValidationError);
    });

    it('should handle invalid parameter types', () => {
      const cardQueryBuilder = new CardQueryBuilder();
      
      expect(() => cardQueryBuilder.select({ category: 123 })).toThrow(ValidationError);
      expect(() => cardQueryBuilder.select({ difficulty: 'high' })).toThrow(ValidationError);
      expect(() => cardQueryBuilder.select({ limit: 'ten' })).toThrow(ValidationError);
    });

    it('should handle out-of-range values', () => {
      const cardQueryBuilder = new CardQueryBuilder();
      
      expect(() => cardQueryBuilder.select({ difficulty: -1 })).toThrow(ValidationError);
      expect(() => cardQueryBuilder.select({ difficulty: 6 })).toThrow(ValidationError);
      expect(() => cardQueryBuilder.select({ limit: 1001 })).toThrow(ValidationError);
    });
  });
}); 