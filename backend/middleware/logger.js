import winston from 'winston';
import morgan from 'morgan';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

// Create Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'ecom-api' },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Morgan HTTP request logger
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';

// Custom Morgan token for response time with colors
morgan.token('colored-response-time', (req, res) => {
  const responseTime = parseFloat(morgan['response-time'](req, res));
  if (responseTime < 100) return chalk.green(`${responseTime}ms`);
  if (responseTime < 500) return chalk.yellow(`${responseTime}ms`);
  return chalk.red(`${responseTime}ms`);
});

// Custom Morgan format for development
const devFormat = ':method :url :status :colored-response-time - :res[content-length]';

export const httpLogger = morgan(
  process.env.NODE_ENV === 'production' ? morganFormat : devFormat,
  {
    stream: {
      write: (message) => {
        logger.info(message.trim());
      }
    },
    skip: (req, res) => {
      // Skip logging for health checks and static files
      return req.url === '/health' || req.url.startsWith('/static');
    }
  }
);

// Security event logger
export const logSecurityEvent = (event, details = {}) => {
  logger.warn('Security Event', {
    event,
    ...details,
    timestamp: new Date().toISOString(),
    severity: 'HIGH'
  });
};

// Database operation logger
export const logDatabaseOperation = (operation, collection, details = {}) => {
  logger.info('Database Operation', {
    operation,
    collection,
    ...details,
    timestamp: new Date().toISOString()
  });
};

// API usage logger
export const logApiUsage = (endpoint, userId, method, responseTime) => {
  logger.info('API Usage', {
    endpoint,
    userId,
    method,
    responseTime,
    timestamp: new Date().toISOString()
  });
};

// Error logger with context
export const logError = (error, context = {}) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    ...context,
    timestamp: new Date().toISOString()
  });
};

// Performance logger
export const logPerformance = (operation, duration, details = {}) => {
  const level = duration > 1000 ? 'warn' : 'info';
  logger[level]('Performance Metric', {
    operation,
    duration: `${duration}ms`,
    ...details,
    timestamp: new Date().toISOString()
  });
};

// User activity logger
export const logUserActivity = (userId, action, details = {}) => {
  logger.info('User Activity', {
    userId,
    action,
    ...details,
    timestamp: new Date().toISOString()
  });
};

export default logger;