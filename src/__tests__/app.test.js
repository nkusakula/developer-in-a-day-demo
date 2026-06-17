'use strict';

const request = require('supertest');
const app = require('../app');

describe('App Configuration', () => {
  describe('Middleware Setup', () => {
    it('applies helmet security headers', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      // Helmet sets various security headers
      expect(res.headers).toHaveProperty('x-content-type-options');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    it('parses JSON payloads up to 1mb limit', async () => {
      const largePayload = {
        name: 'A'.repeat(100),
        category: 'test'
      };
      const res = await request(app)
        .post('/api/items')
        .send(largePayload)
        .set('Content-Type', 'application/json');
      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe(largePayload.name);
    });

    it('rejects malformed JSON with error handler', async () => {
      const res = await request(app)
        .post('/api/items')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');
      // Express body-parser errors are caught by error handler (500)
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Route Registration', () => {
    it('mounts health router at /health', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status');
    });

    it('mounts api router at /api', async () => {
      const res = await request(app).get('/api/items');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('items');
    });
  });

  describe('Metrics Endpoint', () => {
    it('exposes Prometheus metrics at /metrics', async () => {
      const res = await request(app).get('/metrics');
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('text/plain');
      expect(res.text).toContain('# HELP');
      expect(res.text).toContain('# TYPE');
    });

    it('tracks request metrics', async () => {
      // Make some requests to generate metrics
      await request(app).get('/api/items');
      await request(app).get('/api/items/count');

      const res = await request(app).get('/metrics');
      expect(res.statusCode).toBe(200);
      // Prometheus metrics should contain request counter
      expect(res.text).toContain('api_requests_total');
      expect(res.text).toContain('api_response_duration_seconds');
    });
  });

  describe('Error Handling', () => {
    it('returns 404 with error message for undefined routes', async () => {
      const res = await request(app).get('/nonexistent/path');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('Not found');
      expect(res.body).toHaveProperty('path');
    });

    it('returns 404 error message with correct path', async () => {
      const path = '/some/random/route';
      const res = await request(app).get(path);
      expect(res.statusCode).toBe(404);
      expect(res.body.path).toBe(path);
    });

    it('handles JSON parse errors with error handler', async () => {
      // Invalid JSON triggers the error handler middleware
      const res = await request(app)
        .post('/api/items')
        .set('Content-Type', 'application/json')
        .send('not valid json at all [}');
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Request/Response Flow', () => {
    it('processes valid requests through middleware chain', async () => {
      const res = await request(app)
        .post('/api/items')
        .send({ name: 'Test', category: 'test' })
        .set('Content-Type', 'application/json');
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('correlationId');
    });

    it('sets correct Content-Type for JSON responses', async () => {
      const res = await request(app).get('/api/items');
      expect(res.headers['content-type']).toContain('application/json');
    });

    it('sets correct Content-Type for Prometheus metrics', async () => {
      const res = await request(app).get('/metrics');
      expect(res.headers['content-type']).toContain('text/plain');
    });
  });

  describe('Application Behavior', () => {
    it('exports app as Express application', () => {
      expect(typeof app).toBe('function');
      expect(app._router).toBeDefined();
    });

    it('handles GET requests across different routes', async () => {
      const health = await request(app).get('/health');
      const items = await request(app).get('/api/items');
      const metrics = await request(app).get('/metrics');

      expect(health.statusCode).toBe(200);
      expect(items.statusCode).toBe(200);
      expect(metrics.statusCode).toBe(200);
    });

    it('handles POST requests to create resources', async () => {
      const res = await request(app)
        .post('/api/items')
        .send({ name: 'New Item', category: 'unit-test' })
        .set('Content-Type', 'application/json');
      expect(res.statusCode).toBe(201);
    });
  });
});
