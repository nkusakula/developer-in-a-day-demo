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

  describe('GET /api/items/search', () => {
    it('returns items matching the given category', async () => {
      const res = await request(app).get('/api/items/search?category=demo');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('total');
      expect(Array.isArray(res.body.items)).toBe(true);
      res.body.items.forEach(item => {
        expect(item.category.toLowerCase()).toBe('demo');
      });
    });

    it('returns empty array when no items match the category', async () => {
      const res = await request(app).get('/api/items/search?category=nonexistent');
      expect(res.statusCode).toBe(200);
      expect(res.body.items).toHaveLength(0);
      expect(res.body.total).toBe(0);
    });

    it('is case-insensitive for category matching', async () => {
      const res = await request(app).get('/api/items/search?category=DEMO');
      expect(res.statusCode).toBe(200);
      expect(res.body.items.length).toBeGreaterThan(0);
    });

    it('returns 400 when category param is missing', async () => {
      const res = await request(app).get('/api/items/search');
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 400 when category param is blank', async () => {
      const res = await request(app).get('/api/items/search?category=%20');
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
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
