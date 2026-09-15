# ☕ Kape Ko — Complete Solution Repo
### SONG Commerce AI Labs · Season 1 · Track C (Spring Boot + React TypeScript)
### Levels 2, 3 & 4 — Labs 3–10 — All prompts and brand voice filled in

---

## 🚀 Quick Start (GitHub Codespaces)

### Terminal 1 — Spring Boot backend
```bash
cd backend
export LLM_PROVIDER=azure
export LLM_API_KEY=your-api-key
export LLM_AZURE_ENDPOINT=https://your-resource.openai.azure.com/openai/deployments/your-deployment
mvn spring-boot:run
```

### Terminal 2 — React frontend
```bash
cd frontend
npm install
npm run dev -- --host
```

Open port 5173 in Codespaces → Kape Ko storefront

---

## 📡 All Endpoints

| Method | Endpoint | Lab |
|--------|----------|-----|
| POST | /api/catalog/generate | Lab 3 |
| GET | /api/catalog | Lab 3 |
| POST | /api/products/{id}/enrich | Lab 4 |
| POST | /api/catalog/enrich-all | Lab 4 |
| GET | /api/products | Lab 5 |
| GET | /api/products/{id} | Lab 5 |
| POST | /api/chat | Lab 6 |
| DELETE | /api/chat/{sessionId} | Lab 6 |
| GET | /api/search?q=... | Lab 7 |
| POST | /api/rag/index | Lab 7 |
| GET | /api/products/{id}/recommendations | Lab 8 |
| POST | /api/agent/order | Lab 9 |
| POST | /api/agent/catalog/pipeline | Lab 10 |
| GET | /api/health | — |

---

## 🗂 What is pre-filled (the "correct answers")

- **CatalogService.java** — catalog prompt grounded in real Kape Ko KB data (real farmer names, altitudes, prices)
- **ContentService.java** — 7-rule brand voice with banned word list + per-field content prompt
- **All Level 3 & 4 services** — complete implementation of RAG, copilot, recommendations, order agent, multi-agent pipeline

This is the reference implementation. The learner workbook starter repos have these prompts blank.
