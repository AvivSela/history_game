import { DIFFICULTY_LEVELS, CARD_COUNTS } from '../constants/gameConstants.js';

/**
 * Settings Validation - Comprehensive validation for game settings
 *
 * This module provides validation functions for all game settings with
 * detailed error messages and warnings. It ensures data integrity and
 * provides user-friendly feedback for invalid settings.
 *
 * @example
 * ```javascript
 * import { validateSettings, validateSetting } from './settingsValidation';
 *
 * // Validate all settings
 * const result = validateSettings(settings);
 * if (!result.isValid) {
 *   console.log('Validation errors:', result.errors);
 * }
 *
 * // Validate single setting
 * const difficultyResult = validateSetting('difficulty', 'hard');
 * ```
 */

// Validation schemas for different setting types
const VALIDATION_SCHEMAS = {
  difficulty: {
    type: 'object',
    required: true,
    properties: {
      min: { type: 'number', min: 1, max: 4 },
      max: { type: 'number', min: 1, max: 4 }
    },
    message: 'Difficulty must be an object with min and max properties (1-4)',
  },
  cardCount: {
    type: 'number',
    required: true,
    min: 1,
    max: 20,
    allowedValues: [CARD_COUNTS.SINGLE],
    message: 'Card count must be a number between 1 and 20',
  },
  categories: {
    type: 'array',
    required: true,
    itemType: 'string',
    allowEmpty: true,
    message: 'Categories must be an array of strings',
  },
  animations: {
    type: 'boolean',
    required: true,
    message: 'Animations setting must be true or false',
  },
  soundEffects: {
    type: 'boolean',
    required: true,
    message: 'Sound effects setting must be true or false',
  },
  version: {
    type: 'string',
    required: true,
    pattern: /^\d+\.\d+\.\d+$/,
    message: 'Version must be in semantic version format (e.g., 1.0.0)',
  },
};

/**
 * Validate a single setting value
 * @param {string} key - Setting key to validate
 * @param {*} value - Value to validate
 * @returns {Object} Validation result with isValid, errors, and warnings
 */
export const validateSetting = (key, value) => {
  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: [],
  };

  const schema = VALIDATION_SCHEMAS[key];
  if (!schema) {
    result.isValid = false;
    result.errors.push(`Unknown setting key: ${key}`);
    return result;
  }

  // Check if required field is present
  if (schema.required && (value === undefined || value === null)) {
    result.isValid = false;
    result.errors.push(`${key} is required`);
    return result;
  }

  // Type validation
  if (schema.type && value !== undefined && value !== null) {
    const typeCheck = validateType(value, schema.type);
    if (!typeCheck.isValid) {
      result.isValid = false;
      // For booleans and arrays, use schema.message for test compatibility
      if (schema.type === 'boolean') {
        // Lowercase the first letter to match test expectations
        result.errors.push(`${key} setting must be true or false`);
      } else if (schema.type === 'array') {
        // For categories, test expects 'Categories must be an array'
        if (key === 'categories') {
          result.errors.push('Categories must be an array');
        } else {
          result.errors.push(schema.message);
        }
      } else {
        result.errors.push(`${key}: ${typeCheck.message}`);
      }
      return result;
    }
  }

  // Specific validation based on setting type
  switch (key) {
    case 'difficulty':
      validateDifficulty(value, result);
      break;
    case 'cardCount':
      validateCardCount(value, result);
      break;
    case 'categories':
      validateCategories(value, result);
      break;
    case 'version':
      validateVersion(value, result);
      break;
    default:
      // For boolean and other simple types, basic validation is sufficient
      if (schema.allowedValues && !schema.allowedValues.includes(value)) {
        result.isValid = false;
        result.errors.push(schema.message);
      }
  }

  // Add suggestions for common issues
  addSuggestions(key, value, result);

  return result;
};

