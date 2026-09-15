# ☕ Kape Ko — Track B Complete (Spring Boot + Angular)
### SONG Commerce AI Labs · Season 1 · Reference Implementation

All prompts filled in. All services implemented. Run this to see the end goal.

## Quick Start (GitHub Codespaces)

### Terminal 1 — Spring Boot backend
```bash
cd backend
export LLM_API_KEY=your-key
export LLM_PROVIDER=azure
export AZURE_OPENAI_DEPLOYMENT=your-chat-deployment-name
# Required by Labs 7 and 8 for semantic search/recommendations
export AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-3-small
mvn spring-boot:run
```

To start the backend and automatically rebuild the RAG vector index after the
health endpoint is ready, use:

```bash
./scripts/start-with-rag.sh
```

The script calls `POST /api/rag/index` automatically. If indexing fails, check
`backend.log` and verify `AZURE_OPENAI_EMBEDDING_DEPLOYMENT` is the exact Azure
embedding deployment name.

Set `AZURE_OPENAI_ENDPOINT` to your Azure resource URL. The app adds the
deployment path automatically. You can also provide full deployment URLs via
`AZURE_OPENAI_ENDPOINT` and `AZURE_OPENAI_EMBEDDING_ENDPOINT`. Maven and Java
17+ must be installed and available on `PATH`.

### Terminal 2 — Angular frontend
```bash
cd frontend
npm install
npm run dev
```

Open port 5173 → Kape Ko storefront

### Switching LLM providers

All backend features use one provider-neutral `LlmService`. Configure it with
`llm.provider`, `llm.model`, and `llm.api-key` in `application.properties` or
environment variables. OpenAI-compatible providers use the same adapter:

```properties
llm.provider=openai-compatible
llm.base-url=https://api.together.xyz/v1
llm.model=meta-llama/Llama-3.3-70B-Instruct-Turbo
llm.api-key=${LLM_API_KEY}
```

The same setup works for Ollama (`http://localhost:11434/v1`), LM Studio,
OpenRouter, Together, Fireworks, and other compatible APIs.

## API Endpoints (all working)
- POST /api/catalog/generate → Lab 3
- POST /api/products/:id/enrich → Lab 4
- GET  /api/products → Lab 5
- POST /api/chat → Lab 6
- GET  /api/search?q=... → Lab 7
- GET  /api/products/:id/recommendations → Lab 8
- POST /api/agent/order → Lab 9
- POST /api/agent/catalog/pipeline → Lab 10
