// recommendationService.js — Track A (Node.js)
// Lab 8: Recommendation Engine — COMPLETE IMPLEMENTATION
// Reuses ragService vector store — no additional embeddings needed.

const rag = require('./ragService');

async function recommend(productId, products, topN = 3) {
  const product = products.find(p => p.id === productId);
  if (!product) throw new Error(`Product not found: ${productId}`);

  // Build query from product properties
  const query = `${product.name} ${product.best_for} ${(product.flavor_notes || []).join(' ')}`;

  // Retrieve similar (topN + 1 to account for excluding self)
  const similar = await rag.retrieve(query, topN + 1);

  // Exclude the product itself
  return similar.filter(p => p.id !== productId).slice(0, topN);
}

module.exports = { recommend };
