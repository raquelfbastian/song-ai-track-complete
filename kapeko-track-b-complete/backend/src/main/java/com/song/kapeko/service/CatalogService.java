package com.song.kapeko.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.song.kapeko.model.Product;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * CatalogService — Lab 3: Product Catalog Builder
 *
 * Calls LLM API with a structured prompt → parses JSON response →
 * saves to catalog.json → exposes via GET /api/catalog.
 *
 * The prompt is grounded in real Kape Ko data from the Level 1 KB.
 */
@Service
public class CatalogService {

    private final LlmService llmService;
    private final String catalogPath;
    private final ObjectMapper mapper = new ObjectMapper();

    private static final String SYSTEM_PROMPT = """
            You are a product catalog specialist for a commerce platform.
            Generate realistic, commerce-ready product data.
            Always respond with valid JSON only — no markdown, no explanation.
            """;

    // ── The catalog prompt — grounded in Kape Ko Level 1 KB data ────────────
    private static final String USER_PROMPT = """
            Generate a product catalog for Kape Ko, a Filipino single-origin
            coffee subscription brand. Create exactly 6 products:
            
            - 4 Single Origin Bags:
              1. Benguet Sunrise (Light roast) — Farmer: Jun Carino, La Trinidad, Benguet, Cordillera, 1450-1600 MASL, Typica arabica, Washed
              2. Sagada Mist (Medium roast) — Farmer: Berta Lumnay, Sagada, Mountain Province, 1500-1700 MASL, Bourbon arabica, Natural
              3. Mt. Apo Dark (Dark roast) — Farmer: Ramon Dalisay, Kidapawan City, North Cotabato, 1200-1400 MASL, Robusta/Arabica blend, Honey
              4. Kape Ko Blend (Medium roast) — blended from all three regions, balanced profile
            - 1 Subscription Bundle: Kape Ko Starter Set (3 x 100g sampler of Benguet, Sagada, and Mt. Apo)
            - 1 Gift Set: Kape Ko Corporate Gift Box (2 x 250g bags of choice)
            
            Pricing rules:
            - Single origin bags: PHP 400-650 per 250g one-time
            - Subscription price: 10-15% below one-time price
            - Bundle/Gift: PHP 850-1200 one-time
            
            For each product return EXACTLY this JSON structure:
            {
              "id": "SKU-001",
              "name": "Benguet Sunrise — Light Roast",
              "category": "Single Origin Bags",
              "roast": "Light",
              "origin": "La Trinidad, Benguet, Cordillera",
              "farmer": "Jun Carino",
              "altitude": "1,450-1,600 MASL",
              "variety": "Typica arabica",
              "process": "Washed",
              "price_php": 450,
              "sub_price_php": 400,
              "flavor_notes": ["jasmine", "citrus", "honey"],
              "best_for": "Calm mornings, reflective mood",
              "in_stock": true,
              "subscription_available": true
            }
            
            Return: { "products": [ ...6 products... ] }
            Respond with valid JSON only. No markdown fences. No explanation.
            """;

    public CatalogService(LlmService llmService, Environment environment) {
        this.llmService = llmService;
        this.catalogPath = environment.getProperty("catalog.output-path", "data/catalog.json");
    }

    /** Lab 3: Generate catalog via LLM and save to disk */
    public List<Product> generateCatalog() throws Exception {
        System.out.println("🤖 CatalogService: calling LLM API...");
        String rawJson = llmService.complete(SYSTEM_PROMPT, USER_PROMPT);
        rawJson = rawJson.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
        List<Product> products;
        try {
            products = parseProducts(rawJson);
        } catch (IOException firstError) {
            System.out.println("⚠️ Invalid catalog JSON; retrying with strict JSON instruction...");
            String retryPrompt = USER_PROMPT + "\nReturn one valid JSON object only. Do not add trailing commas or commentary.";
            try {
                rawJson = llmService.complete(SYSTEM_PROMPT, retryPrompt)
                        .replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
                products = parseProducts(rawJson);
            } catch (IOException secondError) {
                File fallback = new File(catalogPath);
                if (!fallback.exists()) throw secondError;
                System.out.println("⚠️ LLM returned invalid JSON twice; using local catalog fallback.");
                products = readCatalogFile(fallback);
            }
        }
        saveCatalog(products);
        System.out.println("✅ Generated " + products.size() + " products → saved to " + catalogPath);
        return products;
    }

    /** Return existing catalog from disk, auto-generate if missing */
    public List<Product> getCatalog() throws Exception {
        File file = new File(catalogPath);
        if (!file.exists()) return generateCatalog();
        try {
            return readCatalogFile(file);
        } catch (IOException invalidCatalog) {
            System.out.println("⚠️ Invalid catalog file; regenerating: " + file.getPath());
            if (!file.delete()) {
                System.out.println("⚠️ Could not delete invalid catalog file; it will be overwritten.");
            }
            return generateCatalog();
        }
    }

    private List<Product> readCatalogFile(File file) throws IOException {
        JsonNode root = mapper.readTree(file);
        List<Product> products = new ArrayList<>();
        for (JsonNode node : root.path("products")) {
            products.add(mapper.treeToValue(node, Product.class));
        }
        if (products.isEmpty()) throw new IOException("catalog contains no products");
        return products;
    }

    private List<Product> parseProducts(String json) throws IOException {
        JsonNode root = mapper.readTree(json);
        JsonNode arr = root.has("products") ? root.path("products") : root;
        if (!arr.isArray() || arr.isEmpty()) throw new IOException("LLM returned no products");
        List<Product> products = new ArrayList<>();
        for (JsonNode node : arr) products.add(mapper.treeToValue(node, Product.class));
        return products;
    }

    private void saveCatalog(List<Product> products) throws IOException {
        File catalogFile = new File(catalogPath);
        File parent = catalogFile.getParentFile();
        if (parent != null) parent.mkdirs();
        mapper.writerWithDefaultPrettyPrinter()
              .writeValue(catalogFile, mapper.createObjectNode().putPOJO("products", products));
    }
}
