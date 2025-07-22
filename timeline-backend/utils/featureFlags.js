/**
 * Feature Flags Utility
 * @description Manages feature flags for hybrid Prisma/Query Builder approach
 * @version 1.0.0
 */

/**
 * Feature flags configuration
 * @description Controls which operations use Prisma vs existing query builders
 */
const featureFlags = {
  // Card operations
  usePrismaCards: process.env.USE_PRISMA_CARDS === 'true',
  
  // Game session operations
  usePrismaSessions: process.env.USE_PRISMA_SESSIONS === 'true',
  
  // Game move operations
  usePrismaMoves: process.env.USE_PRISMA_MOVES === 'true',
  
  // Statistics operations
  usePrismaStatistics: process.env.USE_PRISMA_STATISTICS || 'hybrid'
};

/**
 * Get feature flag value
 * @param {string} flagName - Name of the feature flag
 * @returns {boolean|string} Feature flag value
 */
function getFeatureFlag(flagName) {
  return featureFlags[flagName];
}

/**
 * Check if Prisma should be used for a specific operation
 * @param {string} operation - Operation type (cards, sessions, moves, statistics)
 * @param {string} type - Statistics type (basic, advanced, full) - only for statistics
 * @returns {boolean} Whether to use Prisma
 */
function shouldUsePrisma(operation, type = null) {
  switch (operation) {
    case 'cards':
      return featureFlags.usePrismaCards;
    
    case 'sessions':
      return featureFlags.usePrismaSessions;
    
    case 'moves':
      return featureFlags.usePrismaMoves;
    
    case 'statistics':
      if (type === 'basic') {
        return featureFlags.usePrismaStatistics === 'basic' || featureFlags.usePrismaStatistics === 'hybrid' || featureFlags.usePrismaStatistics === 'full';
      } else if (type === 'advanced') {
        return featureFlags.usePrismaStatistics === 'advanced' || featureFlags.usePrismaStatistics === 'hybrid' || featureFlags.usePrismaStatistics === 'full';
      } else {
        // For complex analytics, prefer query builders unless explicitly set to use Prisma
        return featureFlags.usePrismaStatistics === 'full';
      }
    
    default:
      return false;
  }
}

/**
 * Get all feature flags for debugging
 * @returns {Object} All feature flags
 */
function getAllFeatureFlags() {
  return { ...featureFlags };
}

/**
 * Validate feature flag configuration
 * @returns {Object} Validation result
 */
function validateFeatureFlags() {
  const validStatisticsValues = ['basic', 'advanced', 'hybrid', 'full'];
  const errors = [];
  const warnings = [];

  // Validate statistics flag
  if (!validStatisticsValues.includes(featureFlags.usePrismaStatistics)) {
    errors.push(`Invalid USE_PRISMA_STATISTICS value: ${featureFlags.usePrismaStatistics}. Must be one of: ${validStatisticsValues.join(', ')}`);
  }

  // Check for potential conflicts
  if (featureFlags.usePrismaCards && !featureFlags.usePrismaSessions) {
    warnings.push('Cards use Prisma but sessions use query builders - this may cause consistency issues');
  }

  if (featureFlags.usePrismaSessions && !featureFlags.usePrismaMoves) {
    warnings.push('Sessions use Prisma but moves use query builders - this may cause consistency issues');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    flags: getAllFeatureFlags()
  };
}

module.exports = {
  featureFlags,
  getFeatureFlag,
  shouldUsePrisma,
  getAllFeatureFlags,
  validateFeatureFlags
}; 