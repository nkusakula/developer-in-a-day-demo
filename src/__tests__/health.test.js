'use strict';

const request = require('supertest');
const app = require('../app');

describe('Health Endpoints', () => {
  describe('GET /health', () => {
    it('returns healthy status with required fields', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.service).toBe('developer-in-a-day-demo');
      expect(res.body).toHaveProperty('version');
      expect(res.body).toHaveProperty('environment');
      expect(res.body).toHaveProperty('uptimeSeconds');
      expect(res.body).toHaveProperty('timestamp');
      expect(typeof res.body.uptimeSeconds).toBe('number');
    });
  });

  describe('GET /health/live', () => {
    it('returns alive for liveness probe', async () => {
      const res = await request(app).get('/health/live');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('alive');
    });
  });

  describe('GET /health/ready', () => {
    it('returns ready for readiness probe', async () => {
      const res = await request(app).get('/health/ready');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ready');
    });
  });

  describe('GET /metrics', () => {
    it('returns Prometheus metrics in text format', async () => {
      const res = await request(app).get('/metrics');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('# HELP');
    });
  });

  describe('Unknown routes', () => {
    it('returns 404 for undefined paths', async () => {
      const res = await request(app).get('/does-not-exist');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });
});
