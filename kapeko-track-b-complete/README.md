# ☕ Kape Ko — Track B Complete (Spring Boot + Angular)
### SONG Commerce AI Labs · Season 1 · Reference Implementation

All prompts filled in. All services implemented. Run this to see the end goal.

## Quick Start (GitHub Codespaces)

### Terminal 1 — Spring Boot backend
```bash
cd backend
export LLM_API_KEY=your-key
export LLM_PROVIDER=azure
export AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/openai/deployments/your-model
mvn spring-boot:run
```

### Terminal 2 — Angular frontend
```bash
cd frontend
npm install
ng serve --host 0.0.0.0 --port 4200
```

Open port 4200 → Kape Ko storefront

## API Endpoints (all working)
- POST /api/catalog/generate → Lab 3
- POST /api/products/:id/enrich → Lab 4
- GET  /api/products → Lab 5
- POST /api/chat → Lab 6
- GET  /api/search?q=... → Lab 7
- GET  /api/products/:id/recommendations → Lab 8
- POST /api/agent/order → Lab 9
- POST /api/agent/catalog/pipeline → Lab 10
