/**
 * Data Transformation Utilities
 * @description Converts database snake_case to frontend camelCase format
 */

/**
 * Convert snake_case string to camelCase
 * @param {string} str - String in snake_case format
 * @returns {string} String in camelCase format
 */
function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

/**
 * Convert object keys from snake_case to camelCase
 * @param {Object} obj - Object with snake_case keys
 * @returns {Object} Object with camelCase keys
 */
function transformObjectKeys(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(transformObjectKeys);
  }

  const transformed = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = snakeToCamel(key);
    transformed[camelKey] = transformObjectKeys(value);
  }
  return transformed;
}

/**
 * Transform card data from database format to frontend format
 * @param {Object|Array} data - Card data from database
 * @returns {Object|Array} Transformed card data for frontend
 */
function transformCardData(data) {
  return transformObjectKeys(data);
}

module.exports = {
  snakeToCamel,
  transformObjectKeys,
  transformCardData,
}; 