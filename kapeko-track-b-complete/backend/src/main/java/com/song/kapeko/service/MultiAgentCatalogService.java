package com.song.kapeko.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.song.kapeko.model.Product;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

/**
 * MultiAgentCatalogService — Lab 10: Multi-Agent Catalog Pipeline
 *
 * Demonstrates orchestrator → specialist agent pattern.
 * Three specialist agents work on each product:
 *   1. CatalogAgent   — validates and structures product data
 *   2. ContentAgent   — generates marketing content (brand voice)
 *   3. SeoAgent       — optimises titles and meta descriptions
 *
 * Orchestrator coordinates all three and aggregates results.
 *
 * Real-world: enterprise AI pipelines where specialist models
 * handle different aspects of content production at scale.
 */
@Service
public class MultiAgentCatalogService {

    private final LlmService llmService;
    private final CatalogService catalogService;
    private final ObjectMapper mapper = new ObjectMapper();

    // Thread pool for parallel agent execution
    private final ExecutorService executor = Executors.newFixedThreadPool(3);

    // ── Specialist agent system prompts ───────────────────────────────────

    private static final String CATALOG_AGENT_SYSTEM = """
            You are the Kape Ko Catalog Agent — a specialist in product data validation.
            Your job: review product data and ensure it is complete, accurate, and consistent.
            Check: all required fields present, prices realistic (PHP 350-700 per bag),
            roast levels are Light/Medium/Dark only, arrays are non-empty.
            Return the validated product as JSON. Fix any issues you find.
            Respond with valid JSON only.
            """;

    private static final String CONTENT_AGENT_SYSTEM = """
            You are the Kape Ko Content Agent — a specialist in brand-voice marketing copy.
            Warm, proud, celebrates Filipino farmers, never corporate.
            Banned: artisanal, premium, craft, world-class.
            Your job: generate product_description (3 paragraphs) and marketing_hook (1 sentence).
            The description must name the farmer. The hook must be bold and specific.
            Respond with valid JSON: { "product_description": "...", "marketing_hook": "..." }
            """;

    private static final String SEO_AGENT_SYSTEM = """
            You are the Kape Ko SEO Agent — a specialist in search engine optimisation.
            Your job: generate seo_title (60 chars max, include brand name) and
            meta_description (155 chars max, entice the click, include price).
            Both must target Filipino specialty coffee search intent.
            Respond with valid JSON: { "seo_title": "...", "meta_description": "..." }
            """;

    public MultiAgentCatalogService(LlmService llmService, CatalogService catalogService) {
        this.llmService = llmService;
        this.catalogService = catalogService;
    }

    /**
     * Lab 10: Run the multi-agent pipeline on the full catalog.
     * Orchestrator delegates to three specialist agents per product.
     * Agents run in parallel for efficiency.
     *
     * @return Enriched products with all agent outputs merged
     */
    public Map<String, Object> runPipeline() throws Exception {
        System.out.println("🤖 Orchestrator: starting multi-agent catalog pipeline...");

        List<Product> products = catalogService.getCatalog();
        long startTime = System.currentTimeMillis();

        // Process each product with all three agents in parallel
        List<CompletableFuture<Map<String, Object>>> futures = products.stream()
                .map(product -> CompletableFuture.supplyAsync(
                        () -> processProduct(product), executor))
                .collect(Collectors.toList());

        // Wait for all and collect results
        List<Map<String, Object>> results = futures.stream()
                .map(CompletableFuture::join)
                .collect(Collectors.toList());

        long elapsed = System.currentTimeMillis() - startTime;
        System.out.printf("✅ Orchestrator: pipeline complete in %dms%n", elapsed);

        return Map.of(
            "status", "complete",
            "productsProcessed", results.size(),
            "elapsedMs", elapsed,
            "agentsUsed", List.of("CatalogAgent", "ContentAgent", "SeoAgent"),
            "results", results
        );
    }

    /**
     * Process one product through all three specialist agents.
     * Returns merged output from all agents.
     */
    private Map<String, Object> processProduct(Product product) {
        System.out.printf("  → Processing %s with 3 agents...%n", product.getId());

        // Run all three agents — could be parallel per product too
        // For clarity in the lab, we run them sequentially per product
        Map<String, String> catalogResult  = runCatalogAgent(product);
        Map<String, String> contentResult  = runContentAgent(product);
        Map<String, String> seoResult      = runSeoAgent(product);

        return Map.of(
            "productId",         product.getId(),
            "productName",       product.getName(),
            "catalogAgent",      catalogResult,
            "contentAgent",      contentResult,
            "seoAgent",          seoResult,
            "merged", Map.of(
                "id",                  product.getId(),
                "name",                product.getName(),
                "roast",               product.getRoast(),
                "product_description", contentResult.getOrDefault("product_description", ""),
                "marketing_hook",      contentResult.getOrDefault("marketing_hook", ""),
                "seo_title",           seoResult.getOrDefault("seo_title", ""),
                "meta_description",    seoResult.getOrDefault("meta_description", "")
            )
        );
    }

    // ── Specialist agent runners ──────────────────────────────────────────

    private Map<String, String> runCatalogAgent(Product p) {
        try {
            String prompt = String.format(
                "Validate this product: %s",
                mapper.writeValueAsString(p));
            String response = llmService.complete(CATALOG_AGENT_SYSTEM, prompt);
            return Map.of("status", "validated", "notes", response.substring(0, Math.min(100, response.length())));
        } catch (Exception e) {
            return Map.of("status", "error", "notes", e.getMessage());
        }
    }

    private Map<String, String> runContentAgent(Product p) {
        try {
            String prompt = String.format(
                "Generate content for: %s (%s roast). Farmer: %s, %s. Flavors: %s. Best for: %s.",
                p.getName(), p.getRoast(), p.getFarmer(), p.getOrigin(),
                String.join(", ", p.getFlavorNotes()), p.getBestFor());

            String rawJson = llmService.complete(CONTENT_AGENT_SYSTEM, prompt);
            rawJson = rawJson.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
            var node = mapper.readTree(rawJson);
            return Map.of(
                "product_description", node.path("product_description").asText(),
                "marketing_hook",      node.path("marketing_hook").asText()
            );
        } catch (Exception e) {
            return Map.of("product_description", "", "marketing_hook", "", "error", e.getMessage());
        }
    }

    private Map<String, String> runSeoAgent(Product p) {
        try {
            String prompt = String.format(
                "Generate SEO content for: %s. %s roast. PHP %d/mo subscription. Origin: %s.",
                p.getName(), p.getRoast(), p.getSubPricePHP(), p.getOrigin());

            String rawJson = llmService.complete(SEO_AGENT_SYSTEM, prompt);
            rawJson = rawJson.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
            var node = mapper.readTree(rawJson);
            return Map.of(
                "seo_title",       node.path("seo_title").asText(),
                "meta_description",node.path("meta_description").asText()
            );
        } catch (Exception e) {
            return Map.of("seo_title", "", "meta_description", "", "error", e.getMessage());
        }
    }
}
