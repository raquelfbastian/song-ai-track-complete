package com.song.kapeko.service;

import com.song.kapeko.model.Product;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.*;
import java.util.stream.Collectors;

/**
 * RagService — Lab 7: Commerce RAG
 *
 * Implements the full RAG (Retrieval-Augmented Generation) pipeline:
 *   1. EMBED   — convert product descriptions to float[] vectors at startup
 *   2. RETRIEVE — cosine similarity search to find relevant products
 *   3. GENERATE — LLM generates a grounded answer from retrieved context
 *
 * No Docker. No external vector DB. Runs entirely in-process (JVM memory).
 * Teaches the concept cleanly before introducing production vector stores.
 *
 * Real-world: this is Stage 4 (Search) from the Lab 2 journey map —
 * "Semantic search — not just keyword matching" — now built.
 */
@Service
public class RagService {

    private final LlmService llmService;
    private final CatalogService catalogService;

    // In-memory vector store: productId → {embedding, product}
    private final Map<String, float[]> vectorStore = new LinkedHashMap<>();
    private final Map<String, Product> productStore = new LinkedHashMap<>();

    private boolean indexed = false;

    private static final String RAG_SYSTEM = """
            You are a Kape Ko product search assistant.
            Answer the customer's query using ONLY the products provided below.
            Be specific — name the product and explain why it matches the query.
            Keep your answer under 60 words.
            If none of the products match, say so honestly.
            Never invent products not in the list.
            """;

    public RagService(LlmService llmService, CatalogService catalogService) {
        this.llmService = llmService;
        this.catalogService = catalogService;
    }

    /**
     * Lab 7 Step 1: INDEX
     * Called at startup — embeds all product descriptions into the vector store.
     * Each product description becomes a float[] vector representation.
     */
    @PostConstruct
    public void indexCatalog() {
        try {
            List<Product> products = catalogService.getCatalog();
            System.out.println("🔍 RagService: indexing " + products.size() + " products...");

            for (Product product : products) {
                // Build a rich text representation to embed
                String text = buildProductText(product);

                // Call LLM embedding endpoint
                float[] embedding = llmService.embed(text);

                vectorStore.put(product.getId(), embedding);
                productStore.put(product.getId(), product);
            }

            indexed = true;
            System.out.println("✅ RagService: indexed " + vectorStore.size() + " products");

        } catch (Exception e) {
            System.err.println("⚠️ RagService: indexing failed — " + e.getMessage());
            System.err.println("   Run POST /api/catalog/generate first, then restart the server.");
        }
    }

    /**
     * Lab 7 Step 2: RETRIEVE
     * Finds the top-K most semantically similar products for a query.
     * Uses cosine similarity between the query embedding and stored embeddings.
     */
    public List<Product> retrieve(String query, int topK) throws Exception {
        if (!indexed || vectorStore.isEmpty()) {
            throw new IllegalStateException(
                "Vector store is empty. Run POST /api/rag/index first.");
        }

        // Embed the query
        float[] queryVec = llmService.embed(query);

        // Compute cosine similarity for all products
        return vectorStore.entrySet().stream()
                .map(e -> Map.entry(e.getKey(), cosineSimilarity(queryVec, e.getValue())))
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(topK)
                .map(e -> productStore.get(e.getKey()))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    /**
     * Lab 7 Step 3: GENERATE
     * Full RAG pipeline: retrieve relevant products, then generate a grounded answer.
     */
    public Map<String, Object> search(String query) throws Exception {
        // Retrieve top 3 most relevant products
        List<Product> retrieved = retrieve(query, 3);

        // Build context from retrieved products
        String context = retrieved.stream()
                .map(p -> String.format("- %s (%s roast): %s. Flavors: %s. Best for: %s.",
                        p.getName(), p.getRoast(),
                        p.getProductDescription() != null ? p.getProductDescription().substring(0, Math.min(120, p.getProductDescription().length())) : p.getBestFor(),
                        String.join(", ", p.getFlavorNotes()),
                        p.getBestFor()))
                .collect(Collectors.joining("\n"));

        // Generate grounded answer
        String userPrompt = String.format(
                "Customer query: \"%s\"\n\nRelevant Kape Ko products:\n%s\n\nAnswer the query:",
                query, context);

        String answer = llmService.complete(RAG_SYSTEM, userPrompt);

        return Map.of(
            "query", query,
            "answer", answer,
            "sources", retrieved.stream().map(Product::getId).collect(Collectors.toList()),
            "products", retrieved
        );
    }

    /**
     * Re-index the catalog (called after catalog regeneration).
     */
    public void reindex() {
        vectorStore.clear();
        productStore.clear();
        indexed = false;
        indexCatalog();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /** Build rich text for embedding — more context = better similarity matching */
    private String buildProductText(Product p) {
        return String.format(
            "%s. %s roast. Origin: %s. Farmer: %s. Altitude: %s. " +
            "Process: %s. Flavors: %s. Best for: %s. %s",
            p.getName(), p.getRoast(),
            p.getOrigin(), p.getFarmer(), p.getAltitude(),
            p.getProcess(),
            String.join(", ", p.getFlavorNotes()),
            p.getBestFor(),
            p.getProductDescription() != null ? p.getProductDescription() : ""
        );
    }

    /**
     * Cosine similarity between two float vectors.
     * Returns 1.0 for identical vectors, 0.0 for orthogonal.
     * Higher = more similar.
     */
    private double cosineSimilarity(float[] a, float[] b) {
        if (a.length != b.length) return 0.0;
        double dot = 0, normA = 0, normB = 0;
        for (int i = 0; i < a.length; i++) {
            dot   += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        return (normA == 0 || normB == 0) ? 0.0 : dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
