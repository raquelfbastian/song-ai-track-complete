// catalogService.js — Track A (Node.js) — SOLVED

const fs   = require('fs');
const path = require('path');
const llm  = require('./llmService');
const CATALOG_PATH = path.join(__dirname, '../../data/catalog.json');

const SYSTEM_PROMPT = `You are a product catalog specialist for a commerce platform.
Generate realistic, commerce-ready product data.
Always respond with valid JSON only — no markdown, no explanation.`;

const USER_PROMPT = `Generate a product catalog for Kape Ko, a Filipino single-origin
coffee subscription brand. Create exactly 6 products:
- 4 Single Origin Bags:
  1. Benguet Sunrise (Light) — Farmer: Jun Carino, La Trinidad, Benguet, 1450-1600 MASL, Typica arabica, Washed
  2. Sagada Mist (Medium) — Farmer: Berta Lumnay, Sagada, Mountain Province, 1500-1700 MASL, Bourbon, Natural
  3. Mt. Apo Dark (Dark) — Farmer: Ramon Dalisay, Kidapawan, North Cotabato, 1200-1400 MASL, Robusta/Arabica, Honey
  4. Kape Ko Blend (Medium) — blended from all three regions
- 1 Subscription Bundle: Kape Ko Starter Set (3 x 100g sampler)
- 1 Gift Set: Kape Ko Corporate Gift Box

Pricing: PHP 400-650 one-time, subscription 10-15% less.

For each product return EXACTLY this JSON:
{
  "id": "SKU-001", "name": "Benguet Sunrise — Light Roast",
  "category": "Single Origin Bags", "roast": "Light",
  "origin": "La Trinidad, Benguet, Cordillera", "farmer": "Jun Carino",
  "altitude": "1,450-1,600 MASL", "variety": "Typica arabica", "process": "Washed",
  "price_php": 450, "sub_price_php": 400,
  "flavor_notes": ["jasmine", "citrus", "honey"],
  "best_for": "Calm mornings, reflective mood",
  "in_stock": true, "subscription_available": true
}

Return: { "products": [...6 products...] }
Respond with valid JSON only. No markdown. No explanation.`;

async function generateCatalog() {
  console.log('🤖 CatalogService: calling LLM API...');
  let rawJson = await llm.complete(SYSTEM_PROMPT, USER_PROMPT);
  rawJson = rawJson.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const { products } = JSON.parse(rawJson);
  saveCatalog(products);
  console.log(`✅ Generated ${products.length} products`);
  return products;
}

async function getCatalog() {
  if (!fs.existsSync(CATALOG_PATH)) return generateCatalog();
  return JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8')).products;
}

// Saved catalog only — returns null instead of calling the LLM when none exists
function loadSavedCatalog() {
  if (!fs.existsSync(CATALOG_PATH)) return null;
  return JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8')).products;
}

function saveCatalog(products) {
  const dir = path.dirname(CATALOG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CATALOG_PATH, JSON.stringify({ products }, null, 2));
}

module.exports = { generateCatalog, getCatalog, loadSavedCatalog };