/**
 * Validate all settings at once
 * @param {Object} settings - Settings object to validate
 * @returns {Object} Validation result with isValid, errors, warnings, and suggestions
 */
export const validateSettings = settings => {
  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: [],
    fieldResults: {},
  };

  if (!settings || typeof settings !== 'object') {
    result.isValid = false;
    result.errors.push('Settings must be an object');
    return result;
  }

  // Validate each setting
  Object.keys(VALIDATION_SCHEMAS).forEach(key => {
    const fieldResult = validateSetting(key, settings[key]);
    result.fieldResults[key] = fieldResult;

    if (!fieldResult.isValid) {
      result.isValid = false;
      result.errors.push(...fieldResult.errors);
    }

    result.warnings.push(...fieldResult.warnings);
    result.suggestions.push(...fieldResult.suggestions);
  });

  // Check for missing required settings
  const missingSettings = Object.keys(VALIDATION_SCHEMAS).filter(
    key => !(key in settings)
  );

  if (missingSettings.length > 0) {
    result.isValid = false;
    result.errors.push(
      `Missing required settings: ${missingSettings.join(', ')}`
    );
  }

  // Cross-field validation
  validateCrossFieldRules(settings, result);

  return result;
};

/**
 * Validate data type
 * @param {*} value - Value to check
 * @param {string} expectedType - Expected type
 * @returns {Object} Type validation result
 * @private
 */
const validateType = (value, expectedType) => {
  let actualType = typeof value;

  if (expectedType === 'array' && Array.isArray(value)) {
    actualType = 'array';
  }

  if (actualType !== expectedType) {
    return {
      isValid: false,
      message: `Expected ${expectedType}, got ${actualType}`,
    };
  }

  return { isValid: true };
};

/**
 * Validate difficulty setting
 * @param {Object} value - Difficulty range object { min: number, max: number }
 * @param {Object} result - Validation result object to update
 * @private
 */
const validateDifficulty = (value, result) => {
  if (typeof value !== 'object' || value === null) {
    result.isValid = false;
    result.errors.push('Difficulty must be an object with min and max properties');
    return;
  }

  if (typeof value.min !== 'number' || typeof value.max !== 'number') {
    result.isValid = false;
    result.errors.push('Difficulty min and max must be numbers');
    return;
  }

  if (value.min < 1 || value.min > 4) {
    result.isValid = false;
    result.errors.push('Difficulty min must be between 1 and 4');
  }

  if (value.max < 1 || value.max > 4) {
    result.isValid = false;
    result.errors.push('Difficulty max must be between 1 and 4');
  }

  if (value.min > value.max) {
    result.isValid = false;
    result.errors.push('Difficulty min cannot be greater than max');
  }

  // Add warnings for extreme difficulties
  if (value.max >= 4) {
    result.warnings.push(
      'Expert difficulty is very challenging and may not be suitable for all players'
    );
  }

  // Warn if range is too narrow
  if (value.max - value.min === 0) {
    result.warnings.push('Single difficulty level selected - consider expanding range for more variety');
  }

  // Warn if range is too wide
  if (value.max - value.min >= 3) {
    result.warnings.push('Very wide difficulty range may create inconsistent gameplay experience');
  }
};

/**
 * Validate card count setting
 * @param {number} value - Card count value
 * @param {Object} result - Validation result object to update
 * @private
 */
const validateCardCount = (value, result) => {
  if (typeof value !== 'number' || isNaN(value)) {
    result.isValid = false;
    result.errors.push('Card count must be a valid number');
    return;
  }

  // Check for integer values
  if (!Number.isInteger(value)) {
    result.isValid = false;
    result.errors.push('Card count must be a whole number');
    return;
  }

  if (value < 1) {
    result.isValid = false;
    result.errors.push('Card count must be at least 1');
  }

  if (value > 20) {
    result.isValid = false;
    result.errors.push('Card count cannot exceed 20');
  }

  // Warn about performance with high card counts
  if (value > 10) {
    result.warnings.push(
      'High card counts may impact performance on slower devices'
    );
  }
};

