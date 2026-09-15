package com.song.kapeko.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.song.kapeko.model.Product;
import org.springframework.stereotype.Service;

/**
 * ContentService — Lab 4: Product Content Studio
 *
 * Enriches each product with AI-generated marketing content:
 * SEO title, meta description, product description, marketing hook,
 * feature bullets, and pairing suggestion.
 *
 * Brand voice is grounded in the Kape Ko Level 1 KB.
 */
@Service
public class ContentService {

    private final LlmService llmService;
    private final ObjectMapper mapper = new ObjectMapper();

    // ── Brand voice — the correct answer from the Level 2 sample solution ───
    private static final String BRAND_VOICE = """
            You write product content for Kape Ko, a Filipino single-origin coffee brand.
            
            Brand voice rules — follow ALL of these:
            1. Warm and proud. Celebrate the farmer and the region first.
               The coffee comes from a person and a place — always name both.
            2. Culturally grounded. Tagalog words are welcome but stay readable
               for non-Filipino speakers. Do not translate — let it breathe.
            3. Never corporate. Never generic.
               BANNED WORDS: "artisanal", "premium", "craft", "world-class",
               "finest quality", "carefully selected", "sustainably sourced",
               "consistent quality", "exceptional".
            4. Specific over vague. "The fog lifts at 9am over Sagada" beats
               "grown at high altitude". Use actual altitude, process, variety.
            5. The reader is an urban Filipino professional, 28-40, Metro Manila.
               She has bought imported specialty coffee. She wants a reason
               to switch to Filipino coffee. Give her that reason.
            6. Every piece of content must reference the farmer by name at least once.
            7. Respond with valid JSON only. No markdown. No explanation.
            """;

    public ContentService(LlmService llmService) {
        this.llmService = llmService;
    }

    /** Lab 4: Enrich a single product with AI-generated content */
    public Product enrichProduct(Product product) throws Exception {
        System.out.println("📝 ContentService: enriching → " + product.getName());
        String prompt = buildContentPrompt(product);
        String rawJson = llmService.complete(BRAND_VOICE, prompt);
        rawJson = rawJson.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
        return applyContent(product, rawJson);
    }

    private String buildContentPrompt(Product p) {
        return String.format("""
                Generate product content for this Kape Ko product:
                
                Name: %s
                Category: %s
                Origin: %s
                Farmer: %s
                Altitude: %s
                Variety: %s
                Process: %s
                Roast: %s
                Flavour notes: %s
                Price: PHP %d one-time / PHP %d subscription
                Best for: %s
                
                Return JSON with EXACTLY these fields:
                {
                  "seo_title": "60 chars max — include 'Kape Ko' and a key search term",
                  "meta_description": "155 chars max — include price, entice the click",
                  "product_description": "Exactly 3 paragraphs. Para 1: the farmer. Para 2: the growing conditions. Para 3: the cup experience.",
                  "marketing_hook": "One punchy sentence for hero banners. Bold and specific. No banned words.",
                  "feature_bullets": ["Exactly 5 bullets — each a specific verifiable claim, not generic"],
                  "pairing_suggestion": "One sentence — a specific Filipino food or morning ritual"
                }
                """,
                p.getName(), p.getCategory(), p.getOrigin(), p.getFarmer(),
                p.getAltitude(), p.getVariety(), p.getProcess(), p.getRoast(),
                String.join(", ", p.getFlavorNotes()),
                p.getPricePHP(), p.getSubPricePHP(), p.getBestFor()
        );
    }

    private Product applyContent(Product p, String json) throws Exception {
        JsonNode node = mapper.readTree(json);
        p.setSeoTitle(node.path("seo_title").asText());
        p.setMetaDescription(node.path("meta_description").asText());
        p.setProductDescription(node.path("product_description").asText());
        p.setMarketingHook(node.path("marketing_hook").asText());
        p.setPairingSuggestion(node.path("pairing_suggestion").asText());
        if (node.has("feature_bullets") && node.path("feature_bullets").isArray()) {
            java.util.List<String> bullets = new java.util.ArrayList<>();
            node.path("feature_bullets").forEach(b -> bullets.add(b.asText()));
            p.setFeatureBullets(bullets);
        }
        return p;
    }
}
