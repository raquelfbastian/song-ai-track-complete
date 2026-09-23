# ☕ Kape Ko — Track A Complete (Node.js + React TypeScript)
### SONG Commerce AI Labs · Season 1 · Reference Implementation

All prompts filled in. All services implemented. Run this to see the end goal.

## Quick Start (GitHub Codespaces)

### Terminal 1 — Node.js backend
```bash
cd kapeko-track-a-complete
cp backend/.env.example .env
# Edit .env — add your LLM_API_KEY
cd backend
npm install
npm run dev
```

### Terminal 2 — React frontend
```bash
cd frontend
npm install
npm run dev -- --host
```

Open port 5173 → Kape Ko storefront

## API Endpoints (all working)
- POST /api/catalog/generate → Lab 3
- POST /api/products/:id/enrich → Lab 4
- GET  /api/products → Lab 5
- POST /api/chat → Lab 6
- GET  /api/search?q=... → Lab 7
- GET  /api/products/:id/recommendations → Lab 8
- POST /api/agent/order → Lab 9
- POST /api/agent/catalog/pipeline → Lab 10