// ragService.js — Track A (Node.js)
// Lab 7: Commerce RAG — COMPLETE IMPLEMENTATION
// Embed → Retrieve → Generate

const llm = require('./llmService');

const vectorStore = new Map(); // productId → float[]
const productStore = new Map(); // productId → product
let indexed = false;

const RAG_SYSTEM = `You are a Kape Ko product search assistant.
Answer the customer's query using ONLY the products provided below.
Be specific — name the product and explain why it matches the query.
Keep your answer under 60 words.
If none of the products match, say so honestly.
Never invent products not in the list.`;

// Lab 7 Step 1: INDEX — embed all products at startup
async function indexCatalog(products) {
  console.log(`🔍 RagService: indexing ${products.length} products...`);
  for (const product of products) {
    const text = buildProductText(product);
    const embedding = await llm.embed(text);
    vectorStore.set(product.id, embedding);
    productStore.set(product.id, product);
  }
  indexed = true;
  console.log(`✅ RagService: indexed ${vectorStore.size} products`);
}

// Lab 7 Step 2: RETRIEVE — cosine similarity search
async function retrieve(query, topK = 3) {
  if (!indexed || vectorStore.size === 0) {
    throw new Error('Vector store empty. Run POST /api/catalog/generate first.');
  }
  const queryVec = await llm.embed(query);

  // Compute cosine similarity for all products
  const scored = [];
  for (const [id, vec] of vectorStore.entries()) {
    const score = cosineSimilarity(queryVec, vec);
    scored.push({ id, score });
  }

  // Sort descending, take topK
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK)
    .map(s => productStore.get(s.id))
    .filter(Boolean);
}

// Lab 7 Step 3: GENERATE — full RAG pipeline
async function search(query) {
  const retrieved = await retrieve(query, 3);

  const context = retrieved.map(p => {
    const desc = p.product_description
      ? p.product_description.substring(0, 120)
      : p.best_for;
    return `- ${p.name} (${p.roast} roast): ${desc}. Flavors: ${(p.flavor_notes || []).join(', ')}. Best for: ${p.best_for}.`;
  }).join('\n');

  const userPrompt = `Customer query: "${query}"\n\nRelevant Kape Ko products:\n${context}\n\nAnswer the query:`;
  const answer = await llm.complete(RAG_SYSTEM, userPrompt);

  return {
    query,
    answer,
    sources: retrieved.map(p => p.id),
    products: retrieved,
  };
}

async function reindex(products) {
  vectorStore.clear();
  productStore.clear();
  indexed = false;
  await indexCatalog(products);
}

// Cosine similarity: dot(a,b) / (|a| * |b|)
function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return (normA === 0 || normB === 0) ? 0 : dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function buildProductText(p) {
  return `${p.name}. ${p.roast} roast. Origin: ${p.origin}. Farmer: ${p.farmer}. ` +
    `Altitude: ${p.altitude}. Process: ${p.process}. ` +
    `Flavors: ${(p.flavor_notes || []).join(', ')}. Best for: ${p.best_for}. ` +
    (p.product_description || '');
}

module.exports = { indexCatalog, retrieve, search, reindex };