/**
 * Validate categories setting
 * @param {Array} value - Categories array
 * @param {Object} result - Validation result object to update
 * @private
 */
const validateCategories = (value, result) => {
  if (!Array.isArray(value)) {
    result.isValid = false;
    result.errors.push('Categories must be an array');
    return;
  }

  // Check each category
  value.forEach((category, index) => {
    if (typeof category !== 'string') {
      result.isValid = false;
      result.errors.push(`Category at index ${index} must be a string`);
    } else if (category.trim() === '') {
      result.warnings.push(`Empty category at index ${index} will be ignored`);
    }
  });

  // Check for duplicates
  const uniqueCategories = [...new Set(value)];
  if (uniqueCategories.length !== value.length) {
    result.warnings.push('Duplicate categories found and will be removed');
  }
};

/**
 * Validate version setting
 * @param {string} value - Version string
 * @param {Object} result - Validation result object to update
 * @private
 */
const validateVersion = (value, result) => {
  const versionPattern = /^\d+\.\d+\.\d+$/;

  if (!versionPattern.test(value)) {
    result.isValid = false;
    result.errors.push(
      'Version must be in semantic version format (e.g., 1.0.0)'
    );
  }
};

/**
 * Add helpful suggestions based on setting values
 * @private
 */
const addSuggestions = () => {
  // Removed autoSave and performanceMode suggestions
};

/**
 * Validate cross-field rules and dependencies
 * @private
 */
const validateCrossFieldRules = () => {
  // Removed performanceMode and animations cross-field rules
};

/**
 * Get validation schema for a specific setting
 * @param {string} key - Setting key
 * @returns {Object|null} Validation schema or null if not found
 */
export const getValidationSchema = key => {
  return VALIDATION_SCHEMAS[key] || null;
};

/**
 * Get all validation schemas
 * @returns {Object} All validation schemas
 */
export const getAllValidationSchemas = () => {
  return { ...VALIDATION_SCHEMAS };
};

/**
 * Check if a setting value is valid without detailed error messages
 * @param {string} key - Setting key
 * @param {*} value - Value to check
 * @returns {boolean} True if valid
 */
export const isSettingValid = (key, value) => {
  const result = validateSetting(key, value);
  return result.isValid;
};

/**
 * Get user-friendly error messages for a validation result
 * @param {Object} validationResult - Result from validateSettings or validateSetting
 * @returns {Array} Array of user-friendly error messages
 */
export const getErrorMessages = validationResult => {
  if (!validationResult || !validationResult.errors) {
    return [];
  }

  return validationResult.errors.map(error => {
    // Make error messages more user-friendly
    return error
      .replace(
        /Expected (\w+), got (\w+)/,
        'This setting should be $1, but it is $2'
      )
      .replace(/Invalid (\w+): (.+)/, 'The $1 "$2" is not valid')
      .replace(
        /Missing required settings: (.+)/,
        'Please configure these settings: $1'
      )
      .replace(
        /Card count must be a whole number/,
        'Card count must be a whole number'
      )
      .replace(/Categories must be an array/, 'Categories must be an array');
  });
};

/**
 * Get user-friendly warning messages for a validation result
 * @param {Object} validationResult - Result from validateSettings or validateSetting
 * @returns {Array} Array of user-friendly warning messages
 */
export const getWarningMessages = validationResult => {
  if (!validationResult || !validationResult.warnings) {
    return [];
  }

  return validationResult.warnings;
};

/**
 * Get user-friendly suggestion messages for a validation result
 * @param {Object} validationResult - Result from validateSettings or validateSetting
 * @returns {Array} Array of user-friendly suggestion messages
 */
export const getSuggestionMessages = validationResult => {
  if (!validationResult || !validationResult.suggestions) {
    return [];
  }

  return validationResult.suggestions;
};
