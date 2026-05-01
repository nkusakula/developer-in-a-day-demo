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

    it('returns items sorted ascending by name when sort=asc', async () => {
      const res = await request(app).get('/api/items?sort=asc');
      expect(res.statusCode).toBe(200);
      const names = res.body.items.map(i => i.name);
      const sorted = names.slice().sort((a, b) => a.localeCompare(b));
      expect(names).toEqual(sorted);
    });

    it('returns items sorted descending by name when sort=desc', async () => {
      const res = await request(app).get('/api/items?sort=desc');
      expect(res.statusCode).toBe(200);
      const names = res.body.items.map(i => i.name);
      const sorted = names.slice().sort((a, b) => b.localeCompare(a));
      expect(names).toEqual(sorted);
    });

    it('returns 400 when sort param is invalid', async () => {
      const res = await request(app).get('/api/items?sort=random');
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
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

  describe('PUT /api/items/:id', () => {
    it('updates an existing item name', async () => {
      const res = await request(app)
        .put('/api/items/1')
        .send({ name: 'Updated Name' })
        .set('Content-Type', 'application/json');
      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(1);
      expect(res.body.name).toBe('Updated Name');
    });

    it('updates an existing item category', async () => {
      const res = await request(app)
        .put('/api/items/2')
        .send({ category: 'updated-category' })
        .set('Content-Type', 'application/json');
      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(2);
      expect(res.body.category).toBe('updated-category');
    });

    it('updates both name and category', async () => {
      const res = await request(app)
        .put('/api/items/3')
        .send({ name: 'New Name', category: 'new-cat' })
        .set('Content-Type', 'application/json');
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('New Name');
      expect(res.body.category).toBe('new-cat');
    });

    it('returns 400 when request body is empty', async () => {
      const res = await request(app)
        .put('/api/items/1')
        .send({})
        .set('Content-Type', 'application/json');
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 400 when name is an empty string', async () => {
      const res = await request(app)
        .put('/api/items/1')
        .send({ name: '   ' })
        .set('Content-Type', 'application/json');
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 400 when category is an empty string', async () => {
      const res = await request(app)
        .put('/api/items/1')
        .send({ category: '   ' })
        .set('Content-Type', 'application/json');
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 404 for non-existent item', async () => {
      const res = await request(app)
        .put('/api/items/9999')
        .send({ name: 'Ghost' })
        .set('Content-Type', 'application/json');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 400 for non-numeric ID', async () => {
      const res = await request(app)
        .put('/api/items/not-a-number')
        .send({ name: 'X' })
        .set('Content-Type', 'application/json');
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});
