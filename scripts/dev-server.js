/**
 * Local dev: frontend on :3000, /api/* proxied to notify_backend (:5001).
 * Avoids CORS and mixed-content issues.
 */
const path = require('path');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const PORT = process.env.PORT || 3000;
const API_TARGET = process.env.API_TARGET || 'http://localhost:5001';
const ROOT = path.join(__dirname, '..');

const app = express();

app.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.use('/api', createProxyMiddleware({
  target: API_TARGET,
  changeOrigin: true,
  pathRewrite: (path) => '/api' + path,
  logLevel: 'warn'
}));

app.use(express.static(ROOT));

app.get('*', (_req, res) => {
  res.sendFile(path.join(ROOT, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Myndly frontend  → http://localhost:${PORT}`);
  console.log(`API proxy target → ${API_TARGET}`);
});
