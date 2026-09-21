// index.js — Track A (Node.js + Express)
// Kape Ko Commerce API — SONG Level 2
//
// Start: node src/index.js  (or: npm run dev with nodemon)
// Runs on: http://localhost:8080

const path = require('path');
const dotenv = require('dotenv');

// Load the project-level .env when the backend is started from this folder.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();
const express    = require('express');
const cors       = require('cors');
const kapeKoRoutes = require('./routes/kapeKo');

const app  = express();
const PORT = process.env.PORT || 8080;

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    /\.github\.dev$/,        // Codespaces preview URLs
    /\.app\.github\.dev$/,
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api', kapeKoRoutes);

// ── Start ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('☕  Kape Ko Commerce API — Track A (Node.js)');
  console.log(`✅  Server running on http://localhost:${PORT}`);
  console.log(`🤖  LLM Provider: ${process.env.LLM_PROVIDER || 'azure'}`);
  console.log(`📦  Model: ${process.env.LLM_MODEL || 'gpt-4o'}`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  POST /api/catalog/generate   → Lab 3: generate catalog');
  console.log('  GET  /api/catalog            → Lab 3: get all products');
  console.log('  POST /api/products/:id/enrich → Lab 4: enrich one product');
  console.log('  GET  /api/products           → Lab 5: storefront listing');
  console.log('  GET  /api/products/:id       → Lab 5: product detail');
  console.log('  GET  /api/health             → health check');
  console.log('');
});
