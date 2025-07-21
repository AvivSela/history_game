import { describe, it, expect } from 'vitest';
import {
  validateSetting,
  validateSettings,
  getValidationSchema,
  getAllValidationSchemas,
  isSettingValid,
  getErrorMessages,
  getWarningMessages,
  getSuggestionMessages,
} from './settingsValidation';
import { DIFFICULTY_LEVELS, CARD_COUNTS } from '../constants/gameConstants';

describe('Settings Validation', () => {
  describe('validateSetting', () => {
    describe('Difficulty Validation', () => {
      it('should validate valid difficulty ranges', () => {
        const validDifficulties = [
          { min: 1, max: 1 }, // Easy only
          { min: 1, max: 2 }, // Easy to Medium
          { min: 1, max: 4 }, // All difficulties
          { min: 2, max: 3 }, // Medium to Hard
          { min: 4, max: 4 }, // Expert only
        ];
        
        validDifficulties.forEach(difficulty => {
          const result = validateSetting('difficulty', difficulty);
          expect(result.isValid).toBe(true);
          expect(result.errors).toHaveLength(0);
        });
      });

      it('should reject invalid difficulty levels', () => {
        const result = validateSetting('difficulty', 'invalid');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'difficulty: Expected object, got string'
        );
      });

      it('should warn for expert difficulty', () => {
        const result = validateSetting('difficulty', { min: 4, max: 4 });
        expect(result.isValid).toBe(true);
        expect(result.warnings).toContain(
          'Expert difficulty is very challenging and may not be suitable for all players'
        );
      });

      it('should warn for single difficulty level', () => {
        const result = validateSetting('difficulty', { min: 2, max: 2 });
        expect(result.isValid).toBe(true);
        expect(result.warnings).toContain(
          'Single difficulty level selected - consider expanding range for more variety'
        );
      });

      it('should warn for very wide range', () => {
        const result = validateSetting('difficulty', { min: 1, max: 4 });
        expect(result.isValid).toBe(true);
        expect(result.warnings).toContain(
          'Very wide difficulty range may create inconsistent gameplay experience'
        );
      });

      it('should handle null difficulty', () => {
        const result = validateSetting('difficulty', null);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('difficulty is required');
      });

      it('should handle undefined difficulty', () => {
        const result = validateSetting('difficulty', undefined);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('difficulty is required');
      });

      it('should reject min greater than max', () => {
        const result = validateSetting('difficulty', { min: 3, max: 2 });
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Difficulty min cannot be greater than max');
      });

      it('should reject min below 1', () => {
        const result = validateSetting('difficulty', { min: 0, max: 2 });
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Difficulty min must be between 1 and 4');
      });

      it('should reject max above 4', () => {
        const result = validateSetting('difficulty', { min: 1, max: 5 });
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Difficulty max must be between 1 and 4');
      });
    });

    describe('Card Count Validation', () => {
      it('should validate valid card counts', () => {
        const validCounts = [1, 5, 10, 15, 20];
        validCounts.forEach(count => {
          const result = validateSetting('cardCount', count);
          expect(result.isValid).toBe(true);
          expect(result.errors).toHaveLength(0);
        });
      });

      it('should reject card count below minimum', () => {
        const result = validateSetting('cardCount', 0);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Card count must be at least 1');
      });

      it('should reject card count above maximum', () => {
        const result = validateSetting('cardCount', 21);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Card count cannot exceed 20');
      });

      it('should reject non-numeric card count', () => {
        const result = validateSetting('cardCount', 'five');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'cardCount: Expected number, got string'
        );
      });

      it('should reject NaN card count', () => {
        const result = validateSetting('cardCount', NaN);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Card count must be a valid number');
      });

      it('should warn for high card counts', () => {
        const result = validateSetting('cardCount', 15);
        expect(result.isValid).toBe(true);
        expect(result.warnings).toContain(
          'High card counts may impact performance on slower devices'
        );
      });
    });

    describe('Categories Validation', () => {
      it('should validate empty categories array', () => {
        const result = validateSetting('categories', []);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should validate valid categories array', () => {
        const result = validateSetting('categories', [
          'history',
          'science',
          'politics',
        ]);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject non-array categories', () => {
        const result = validateSetting('categories', 'history');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Categories must be an array');
      });

      it('should reject categories with non-string items', () => {
        const result = validateSetting('categories', [
          'history',
          123,
          'science',
        ]);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Category at index 1 must be a string');
      });

      it('should warn for empty category strings', () => {
        const result = validateSetting('categories', [
          'history',
          '',
          'science',
        ]);
        expect(result.isValid).toBe(true);
        expect(result.warnings).toContain(
          'Empty category at index 1 will be ignored'
        );
      });

      it('should warn for duplicate categories', () => {
        const result = validateSetting('categories', [
          'history',
          'science',
          'history',
        ]);
        expect(result.isValid).toBe(true);
        expect(result.warnings).toContain(
          'Duplicate categories found and will be removed'
        );
      });
    });

    describe('Boolean Settings Validation', () => {
      const booleanSettings = ['animations', 'soundEffects'];

      booleanSettings.forEach(setting => {
        it(`should validate ${setting} with boolean values`, () => {
          const trueResult = validateSetting(setting, true);
          const falseResult = validateSetting(setting, false);

          expect(trueResult.isValid).toBe(true);
          expect(falseResult.isValid).toBe(true);
          expect(trueResult.errors).toHaveLength(0);
          expect(falseResult.errors).toHaveLength(0);
        });

        it(`should reject ${setting} with non-boolean values`, () => {
          const result = validateSetting(setting, 'true');
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain(
            `${setting} setting must be true or false`
          );
        });
      });
    });

    describe('Version Validation', () => {
      it('should validate correct version format', () => {
        const validVersions = ['1.0.0', '2.1.3', '10.5.2'];
        validVersions.forEach(version => {
          const result = validateSetting('version', version);
          expect(result.isValid).toBe(true);
          expect(result.errors).toHaveLength(0);
        });
      });

      it('should reject invalid version format', () => {
        const invalidVersions = ['1.0', '1.0.0.0', '1.0.0a', 'version'];
        invalidVersions.forEach(version => {
          const result = validateSetting('version', version);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain(
            'Version must be in semantic version format (e.g., 1.0.0)'
          );
        });
      });
    });

    describe('Unknown Setting Keys', () => {
      it('should reject unknown setting keys', () => {
        const result = validateSetting('unknownSetting', 'value');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Unknown setting key: unknownSetting');
      });
    });
  });

  describe('validateSettings', () => {
    it('should validate complete valid settings object', () => {
      const validSettings = {
        difficulty: { min: 1, max: 4 },
        cardCount: CARD_COUNTS.SINGLE,
        categories: ['history'],
        animations: true,
        soundEffects: true,
        version: '1.0.0',
      };

      const result = validateSettings(validSettings);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-object settings', () => {
      const result = validateSettings('not an object');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Settings must be an object');
    });

    it('should reject null settings', () => {
      const result = validateSettings(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Settings must be an object');
    });

    it('should detect missing required settings', () => {
      const incompleteSettings = {
        difficulty: { min: 1, max: 4 },
        // Missing other required settings
      };

      const result = validateSettings(incompleteSettings);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Missing required settings: cardCount, categories, animations, soundEffects, version'
      );
    });

    it('should provide field-level results', () => {
      const settings = {
        difficulty: { min: 1, max: 4 },
        cardCount: 'invalid',
        categories: ['history'],
        animations: true,
        soundEffects: true,
        version: '1.0.0',
      };

      const result = validateSettings(settings);
      expect(result.isValid).toBe(false);
      expect(result.fieldResults).toHaveProperty('difficulty');
      expect(result.fieldResults).toHaveProperty('cardCount');
      expect(result.fieldResults.cardCount.isValid).toBe(false);
      expect(result.fieldResults.difficulty.isValid).toBe(true);
    });

    it('should detect cross-field validation issues', () => {
      const conflictingSettings = {
        difficulty: { min: 1, max: 4 },
        cardCount: CARD_COUNTS.SINGLE,
        categories: ['history'],
        animations: false,
        soundEffects: true,
        version: '1.0.0',
      };

      const result = validateSettings(conflictingSettings);
      expect(result.isValid).toBe(true); // Cross-field issues are warnings, not errors
    });
  });

  describe('Utility Functions', () => {
    describe('getValidationSchema', () => {
      it('should return schema for valid setting key', () => {
        const schema = getValidationSchema('difficulty');
        expect(schema).toBeDefined();
        expect(schema.type).toBe('object');
        expect(schema.required).toBe(true);
      });

      it('should return null for invalid setting key', () => {
        const schema = getValidationSchema('unknownSetting');
        expect(schema).toBeNull();
      });
    });

    describe('getAllValidationSchemas', () => {
      it('should return all validation schemas', () => {
        const schemas = getAllValidationSchemas();
        expect(schemas).toHaveProperty('difficulty');
        expect(schemas).toHaveProperty('cardCount');
        expect(schemas).toHaveProperty('categories');
        expect(schemas).toHaveProperty('animations');
        expect(schemas).toHaveProperty('soundEffects');

        expect(schemas).toHaveProperty('version');
      });
    });

    describe('isSettingValid', () => {
      it('should return true for valid settings', () => {
        expect(isSettingValid('difficulty', { min: 1, max: 4 })).toBe(
          true
        );
        expect(isSettingValid('cardCount', 5)).toBe(true);
        expect(isSettingValid('animations', true)).toBe(true);
      });

      it('should return false for invalid settings', () => {
        expect(isSettingValid('difficulty', 'invalid')).toBe(false);
        expect(isSettingValid('cardCount', -1)).toBe(false);
        expect(isSettingValid('animations', 'true')).toBe(false);
      });
    });

    describe('getErrorMessages', () => {
      it('should return user-friendly error messages', () => {
        const result = validateSetting('difficulty', 'invalid');
        const messages = getErrorMessages(result);

        expect(messages).toHaveLength(1);
        expect(messages[0]).toContain(
          'difficulty: This setting should be object, but it is string'
        );
      });

      it('should handle empty result', () => {
        const messages = getErrorMessages(null);
        expect(messages).toEqual([]);
      });

      it('should transform technical error messages', () => {
        const result = validateSetting('cardCount', 'five');
        const messages = getErrorMessages(result);

        expect(messages[0]).toContain(
          'This setting should be number, but it is string'
        );
      });
    });

    describe('getWarningMessages', () => {
      it('should return warning messages', () => {
        const result = validateSetting('difficulty', { min: 4, max: 4 });
        const warnings = getWarningMessages(result);

        expect(warnings).toContain(
          'Expert difficulty is very challenging and may not be suitable for all players'
        );
      });

      it('should handle empty result', () => {
        const warnings = getWarningMessages(null);
        expect(warnings).toEqual([]);
      });
    });

    describe('getSuggestionMessages', () => {
      it('should handle empty result', () => {
        const suggestions = getSuggestionMessages(null);
        expect(suggestions).toEqual([]);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined values for optional fields', () => {
      // Note: All fields are currently required, so this would fail
      const result = validateSetting('difficulty', undefined);
      expect(result.isValid).toBe(false);
    });

    it('should handle empty string values', () => {
      const result = validateSetting('difficulty', '');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'difficulty: Expected object, got string'
      );
    });

    it('should handle whitespace-only strings', () => {
      const result = validateSetting('difficulty', '   ');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'difficulty: Expected object, got string'
      );
    });

    it('should handle very large numbers', () => {
      const result = validateSetting('cardCount', 999999);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Card count cannot exceed 20');
    });

    it('should handle negative numbers', () => {
      const result = validateSetting('cardCount', -5);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Card count must be at least 1');
    });

    it('should handle floating point numbers', () => {
      const result = validateSetting('cardCount', 5.5);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Card count must be a whole number');
    });
  });

  describe('Performance Considerations', () => {
    it('should handle large category arrays efficiently', () => {
      const largeCategories = Array.from(
        { length: 1000 },
        (_, i) => `category${i}`
      );
      const startTime = Date.now();

      const result = validateSetting('categories', largeCategories);

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
      expect(result.isValid).toBe(true);
    });

    it('should handle nested object validation efficiently', () => {
      const complexSettings = {
        difficulty: { min: 1, max: 4 },
        cardCount: CARD_COUNTS.SINGLE,
        categories: Array.from({ length: 100 }, (_, i) => `category${i}`),
        animations: true,
        soundEffects: true,
        version: '1.0.0',
      };

      const startTime = Date.now();
      const result = validateSettings(complexSettings);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
      expect(result.isValid).toBe(true);
    });
  });
});
