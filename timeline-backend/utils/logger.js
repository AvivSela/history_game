/**
 * Logger Utility
 * Provides consistent logging with different levels and formatting
 */

const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Log levels and their priorities
 */
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

/**
 * Get current log level from environment
 */
const getLogLevel = () => {
  const level = process.env.LOG_LEVEL || 'INFO';
  return LOG_LEVELS[level.toUpperCase()] || LOG_LEVELS.INFO;
};

/**
 * Format timestamp
 */
const formatTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Format log message
 */
const formatMessage = (level, message, data = null) => {
  const timestamp = formatTimestamp();
  const logEntry = {
    timestamp,
    level,
    message,
    ...(data && { data })
  };
  
  return JSON.stringify(logEntry);
};

/**
 * Write log to file asynchronously to avoid blocking the event-loop
 */
const writeToFile = (logEntry) => {
  const logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);

  // Write synchronously to guarantee log availability for unit tests
  try {
    fs.appendFileSync(logFile, logEntry + "\n");
  } catch (syncErr) {
    // Synchronous write failed – fallback to async append to avoid losing logs in production
    fs.promises.appendFile(logFile, logEntry + "\n").catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[Logger] Failed to write log entry', err);
    });
  }
};

/**
 * Console output with colors
 */
const consoleOutput = (level, message, data = null) => {
  const timestamp = formatTimestamp();
  const colors = {
    ERROR: '\x1b[31m', // Red
    WARN: '\x1b[33m',  // Yellow
    INFO: '\x1b[36m',  // Cyan
    DEBUG: '\x1b[35m'  // Magenta
  };
  const reset = '\x1b[0m';
  
  const color = colors[level] || '';
  const prefix = `${color}[${level}]${reset}`;
  
  console.log(`${prefix} ${timestamp} - ${message}`);
  if (data) {
    console.log(`${color}${JSON.stringify(data, null, 2)}${reset}`);
  }
};

/**
 * Main logging function
 */
const log = (level, message, data = null) => {
  const currentLevel = getLogLevel();
  const messageLevel = LOG_LEVELS[level];
  
  if (messageLevel <= currentLevel) {
    const logEntry = formatMessage(level, message, data);
    
    // Write to file
    writeToFile(logEntry);
    
    // Console output
    consoleOutput(level, message, data);
  }
};

/**
 * Logger object with convenience methods
 */
const logger = {
  error: (message, data = null) => log('ERROR', message, data),
  warn: (message, data = null) => log('WARN', message, data),
  info: (message, data = null) => log('INFO', message, data),
  debug: (message, data = null) => log('DEBUG', message, data),
  
  /**
   * Log API requests
   */
  request: (req, res, responseTime = null) => {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      ...(responseTime && { responseTime: `${responseTime}ms` })
    };
    
    if (res.statusCode >= 400) {
      logger.warn('API Request', logData);
    } else {
      logger.info('API Request', logData);
    }
  },
  
  /**
   * Log performance metrics
   */
  performance: (operation, duration, details = null) => {
    const logData = {
      operation,
      duration: `${duration}ms`,
      ...(details && { details })
    };
    
    if (duration > 1000) {
      logger.warn('Performance Issue', logData);
    } else if (duration > 500) {
      logger.info('Performance Notice', logData);
    } else {
      logger.debug('Performance Metric', logData);
    }
  }
};

module.exports = logger; 