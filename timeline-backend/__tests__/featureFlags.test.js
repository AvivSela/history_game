/**
 * Feature Flags Tests
 * @description Tests for feature flags utility
 * @version 1.0.0
 */

const { 
  featureFlags, 
  getFeatureFlag, 
  shouldUsePrisma, 
  getAllFeatureFlags, 
  validateFeatureFlags 
} = require('../utils/featureFlags');

describe('Feature Flags', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getFeatureFlag', () => {
    it('should return feature flag values', () => {
      expect(getFeatureFlag('usePrismaCards')).toBe(true);
      expect(getFeatureFlag('usePrismaSessions')).toBe(true);
      expect(getFeatureFlag('usePrismaMoves')).toBe(true);
      expect(getFeatureFlag('usePrismaStatistics')).toBe('basic');
    });
  });

  describe('shouldUsePrisma', () => {
    it('should return false for cards when flag is disabled', () => {
      // Temporarily override environment variable for this test
      const originalValue = process.env.USE_PRISMA_CARDS;
      process.env.USE_PRISMA_CARDS = 'false';
      
      // Re-require the module to get fresh feature flags
      jest.resetModules();
      const { shouldUsePrisma } = require('../utils/featureFlags');
      
      expect(shouldUsePrisma('cards')).toBe(false);
      
      // Restore original value
      process.env.USE_PRISMA_CARDS = originalValue;
    });

    it('should return true for cards when flag is enabled', () => {
      process.env.USE_PRISMA_CARDS = 'true';
      jest.resetModules();
      const { shouldUsePrisma: shouldUsePrismaUpdated } = require('../utils/featureFlags');
      expect(shouldUsePrismaUpdated('cards')).toBe(true);
    });

    it('should return false for sessions when flag is disabled', () => {
      // Temporarily override environment variable for this test
      const originalValue = process.env.USE_PRISMA_SESSIONS;
      process.env.USE_PRISMA_SESSIONS = 'false';
      
      // Re-require the module to get fresh feature flags
      jest.resetModules();
      const { shouldUsePrisma } = require('../utils/featureFlags');
      
      expect(shouldUsePrisma('sessions')).toBe(false);
      
      // Restore original value
      process.env.USE_PRISMA_SESSIONS = originalValue;
    });

    it('should return true for sessions when flag is enabled', () => {
      process.env.USE_PRISMA_SESSIONS = 'true';
      jest.resetModules();
      const { shouldUsePrisma: shouldUsePrismaUpdated } = require('../utils/featureFlags');
      expect(shouldUsePrismaUpdated('sessions')).toBe(true);
    });

    it('should return false for moves when flag is disabled', () => {
      // Temporarily override environment variable for this test
      const originalValue = process.env.USE_PRISMA_MOVES;
      process.env.USE_PRISMA_MOVES = 'false';
      
      // Re-require the module to get fresh feature flags
      jest.resetModules();
      const { shouldUsePrisma } = require('../utils/featureFlags');
      
      expect(shouldUsePrisma('moves')).toBe(false);
      
      // Restore original value
      process.env.USE_PRISMA_MOVES = originalValue;
    });

    it('should return true for moves when flag is enabled', () => {
      process.env.USE_PRISMA_MOVES = 'true';
      jest.resetModules();
      const { shouldUsePrisma: shouldUsePrismaUpdated } = require('../utils/featureFlags');
      expect(shouldUsePrismaUpdated('moves')).toBe(true);
    });

    describe('statistics', () => {
      it('should return false for complex statistics by default', () => {
        expect(shouldUsePrisma('statistics')).toBe(false);
      });

      it('should return true for basic statistics when set to basic', () => {
        process.env.USE_PRISMA_STATISTICS = 'basic';
        jest.resetModules();
        const { shouldUsePrisma: shouldUsePrismaUpdated } = require('../utils/featureFlags');
        expect(shouldUsePrismaUpdated('statistics', 'basic')).toBe(true);
      });

      it('should return true for advanced statistics when set to advanced', () => {
        process.env.USE_PRISMA_STATISTICS = 'advanced';
        jest.resetModules();
        const { shouldUsePrisma: shouldUsePrismaUpdated } = require('../utils/featureFlags');
        expect(shouldUsePrismaUpdated('statistics', 'advanced')).toBe(true);
      });

      it('should return true for all statistics when set to hybrid', () => {
        process.env.USE_PRISMA_STATISTICS = 'hybrid';
        jest.resetModules();
        const { shouldUsePrisma: shouldUsePrismaUpdated } = require('../utils/featureFlags');
        expect(shouldUsePrismaUpdated('statistics', 'basic')).toBe(true);
        expect(shouldUsePrismaUpdated('statistics', 'advanced')).toBe(true);
        expect(shouldUsePrismaUpdated('statistics')).toBe(false); // Complex analytics still use query builders
      });

      it('should return true for all statistics when set to full', () => {
        process.env.USE_PRISMA_STATISTICS = 'full';
        jest.resetModules();
        const { shouldUsePrisma: shouldUsePrismaUpdated } = require('../utils/featureFlags');
        expect(shouldUsePrismaUpdated('statistics', 'basic')).toBe(true);
        expect(shouldUsePrismaUpdated('statistics', 'advanced')).toBe(true);
        expect(shouldUsePrismaUpdated('statistics')).toBe(true); // Complex analytics use Prisma
      });
    });

    it('should return false for unknown operation', () => {
      expect(shouldUsePrisma('unknown')).toBe(false);
    });
  });

  describe('getAllFeatureFlags', () => {
    it('should return all feature flags', () => {
      const flags = getAllFeatureFlags();
      expect(flags).toHaveProperty('usePrismaCards');
      expect(flags).toHaveProperty('usePrismaSessions');
      expect(flags).toHaveProperty('usePrismaMoves');
      expect(flags).toHaveProperty('usePrismaStatistics');
    });
  });

  describe('validateFeatureFlags', () => {
    it('should validate correct configuration', () => {
      const result = validateFeatureFlags();
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should detect invalid statistics value', () => {
      process.env.USE_PRISMA_STATISTICS = 'invalid';
      jest.resetModules();
      const { validateFeatureFlags: validateFeatureFlagsUpdated } = require('../utils/featureFlags');
      const result = validateFeatureFlagsUpdated();
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Invalid USE_PRISMA_STATISTICS value');
    });

    it('should warn about potential conflicts', () => {
      process.env.USE_PRISMA_CARDS = 'true';
      process.env.USE_PRISMA_SESSIONS = 'false';
      jest.resetModules();
      const { validateFeatureFlags: validateFeatureFlagsUpdated } = require('../utils/featureFlags');
      const result = validateFeatureFlagsUpdated();
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('Cards use Prisma but sessions use query builders');
    });

    it('should warn about session/moves conflicts', () => {
      process.env.USE_PRISMA_SESSIONS = 'true';
      process.env.USE_PRISMA_MOVES = 'false';
      jest.resetModules();
      const { validateFeatureFlags: validateFeatureFlagsUpdated } = require('../utils/featureFlags');
      const result = validateFeatureFlagsUpdated();
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('Sessions use Prisma but moves use query builders');
    });
  });
}); 