'use strict';

const express = require('express');
const router = express.Router();

const START_TIME = Date.now();

/**
 * GET /health
 * Full health status — used by monitoring dashboards
 */
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'developer-in-a-day-demo',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor((Date.now() - START_TIME) / 1000),
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /health/live
 * Kubernetes liveness probe — answers: "is the process alive?"
 */
router.get('/live', (req, res) => {
  res.json({ status: 'alive' });
});

/**
 * GET /health/ready
 * Kubernetes readiness probe — answers: "can this pod serve traffic?"
 * Extend with DB/cache connectivity checks as needed.
 */
router.get('/ready', (req, res) => {
  // TODO: Add downstream dependency checks (DB, cache, external APIs)
  res.json({ status: 'ready', checks: { dependencies: 'ok' } });
});

module.exports = router;
