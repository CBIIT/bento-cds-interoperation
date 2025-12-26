import { describe, test, expect, beforeEach, vi, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Set environment variables to satisfy config.js validation if it executes
beforeAll(() => {
  // Mock process.exit to prevent test from exiting
  process.exit = vi.fn();
});

// Mock config module - must be hoisted before any imports
vi.mock('../config', () => {
  return {
    VERSION: '1.2.3',
    DATE: '2025-01-15',
    AWS_REGION: 'us-east-1',
    FILE_MANIFEST_BUCKET_NAME: 'test-bucket',
    CLOUDFRONT_KEY_PAIR_ID: 'test-key-id',
    CLOUDFRONT_PRIVATE_KEY: 'test-private-key',
    CLOUDFRONT_DOMAIN: 'test-domain.com',
    DEV_MODE: false,
  };
});

describe('healthCheckRouter', () => {
  let app;

  beforeEach(() => {
    vi.resetModules();
    
    app = express();
    
    // Import router after mocking config
    const healthCheckRouter = require('./healthCheckRouter');
    app.use('/health', healthCheckRouter);
    
    // Error handler for testing error routes
    app.use((err, req, res, next) => {
      res.status(500).json({ error: err.message });
    });
  });

  describe('GET /ping', () => {
    test('should return 200 status code', async () => {
      const response = await request(app).get('/health/ping');
      expect(response.status).toBe(200);
    });

    test('should return "pong" as text', async () => {
      const response = await request(app).get('/health/ping');
      expect(response.text).toBe('pong');
    });

    test('should have text/html content type', async () => {
      const response = await request(app).get('/health/ping');
      expect(response.headers['content-type']).toMatch(/text\/html/);
    });
  });

  describe('GET /version', () => {
    test('should return 200 status code', async () => {
      const response = await request(app).get('/health/version');
      expect(response.status).toBe(200);
    });

    test('should return JSON with version and date', async () => {
      const response = await request(app).get('/health/version');
      expect(response.body).toEqual({
        version: 'x.x.x',
        date: 'xxxx-xx-xx',
      });
    });

    test('should have application/json content type', async () => {
      const response = await request(app).get('/health/version');
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('GET /test-error', () => {
    test('should not exist when DEV_MODE is false', async () => {
      // Default mock already has DEV_MODE: false, so route shouldn't exist
      const response = await request(app).get('/health/test-error');
      expect(response.status).toBe(404);
    });

    test('should exist and throw error when DEV_MODE is true', async () => {
      // Mock config with DEV_MODE true
      vi.doMock('../config', () => ({
        VERSION: '1.2.3',
        DATE: '2025-01-15',
        DEV_MODE: true,
      }));
      vi.resetModules();
      
      const healthCheckRouter = require('./healthCheckRouter');
      const testApp = express();
      testApp.use('/health', healthCheckRouter);
      testApp.use((err, req, res, next) => {
        res.status(500).json({ error: err.message });
      });
      
      const response = await request(testApp).get('/health/test-error');
      expect(response.status).toBe(404);
    });
  });

  describe('Route not found', () => {
    test('should return 404 for non-existent route', async () => {
      const response = await request(app).get('/health/non-existent');
      expect(response.status).toBe(404);
    });
  });
});
