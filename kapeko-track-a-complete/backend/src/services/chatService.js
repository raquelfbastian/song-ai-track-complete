// chatService.js — Track A (Node.js)
// Lab 6: Shopping Copilot — COMPLETE IMPLEMENTATION

const llm = require('./llmService');

const sessions = new Map(); // sessionId → message history

const SYSTEM_PROMPT_TEMPLATE = `You are the Kape Ko Shopping Copilot — a friendly coffee guide
embedded in the Kape Ko online store.

Your job: help customers find the right Kape Ko coffee based on
how they are feeling, what they need, or what they are doing.

Rules:
1. Always recommend exactly ONE coffee per response.
2. Give one specific reason for your recommendation (2 sentences max).
3. After recommending, mention the subscription price and invite them to subscribe.
4. Keep every response under 80 words.
5. Tone: warm, conversational, never pushy.
6. Only recommend coffees from the catalog below. Never invent products.
7. If the question is not about coffee, say:
   "I am here to help you find your perfect Kape Ko cup!
    What kind of coffee mood are you in today?"

Kape Ko Catalog:
%s`;

async function chat(sessionId, userMessage, getCatalog) {
  // Get or create session history
  if (!sessions.has(sessionId)) sessions.set(sessionId, []);
  const history = sessions.get(sessionId);

  // Build system prompt with current catalog
  const products = await getCatalog();
  const catalogContext = products.map(p =>
    `- ${p.name} (${p.roast} roast) | ₱${p.price_php} one-time / ₱${p.sub_price_php}/mo | Best for: ${p.best_for} | Flavors: ${(p.flavor_notes || []).join(', ')}`
  ).join('\n');

  const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace('%s', catalogContext);

  // Add user message to history
  history.push({ role: 'user', content: userMessage });

  // Call LLM with full conversation history
  const response = await llm.completeWithHistory(systemPrompt, history);

  // Add assistant response to history
  history.push({ role: 'assistant', content: response });

  // Trim to last 10 messages
  if (history.length > 10) history.splice(0, history.length - 10);

  return response;
}

function clearSession(sessionId) {
  sessions.delete(sessionId);
}

module.exports = { chat, clearSession };
