'use strict';
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const client = require('prom-client');

const router = express.Router();

// ── Custom Prometheus metrics ──────────────────────────────────
const requestCounter = new client.Counter({
  name: 'api_requests_total',
  help: 'Total number of API requests',
  labelNames: ['method', 'route', 'status_code']
});

const responseHistogram = new client.Histogram({
  name: 'api_response_duration_seconds',
  help: 'API response time in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5]
});

// Track metrics for every request
router.use((req, res, next) => {
  const stopTimer = responseHistogram.startTimer({ method: req.method, route: req.path });
  res.on('finish', () => {
    stopTimer();
    requestCounter.inc({ method: req.method, route: req.path, status_code: res.statusCode });
  });
  next();
});

// In-memory item store (replace with DB in production)
const items = [
  { id: 1, name: 'Item One', category: 'demo', createdAt: new Date().toISOString() },
  { id: 2, name: 'Item Two', category: 'demo', createdAt: new Date().toISOString() },
  { id: 3, name: 'Item Three', category: 'demo', createdAt: new Date().toISOString() }
];

/**
 * GET /api/items
 * Returns paginated item list
 */
router.get('/items', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const offset = (page - 1) * limit;
  const paged = items.slice(offset, offset + limit);

  res.json({
    items: paged,
    pagination: { page, limit, total: items.length, pages: Math.ceil(items.length / limit) }
  });
});

/**
 * GET /api/items/search
 * Filters items by category query param
 */
router.get('/items/search', (req, res) => {
  const { category } = req.query;
  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    return res.status(400).json({ error: 'Query param "category" is required and must be a non-empty string' });
  }
  const normalised = category.trim().toLowerCase();
  const results = items.filter(i => i.category.toLowerCase() === normalised);
  res.json({ items: results, total: results.length });
});

/**
 * GET /api/items/:id
 * Returns a single item by numeric ID
 */
router.get('/items/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id < 1) {
    return res.status(400).json({ error: 'Invalid item ID — must be a positive integer' });
  }
  const item = items.find(i => i.id === id);
  if (!item) {
    return res.status(404).json({ error: `Item ${id} not found` });
  }
  res.json(item);
});

/**
 * POST /api/items
 * Creates a new item
 */
router.post('/items', (req, res) => {
  const { name, category } = req.body || {};
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Field "name" is required and must be a non-empty string' });
  }
  const newItem = {
    id: items.length + 1,
    name: name.trim().slice(0, 200),  // sanitize length
    category: (category || 'general').toString().slice(0, 50),
    correlationId: uuidv4(),
    createdAt: new Date().toISOString()
  };
  items.push(newItem);
  res.status(201).json(newItem);
});

module.exports = router;
