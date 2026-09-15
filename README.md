# Kape Ko Commerce AI Labs - Complete Tracks

Reference implementations for the SONG Commerce AI Labs Season 1 exercises. Each track contains the completed Labs 3-10 implementation using a different technology stack.

## Tracks

| Track | Backend | Frontend | Directory |
| --- | --- | --- | --- |
| A | Node.js + Express | React + TypeScript | [kapeko-track-a-complete](kapeko-track-a-complete/) |
| B | Spring Boot | Angular | [kapeko-track-b-complete](kapeko-track-b-complete/) |
| C | Spring Boot | React + TypeScript | [kapeko-track-c-complete](kapeko-track-c-complete/) |

Choose one track based on the stack you want to run. Each track is self-contained and has its own detailed README.

## Lab Coverage

All tracks include the following commerce AI exercises:

- Lab 3: Catalog generation
- Lab 4: Product enrichment
- Lab 5: Product catalog and detail views
- Lab 6: Shopping copilot chat
- Lab 7: Search and retrieval-augmented generation
- Lab 8: Product recommendations
- Lab 9: Order assistant agent
- Lab 10: Multi-agent catalog pipeline

## Prerequisites

Install the tools required by the track you choose:

- Node.js 18 or later for Track A and the React frontends
- npm for all JavaScript and TypeScript frontends
- Java 17 and Maven for Tracks B and C
- An LLM provider API key for AI-powered endpoints

## Running Track A

Open a terminal in the Track A directory:

```bash
cd kapeko-track-a-complete/backend
cp .env.example .env
# Add the required LLM settings to .env
npm install
npm run dev
```

In a second terminal:

```bash
cd kapeko-track-a-complete/frontend
npm install
npm run dev -- --host
```

The frontend runs on the Vite default port, usually `http://localhost:5173`.

## Running Track B

Set the required environment variables, then start the backend:

```bash
cd kapeko-track-b-complete/backend
export LLM_API_KEY=your-key
export LLM_PROVIDER=azure
export AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/openai/deployments/your-model
mvn spring-boot:run
```

In a second terminal:

```bash
cd kapeko-track-b-complete/frontend
npm install
ng serve --host 0.0.0.0 --port 4200
```

Open `http://localhost:4200`.

## Running Track C

Set the required environment variables, then start the backend:

```bash
cd kapeko-track-c-complete/backend
export LLM_PROVIDER=azure
export LLM_API_KEY=your-api-key
export LLM_AZURE_ENDPOINT=https://your-resource.openai.azure.com/openai/deployments/your-deployment
mvn spring-boot:run
```

In a second terminal:

```bash
cd kapeko-track-c-complete/frontend
npm install
npm run dev -- --host
```

The frontend runs on the Vite default port, usually `http://localhost:5173`.

## Common API Endpoints

The exact endpoint set can vary slightly by track. The shared API surface includes:

- `POST /api/catalog/generate`
- `POST /api/products/:id/enrich`
- `GET /api/products`
- `POST /api/chat`
- `GET /api/search?q=...`
- `GET /api/products/:id/recommendations`
- `POST /api/agent/order`
- `POST /api/agent/catalog/pipeline`

See the README inside each track for its complete endpoint list and configuration details.

## Notes

These folders are completed reference solutions. Keep API keys in local environment files and do not commit real secrets. The `.env.example` files show the expected configuration shape for the backend services.
