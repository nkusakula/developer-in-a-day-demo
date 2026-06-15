'use strict';

const request = require('supertest');
const app = require('../app');

describe('API — Items', () => {
  describe('GET /api/items', () => {
    it('returns paginated item list', async () => {
      const res = await request(app).get('/api/items');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('pagination');
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.items.length).toBeGreaterThan(0);
    });

    it('supports pagination parameters', async () => {
      const res = await request(app).get('/api/items?page=1&limit=2');
      expect(res.statusCode).toBe(200);
      expect(res.body.pagination.limit).toBe(2);
      expect(res.body.pagination.page).toBe(1);
    });
  });

  describe('GET /api/items/:id', () => {
    it('returns a specific item by ID', async () => {
      const res = await request(app).get('/api/items/1');
      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(1);
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('category');
    });

    it('returns 404 for non-existent item', async () => {
      const res = await request(app).get('/api/items/9999');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 400 for non-numeric ID', async () => {
      const res = await request(app).get('/api/items/not-a-number');
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 400 for zero or negative ID', async () => {
      const res = await request(app).get('/api/items/0');
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/items/search', () => {
    it('filters items by category query param', async () => {
      const res = await request(app).get('/api/items/search?category=demo');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('count');
      expect(res.body).toHaveProperty('filter');
      expect(res.body.filter.category).toBe('demo');
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.items.length).toBeGreaterThan(0);
      expect(res.body.items.every((item) => item.category === 'demo')).toBe(true);
    });

    it('returns 400 when category query param is missing', async () => {
      const res = await request(app).get('/api/items/search');
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/items', () => {
    it('creates a new item with valid payload', async () => {
      const res = await request(app)
        .post('/api/items')
        .send({ name: 'Test Item', category: 'test' })
        .set('Content-Type', 'application/json');
      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe('Test Item');
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('correlationId');
      expect(res.body).toHaveProperty('createdAt');
    });

    it('returns 400 when name is missing', async () => {
      const res = await request(app)
        .post('/api/items')
        .send({ category: 'test' })
        .set('Content-Type', 'application/json');
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 400 for empty name string', async () => {
      const res = await request(app)
        .post('/api/items')
        .send({ name: '   ' })
        .set('Content-Type', 'application/json');
      expect(res.statusCode).toBe(400);
    });
  });
});
