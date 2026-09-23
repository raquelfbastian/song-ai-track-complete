// llmService.js — Track A (Node.js)
// Provider-agnostic LLM client
// Same concept as LlmService.java in Track B/C
// Supports: Azure OpenAI | OpenAI | Groq
//
// Switch provider in .env:
//   LLM_PROVIDER=azure | openai | groq

const axios = require('axios');

/**
 * Call the configured LLM and return the text response.
 * @param {string} systemPrompt - The system / role instruction
 * @param {string} userPrompt   - The user message / task
 * @returns {Promise<string>}   - The model's text response
 */
async function complete(systemPrompt, userPrompt) {
  const provider = process.env.LLM_PROVIDER || 'azure';

  switch (provider.toLowerCase()) {
    case 'groq':   return callGroq(systemPrompt, userPrompt);
    case 'openai': return callOpenAI(systemPrompt, userPrompt);
    case 'azure':
    default:       return callAzureOpenAI(systemPrompt, userPrompt);
  }
}

// ── Azure OpenAI ───────────────────────────────────────────────────────────
async function callAzureOpenAI(system, user) {
  return callAzureChat([
    { role: 'system', content: system },
    { role: 'user',   content: user   },
  ]);
}

async function callAzureChat(messages) {
  const endpoint = requireAzureEndpoint();
  const apiKey   = process.env.LLM_API_KEY;
  const isV1Endpoint = endpoint.endsWith('/openai/v1');

  const response = await axios.post(
    `${endpoint}/chat/completions${isV1Endpoint ? '' : '?api-version=2024-02-01'}`,
    {
      ...(isV1Endpoint ? { model: process.env.LLM_MODEL || 'gpt-4o' } : {}),
      messages,
      temperature: 0.7,
    },
    {
      headers: {
        'api-key':      apiKey,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.choices[0].message.content;
}

function requireAzureEndpoint() {
  const endpoint = (process.env.AZURE_OPENAI_ENDPOINT || '').replace(/\/+$/, '');
  if (!endpoint) {
    throw new Error(
      'AZURE_OPENAI_ENDPOINT is missing. Add it to kapeko-track-a-complete/.env.'
    );
  }
  try {
    new URL(endpoint);
  } catch {
    throw new Error('AZURE_OPENAI_ENDPOINT must be a complete URL starting with https://.');
  }
  return endpoint;
}

// ── OpenAI ─────────────────────────────────────────────────────────────────
async function callOpenAI(system, user) {
  const model  = process.env.LLM_MODEL || 'gpt-4o';
  const apiKey = process.env.LLM_API_KEY;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user',   content: user   },
      ],
      temperature: 0.7,
    },
    {
      headers: {
        Authorization:  `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.choices[0].message.content;
}

// ── Groq (free tier — OpenAI-compatible) ───────────────────────────────────
async function callGroq(system, user) {
  const model  = process.env.LLM_MODEL || 'llama-3.1-8b-instant';
  const apiKey = process.env.LLM_API_KEY;

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user',   content: user   },
      ],
      temperature: 0.7,
    },
    {
      headers: {
        Authorization:  `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.choices[0].message.content;
}

module.exports = { complete };

// ── completeWithHistory() — for Lab 6 Shopping Copilot ───────────────────
async function completeWithHistory(systemPrompt, history) {
  const provider = process.env.LLM_PROVIDER || 'azure';
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history
  ];

  if (provider === 'anthropic') {
    return callAnthropic(systemPrompt, history);
  }

  if (provider !== 'groq' && provider !== 'openai') {
    return callAzureChat(messages);
  }

  const body = {
    model: process.env.LLM_MODEL || (provider === 'groq' ? 'llama-3.1-8b-instant' : 'gpt-4o'),
    temperature: 0.7,
    messages,
  };

  const url = provider === 'groq'
    ? 'https://api.groq.com/openai/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions';

  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.LLM_API_KEY}` };

  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok || !data.choices) {
    throw new Error(`LLM API error ${res.status}: ${data.error?.message || JSON.stringify(data)}`);
  }
  return data.choices[0].message.content;
}

// ── embed() — for Labs 7 and 8 RAG ───────────────────────────────────────
async function embed(text) {
  const provider = process.env.LLM_PROVIDER || 'azure';

  if (provider === 'groq' || provider === 'anthropic') {
    return embedFallback(text); // No embedding API — hash fallback
  }

  const azureEndpoint = provider === 'azure' ? requireAzureEndpoint() : '';
  const isAzureV1Endpoint = azureEndpoint.endsWith('/openai/v1');
  const url = provider === 'openai'
    ? 'https://api.openai.com/v1/embeddings'
    : `${process.env.AZURE_OPENAI_EMBEDDING_ENDPOINT || azureEndpoint}/embeddings${isAzureV1Endpoint ? '' : '?api-version=2024-02-01'}`;

  const headers = provider === 'azure'
    ? { 'Content-Type': 'application/json', 'api-key': process.env.LLM_API_KEY }
    : { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.LLM_API_KEY}` };

  const body = provider === 'openai'
    ? { model: 'text-embedding-ada-002', input: text }
    : {
        ...(isAzureV1Endpoint
          ? { model: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || 'text-embedding-3-small' }
          : {}),
        input: text,
      };

  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok || !data.data) {
    throw new Error(`Embedding API error ${res.status}: ${data.error?.message || JSON.stringify(data)}`);
  }
  return data.data[0].embedding;
}

// Hash fallback for Groq (not semantic — allows code to run without errors)
function embedFallback(text) {
  const vec = new Array(128).fill(0);
  const words = text.toLowerCase().split(/\s+/);
  for (const word of words) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) hash = ((hash << 5) - hash) + word.charCodeAt(i);
    vec[Math.abs(hash) % 128] += 1;
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
  return norm > 0 ? vec.map(v => v / norm) : vec;
}

module.exports = { complete, completeWithHistory, embed };
