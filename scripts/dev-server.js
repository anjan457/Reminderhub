/**
 * Local dev: frontend ONLY on port 3000. /api/* proxied to notify_backend (:5001).
 */
const path = require('path');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const PORT = Number(process.env.PORT) || 3000;
const API_TARGET = process.env.API_TARGET || 'http://localhost:5001';
const ROOT = path.join(__dirname, '..');

if (PORT !== 3000) {
  console.warn('Warning: frontend should run on port 3000. Current PORT=' + PORT);
}

const app = express();

app.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.use('/api', createProxyMiddleware({
  target: API_TARGET,
  changeOrigin: true,
  pathRewrite: (p) => '/api' + p,
  logLevel: 'warn'
}));

app.use(express.static(ROOT));

app.get('*', (_req, res) => {
  res.sendFile(path.join(ROOT, 'index.html'));
});

const server = app.listen(PORT, () => {
  console.log('');
  console.log('  Myndly frontend  → http://localhost:' + PORT);
  console.log('  API proxy        → ' + API_TARGET);
  console.log('  Open this URL in your browser (not :3001, not GitHub Pages)');
  console.log('');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('');
    console.error('  Port ' + PORT + ' is already in use.');
    console.error('  Free it:  lsof -ti :' + PORT + ' | xargs kill -9');
    console.error('  Then run:  npm run dev');
    console.error('');
    process.exit(1);
  }
  throw err;
});
