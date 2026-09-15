// routes/kapeKo.js — Track A (Node.js)
// All REST endpoints for Labs 3–10 — COMPLETE IMPLEMENTATION

const express = require('express');
const router = express.Router();

const catalog     = require('../services/catalogService');
const content     = require('../services/contentService');
const chat        = require('../services/chatService');
const rag         = require('../services/ragService');
const rec         = require('../services/recommendationService');
const orderAgent  = require('../services/orderAgentService');
const multiAgent  = require('../services/multiAgentService');

// ── Health ────────────────────────────────────────────────────────────────
router.get('/health', (req, res) => res.json({
  status: 'ok', service: 'Kape Ko Commerce API (Track A — Node.js)',
  version: '2.0.0', labs: '3, 4, 5, 6, 7, 8, 9, 10'
}));

// ── Lab 3: Catalog Builder ────────────────────────────────────────────────
router.post('/catalog/generate', async (req, res) => {
  try {
    const products = await catalog.generateCatalog();
    // Auto-index for RAG after generation
    await rag.indexCatalog(products).catch(e => console.warn('RAG index:', e.message));
    res.json({ message: 'Catalog generated', count: products.length, products });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/catalog', async (req, res) => {
  try { res.json({ products: await catalog.getCatalog() }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Lab 4: Content Studio ─────────────────────────────────────────────────
router.post('/products/:id/enrich', async (req, res) => {
  try {
    const products = await catalog.getCatalog();
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(await content.enrichProduct(product));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/catalog/enrich-all', async (req, res) => {
  try {
    const products = await catalog.getCatalog();
    const enriched = await Promise.all(products.map(p => content.enrichProduct(p).catch(() => p)));
    res.json({ message: 'All products enriched', count: enriched.length, products: enriched });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Lab 5: Storefront ─────────────────────────────────────────────────────
router.get('/products', async (req, res) => {
  try { res.json(await catalog.getCatalog()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/products/:id', async (req, res) => {
  try {
    const products = await catalog.getCatalog();
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Lab 6: Shopping Copilot ───────────────────────────────────────────────
router.post('/chat', async (req, res) => {
  try {
    const { sessionId = 'default', message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'message is required' });
    const response = await chat.chat(sessionId, message, catalog.getCatalog);
    res.json({ response, sessionId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/chat/:sessionId', (req, res) => {
  chat.clearSession(req.params.sessionId);
  res.json({ message: 'Session cleared' });
});

// ── Lab 7: Commerce RAG ───────────────────────────────────────────────────
router.get('/search', async (req, res) => {
  try {
    if (!req.query.q?.trim()) return res.status(400).json({ error: 'q is required' });
    res.json(await rag.search(req.query.q));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/rag/index', async (req, res) => {
  try {
    const products = await catalog.getCatalog();
    await rag.reindex(products);
    res.json({ message: 'Catalog re-indexed successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Lab 8: Recommendations ────────────────────────────────────────────────
router.get('/products/:id/recommendations', async (req, res) => {
  try {
    const topN = parseInt(req.query.topN) || 3;
    const products = await catalog.getCatalog();
    const recommendations = await rec.recommend(req.params.id, products, topN);
    res.json({ productId: req.params.id, recommendations, count: recommendations.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Lab 9: Order Agent ────────────────────────────────────────────────────
router.post('/agent/order', async (req, res) => {
  try {
    const { customerId = 'cust-demo', message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'message is required' });
    res.json(await orderAgent.process(customerId, message));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Lab 10: Multi-Agent Pipeline ─────────────────────────────────────────
router.post('/agent/catalog/pipeline', async (req, res) => {
  try {
    const products = await catalog.getCatalog();
    res.json(await multiAgent.runPipeline(products));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
