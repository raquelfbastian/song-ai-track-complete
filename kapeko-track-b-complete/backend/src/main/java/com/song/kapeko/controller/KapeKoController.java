package com.song.kapeko.controller;

import com.song.kapeko.model.Product;
import com.song.kapeko.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * KapeKoController — all REST endpoints for Labs 3–10.
 *
 * Level 2: /api/catalog, /api/products, /api/products/{id}/enrich
 * Level 3: /api/chat, /api/search, /api/rag/index, /api/products/{id}/recommendations
 * Level 4: /api/agent/order, /api/agent/catalog/pipeline
 */
@RestController
@RequestMapping("/api")
public class KapeKoController {

    private final CatalogService catalogService;
    private final ContentService contentService;
    private final ChatService chatService;
    private final RagService ragService;
    private final RecommendationService recommendationService;
    private final OrderAgentService orderAgentService;
    private final MultiAgentCatalogService multiAgentCatalogService;

    public KapeKoController(
            CatalogService catalogService,
            ContentService contentService,
            ChatService chatService,
            RagService ragService,
            RecommendationService recommendationService,
            OrderAgentService orderAgentService,
            MultiAgentCatalogService multiAgentCatalogService) {
        this.catalogService = catalogService;
        this.contentService = contentService;
        this.chatService = chatService;
        this.ragService = ragService;
        this.recommendationService = recommendationService;
        this.orderAgentService = orderAgentService;
        this.multiAgentCatalogService = multiAgentCatalogService;
    }

    // ── Health ────────────────────────────────────────────────────────────────

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of(
            "status", "ok",
            "service", "Kape Ko Commerce API",
            "version", "2.0.0 — SONG Levels 2-4",
            "labs", "3, 4, 5, 6, 7, 8, 9, 10"
        ));
    }

    // ── Lab 3: Catalog Builder ─────────────────────────────────────────────────

    @PostMapping("/catalog/generate")
    public ResponseEntity<?> generateCatalog() {
        try {
            List<Product> products = catalogService.generateCatalog();
            return ResponseEntity.ok(Map.of("message", "Catalog generated", "count", products.size(), "products", products));
        } catch (Exception e) { return error(e); }
    }

    @GetMapping("/catalog")
    public ResponseEntity<?> getCatalog() {
        try {
            return ResponseEntity.ok(Map.of("products", catalogService.getCatalog()));
        } catch (Exception e) { return error(e); }
    }

    // ── Lab 4: Content Studio ─────────────────────────────────────────────────

    @PostMapping("/products/{id}/enrich")
    public ResponseEntity<?> enrichProduct(@PathVariable String id) {
        try {
            List<Product> products = catalogService.getCatalog();
            Product product = products.stream().filter(p -> p.getId().equals(id))
                    .findFirst().orElseThrow(() -> new RuntimeException("Product not found: " + id));
            return ResponseEntity.ok(contentService.enrichProduct(product));
        } catch (Exception e) { return error(e); }
    }

    @PostMapping("/catalog/enrich-all")
    public ResponseEntity<?> enrichAll() {
        try {
            List<Product> products = catalogService.getCatalog();
            List<Product> enriched = products.stream()
                    .map(p -> { try { return contentService.enrichProduct(p); } catch (Exception e) { return p; } })
                    .toList();
            return ResponseEntity.ok(Map.of("message", "All products enriched", "count", enriched.size(), "products", enriched));
        } catch (Exception e) { return error(e); }
    }

    // ── Lab 5: Storefront ─────────────────────────────────────────────────────

    @GetMapping("/products")
    public ResponseEntity<?> getProducts() {
        try { return ResponseEntity.ok(catalogService.getCatalog()); }
        catch (Exception e) { return error(e); }
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<?> getProduct(@PathVariable String id) {
        try {
            return catalogService.getCatalog().stream().filter(p -> p.getId().equals(id))
                    .findFirst().map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) { return error(e); }
    }

    // ── Lab 6: Shopping Copilot ───────────────────────────────────────────────

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody Map<String, String> body) {
        try {
            String sessionId = body.getOrDefault("sessionId", "default");
            String message = body.get("message");
            if (message == null || message.isBlank())
                return ResponseEntity.badRequest().body(Map.of("error", "message is required"));
            return ResponseEntity.ok(Map.of("response", chatService.chat(sessionId, message), "sessionId", sessionId));
        } catch (Exception e) { return error(e); }
    }

    @DeleteMapping("/chat/{sessionId}")
    public ResponseEntity<?> clearChat(@PathVariable String sessionId) {
        chatService.clearSession(sessionId);
        return ResponseEntity.ok(Map.of("message", "Session cleared"));
    }

    // ── Lab 7: Commerce RAG ───────────────────────────────────────────────────

    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam String q) {
        try {
            if (q == null || q.isBlank()) return ResponseEntity.badRequest().body(Map.of("error", "q is required"));
            return ResponseEntity.ok(ragService.search(q));
        } catch (Exception e) { return error(e); }
    }

    @PostMapping("/rag/index")
    public ResponseEntity<?> reindex() {
        try { ragService.reindex(); return ResponseEntity.ok(Map.of("message", "Catalog re-indexed")); }
        catch (Exception e) { return error(e); }
    }

    // ── Lab 8: Recommendations ────────────────────────────────────────────────

    @GetMapping("/products/{id}/recommendations")
    public ResponseEntity<?> recommend(@PathVariable String id, @RequestParam(defaultValue = "3") int topN) {
        try {
            var recs = recommendationService.recommend(id, topN);
            return ResponseEntity.ok(Map.of("productId", id, "recommendations", recs, "count", recs.size()));
        } catch (Exception e) { return error(e); }
    }

    // ── Lab 9: Order Agent ────────────────────────────────────────────────────

    @PostMapping("/agent/order")
    public ResponseEntity<?> orderAgent(@RequestBody Map<String, String> body) {
        try {
            String customerId = body.getOrDefault("customerId", "cust-demo");
            String message = body.get("message");
            if (message == null || message.isBlank())
                return ResponseEntity.badRequest().body(Map.of("error", "message is required"));
            return ResponseEntity.ok(orderAgentService.process(customerId, message));
        } catch (Exception e) { return error(e); }
    }

    // ── Lab 10: Multi-Agent Pipeline ─────────────────────────────────────────

    @PostMapping("/agent/catalog/pipeline")
    public ResponseEntity<?> multiAgentPipeline() {
        try { return ResponseEntity.ok(multiAgentCatalogService.runPipeline()); }
        catch (Exception e) { return error(e); }
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private ResponseEntity<?> error(Exception e) {
        return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
    }
}
