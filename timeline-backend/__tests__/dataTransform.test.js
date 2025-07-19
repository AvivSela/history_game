const { snakeToCamel, transformObjectKeys, transformCardData } = require('../utils/dataTransform');

describe('Data Transformation Utilities', () => {
  describe('snakeToCamel', () => {
    it('should convert snake_case to camelCase', () => {
      expect(snakeToCamel('date_occurred')).toBe('dateOccurred');
      expect(snakeToCamel('created_at')).toBe('createdAt');
      expect(snakeToCamel('updated_at')).toBe('updatedAt');
      expect(snakeToCamel('user_id')).toBe('userId');
    });

    it('should handle strings without underscores', () => {
      expect(snakeToCamel('title')).toBe('title');
      expect(snakeToCamel('category')).toBe('category');
      expect(snakeToCamel('difficulty')).toBe('difficulty');
    });

    it('should handle empty string', () => {
      expect(snakeToCamel('')).toBe('');
    });
  });

  describe('transformObjectKeys', () => {
    it('should transform object keys from snake_case to camelCase', () => {
      const input = {
        id: 1,
        title: 'Test Event',
        date_occurred: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      const expected = {
        id: 1,
        title: 'Test Event',
        dateOccurred: '2024-01-01',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      expect(transformObjectKeys(input)).toEqual(expected);
    });

    it('should handle nested objects', () => {
      const input = {
        id: 1,
        metadata: {
          created_at: '2024-01-01T00:00:00Z',
          user_id: 123
        }
      };

      const expected = {
        id: 1,
        metadata: {
          createdAt: '2024-01-01T00:00:00Z',
          userId: 123
        }
      };

      expect(transformObjectKeys(input)).toEqual(expected);
    });

    it('should handle arrays', () => {
      const input = [
        { id: 1, date_occurred: '2024-01-01' },
        { id: 2, date_occurred: '2024-01-02' }
      ];

      const expected = [
        { id: 1, dateOccurred: '2024-01-01' },
        { id: 2, dateOccurred: '2024-01-02' }
      ];

      expect(transformObjectKeys(input)).toEqual(expected);
    });

    it('should handle null and non-objects', () => {
      expect(transformObjectKeys(null)).toBe(null);
      expect(transformObjectKeys(undefined)).toBe(undefined);
      expect(transformObjectKeys('string')).toBe('string');
      expect(transformObjectKeys(123)).toBe(123);
    });

    it('should handle Date objects correctly', () => {
      const testDate = new Date('2024-01-01T00:00:00Z');
      expect(transformObjectKeys(testDate)).toBe(testDate);
      
      const input = {
        id: 1,
        date_occurred: testDate,
        created_at: new Date('2024-01-01T00:00:00Z')
      };
      
      const expected = {
        id: 1,
        dateOccurred: testDate,
        createdAt: new Date('2024-01-01T00:00:00Z')
      };
      
      const result = transformObjectKeys(input);
      expect(result.dateOccurred).toBe(testDate);
      expect(result.dateOccurred instanceof Date).toBe(true);
      expect(result.createdAt instanceof Date).toBe(true);
    });
  });

  describe('transformCardData', () => {
    it('should transform single card data', () => {
      const input = {
        id: 1,
        title: 'World War II ends',
        date_occurred: '1945-09-02',
        category: 'History',
        difficulty: 1,
        description: 'Japan formally surrendered',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      const expected = {
        id: 1,
        title: 'World War II ends',
        dateOccurred: '1945-09-02',
        category: 'History',
        difficulty: 1,
        description: 'Japan formally surrendered',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      expect(transformCardData(input)).toEqual(expected);
    });

    it('should transform array of card data', () => {
      const input = [
        {
          id: 1,
          title: 'Event 1',
          date_occurred: '1945-09-02',
          category: 'History'
        },
        {
          id: 2,
          title: 'Event 2',
          date_occurred: '1969-07-20',
          category: 'Space'
        }
      ];

      const expected = [
        {
          id: 1,
          title: 'Event 1',
          dateOccurred: '1945-09-02',
          category: 'History'
        },
        {
          id: 2,
          title: 'Event 2',
          dateOccurred: '1969-07-20',
          category: 'Space'
        }
      ];

      expect(transformCardData(input)).toEqual(expected);
    });
  });
}); 