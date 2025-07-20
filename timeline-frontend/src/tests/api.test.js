import { describe, test, expect } from 'vitest';
import { API } from '../constants/gameConstants';

describe('API Configuration', () => {
  describe('API Constants', () => {
    test('should have correct base URL', () => {
      expect(API.BASE_URL).toBeDefined();
      expect(typeof API.BASE_URL).toBe('string');
      expect(API.BASE_URL).toContain('api');
    });

    test('should have enhanced endpoints', () => {
      expect(API.ENDPOINTS).toBeDefined();
      expect(API.ENDPOINTS.HEALTH).toBe('/health');
      expect(API.ENDPOINTS.EVENTS).toBe('/events');
      expect(API.ENDPOINTS.GAME_SESSIONS).toBe('/game-sessions');
      expect(API.ENDPOINTS.STATISTICS).toBe('/statistics');
      expect(API.ENDPOINTS.ANALYTICS).toBe('/analytics');
      expect(API.ENDPOINTS.ADMIN).toBe('/admin');
      expect(API.ENDPOINTS.CATEGORIES).toBe('/categories');
    });

    test('should have enhanced status codes', () => {
      expect(API.STATUS_CODES.OK).toBe(200);
      expect(API.STATUS_CODES.CREATED).toBe(201);
      expect(API.STATUS_CODES.ACCEPTED).toBe(202);
      expect(API.STATUS_CODES.NO_CONTENT).toBe(204);
      expect(API.STATUS_CODES.BAD_REQUEST).toBe(400);
      expect(API.STATUS_CODES.UNAUTHORIZED).toBe(401);
      expect(API.STATUS_CODES.FORBIDDEN).toBe(403);
      expect(API.STATUS_CODES.NOT_FOUND).toBe(404);
      expect(API.STATUS_CODES.CONFLICT).toBe(409);
      expect(API.STATUS_CODES.UNPROCESSABLE_ENTITY).toBe(422);
      expect(API.STATUS_CODES.TOO_MANY_REQUESTS).toBe(429);
      expect(API.STATUS_CODES.INTERNAL_SERVER_ERROR).toBe(500);
      expect(API.STATUS_CODES.SERVICE_UNAVAILABLE).toBe(503);
    });

    test('should have error messages', () => {
      expect(API.ERROR_MESSAGES).toBeDefined();
      expect(API.ERROR_MESSAGES.NETWORK_ERROR).toBeDefined();
      expect(API.ERROR_MESSAGES.TIMEOUT_ERROR).toBeDefined();
      expect(API.ERROR_MESSAGES.SERVER_ERROR).toBeDefined();
      expect(API.ERROR_MESSAGES.VALIDATION_ERROR).toBeDefined();
      expect(API.ERROR_MESSAGES.NOT_FOUND_ERROR).toBeDefined();
      expect(API.ERROR_MESSAGES.UNAUTHORIZED_ERROR).toBeDefined();
      expect(API.ERROR_MESSAGES.RATE_LIMIT_ERROR).toBeDefined();
    });

    test('should have retry configuration', () => {
      expect(API.RETRY_ATTEMPTS).toBe(3);
      expect(API.RETRY_DELAY).toBe(1000);
      expect(API.MAX_RETRY_DELAY).toBe(5000);
      expect(API.TIMEOUT).toBe(10000);
    });
  });

  describe('URL Construction', () => {
    test('should construct correct event URLs', () => {
      const baseUrl = API.BASE_URL;
      const eventsEndpoint = API.ENDPOINTS.EVENTS;
      
      expect(`${baseUrl}${eventsEndpoint}`).toContain('events');
      expect(`${baseUrl}${eventsEndpoint}/random/5`).toContain('events/random/5');
    });

    test('should construct correct game session URLs', () => {
      const baseUrl = API.BASE_URL;
      const sessionsEndpoint = API.ENDPOINTS.GAME_SESSIONS;
      
      expect(`${baseUrl}${sessionsEndpoint}`).toContain('game-sessions');
      expect(`${baseUrl}${sessionsEndpoint}/session-123`).toContain('game-sessions/session-123');
    });

    test('should construct correct statistics URLs', () => {
      const baseUrl = API.BASE_URL;
      const statsEndpoint = API.ENDPOINTS.STATISTICS;
      
      expect(`${baseUrl}${statsEndpoint}/player/TestPlayer`).toContain('statistics/player/TestPlayer');
      expect(`${baseUrl}${statsEndpoint}/leaderboards/global`).toContain('statistics/leaderboards/global');
    });

    test('should construct correct analytics URLs', () => {
      const baseUrl = API.BASE_URL;
      const analyticsEndpoint = API.ENDPOINTS.ANALYTICS;
      
      expect(`${baseUrl}${analyticsEndpoint}/overview`).toContain('analytics/overview');
      expect(`${baseUrl}${analyticsEndpoint}/trends`).toContain('analytics/trends');
    });
  });

  describe('Error Message Validation', () => {
    test('should have meaningful error messages', () => {
      expect(API.ERROR_MESSAGES.NETWORK_ERROR).toContain('connect');
      expect(API.ERROR_MESSAGES.TIMEOUT_ERROR).toContain('timed out');
      expect(API.ERROR_MESSAGES.SERVER_ERROR).toContain('Server error');
      expect(API.ERROR_MESSAGES.VALIDATION_ERROR).toContain('Invalid data');
      expect(API.ERROR_MESSAGES.NOT_FOUND_ERROR).toContain('not found');
      expect(API.ERROR_MESSAGES.UNAUTHORIZED_ERROR).toContain('Access denied');
      expect(API.ERROR_MESSAGES.RATE_LIMIT_ERROR).toContain('Too many requests');
    });
  });

  describe('Endpoint Validation', () => {
    test('should have all required endpoints', () => {
      const requiredEndpoints = [
        'HEALTH',
        'EVENTS', 
        'GAME_SESSIONS',
        'STATISTICS',
        'ANALYTICS',
        'ADMIN',
        'CATEGORIES'
      ];

      requiredEndpoints.forEach(endpoint => {
        expect(API.ENDPOINTS[endpoint]).toBeDefined();
        expect(typeof API.ENDPOINTS[endpoint]).toBe('string');
        expect(API.ENDPOINTS[endpoint].startsWith('/')).toBe(true);
      });
    });

    test('should have unique endpoint paths', () => {
      const endpoints = Object.values(API.ENDPOINTS);
      const uniqueEndpoints = new Set(endpoints);
      expect(endpoints.length).toBe(uniqueEndpoints.size);
    });
  });

  describe('Status Code Validation', () => {
    test('should have valid HTTP status codes', () => {
      const statusCodes = Object.values(API.STATUS_CODES);
      
      statusCodes.forEach(code => {
        expect(typeof code).toBe('number');
        expect(code).toBeGreaterThan(0);
        expect(code).toBeLessThan(600);
      });
    });

    test('should have all required status codes', () => {
      const requiredCodes = [
        'OK', 'CREATED', 'ACCEPTED', 'NO_CONTENT',
        'BAD_REQUEST', 'UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND',
        'CONFLICT', 'UNPROCESSABLE_ENTITY', 'TOO_MANY_REQUESTS',
        'INTERNAL_SERVER_ERROR', 'SERVICE_UNAVAILABLE'
      ];

      requiredCodes.forEach(code => {
        expect(API.STATUS_CODES[code]).toBeDefined();
        expect(typeof API.STATUS_CODES[code]).toBe('number');
      });
    });
  });
}); 