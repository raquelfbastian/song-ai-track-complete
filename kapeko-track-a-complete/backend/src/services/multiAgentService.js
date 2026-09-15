// multiAgentService.js — Track A (Node.js)
// Lab 10: Multi-Agent Catalog Pipeline — COMPLETE IMPLEMENTATION

const llm = require('./llmService');

const CATALOG_AGENT = `You are the Kape Ko Catalog Agent — a specialist in product data validation.
Your job: review product data and ensure it is complete, accurate, and consistent.
Check: all required fields present, prices realistic (PHP 350-700 per bag),
roast levels are Light/Medium/Dark only, arrays are non-empty.
Return a brief validation summary. Respond with JSON only: { "status": "validated", "notes": "..." }`;

const CONTENT_AGENT = `You are the Kape Ko Content Agent — a specialist in brand-voice marketing copy.
Warm and proud. Celebrates Filipino farmers. Never corporate.
BANNED: artisanal, premium, craft, world-class, finest quality.
Your job: generate product_description (3 paragraphs) and marketing_hook (1 sentence).
The description must name the farmer. The hook must be bold and specific.
Respond with valid JSON only: { "product_description": "...", "marketing_hook": "..." }`;

const SEO_AGENT = `You are the Kape Ko SEO Agent — a specialist in search engine optimisation.
Your job: generate seo_title (60 chars max, include brand name) and
meta_description (155 chars max, entice the click, include price).
Target Filipino specialty coffee search intent.
Respond with valid JSON only: { "seo_title": "...", "meta_description": "..." }`;

async function runPipeline(products) {
  console.log('🤖 Orchestrator: starting multi-agent catalog pipeline...');
  const start = Date.now();

  // Process all products in parallel using Promise.all
  const results = await Promise.all(products.map(p => processProduct(p)));

  const elapsed = Date.now() - start;
  console.log(`✅ Orchestrator: pipeline complete in ${elapsed}ms`);

  return {
    status: 'complete',
    productsProcessed: results.length,
    elapsedMs: elapsed,
    agentsUsed: ['CatalogAgent', 'ContentAgent', 'SeoAgent'],
    results,
  };
}

async function processProduct(product) {
  console.log(`  → Processing ${product.id} with 3 agents...`);

  // Run all three agents (sequential per product, parallel across products)
  const [catalogResult, contentResult, seoResult] = await Promise.all([
    runCatalogAgent(product),
    runContentAgent(product),
    runSeoAgent(product),
  ]);

  return {
    productId: product.id,
    productName: product.name,
    catalogAgent: catalogResult,
    contentAgent: contentResult,
    seoAgent: seoResult,
    merged: {
      id: product.id,
      name: product.name,
      roast: product.roast,
      product_description: contentResult.product_description || '',
      marketing_hook: contentResult.marketing_hook || '',
      seo_title: seoResult.seo_title || '',
      meta_description: seoResult.meta_description || '',
    },
  };
}

async function runCatalogAgent(p) {
  try {
    const prompt = `Validate this product: ${JSON.stringify(p)}`;
    const raw = await llm.complete(CATALOG_AGENT, prompt);
    const clean = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(clean);
  } catch (e) {
    return { status: 'error', notes: e.message };
  }
}

async function runContentAgent(p) {
  try {
    const prompt = `Generate content for: ${p.name} (${p.roast} roast). Farmer: ${p.farmer}, ${p.origin}. Flavors: ${(p.flavor_notes || []).join(', ')}. Best for: ${p.best_for}.`;
    const raw = await llm.complete(CONTENT_AGENT, prompt);
    const clean = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(clean);
  } catch (e) {
    return { product_description: '', marketing_hook: '', error: e.message };
  }
}

async function runSeoAgent(p) {
  try {
    const prompt = `Generate SEO content for: ${p.name}. ${p.roast} roast. PHP ${p.sub_price_php}/mo subscription. Origin: ${p.origin}.`;
    const raw = await llm.complete(SEO_AGENT, prompt);
    const clean = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(clean);
  } catch (e) {
    return { seo_title: '', meta_description: '', error: e.message };
  }
}

module.exports = { runPipeline };
