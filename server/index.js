require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3001;
const ROOT = path.join(__dirname, '..');

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'myndly-api' });
});

app.use('/api/sync', require('./routes/sync'));

// Serve the Myndly app (HTML, JS, CSS) from the same port as the API
app.use(express.static(ROOT));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(ROOT, 'index.html'));
});

async function start() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Myndly app + API → http://localhost:${PORT}`);
      console.log(`Health check      → http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

start();
