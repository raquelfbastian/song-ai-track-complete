package com.song.kapeko.service;

import com.song.kapeko.model.Product;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * RecommendationService — Lab 8: Recommendation Engine
 *
 * Reuses the RagService vector store — no additional embeddings needed.
 * For any product, finds the most semantically similar products
 * using cosine similarity on existing vectors.
 *
 * Real-world: this is Stage 8 (Retention) from the Lab 2 journey map —
 * "AI-powered product recommendations" — now built.
 * Same pattern used by SFCC Einstein Product Recommendations.
 */
@Service
public class RecommendationService {

    private final RagService ragService;
    private final CatalogService catalogService;

    public RecommendationService(RagService ragService, CatalogService catalogService) {
        this.ragService = ragService;
        this.catalogService = catalogService;
    }

    /**
     * Lab 8: Get top-N similar products for a given product.
     * Excludes the product itself from results.
     *
     * @param productId  The SKU to find recommendations for
     * @param topN       Number of recommendations to return
     * @return           List of recommended products
     */
    public List<Product> recommend(String productId, int topN) throws Exception {
        // Find the product
        List<Product> all = catalogService.getCatalog();
        Product product = all.stream()
                .filter(p -> p.getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        // Use the product name + best_for as the query
        // This retrieves products that are semantically similar to this one
        String query = product.getName() + " " + product.getBestFor() +
                       " " + String.join(" ", product.getFlavorNotes());

        // Retrieve similar products (ask for topN + 1 to account for excluding self)
        List<Product> similar = ragService.retrieve(query, topN + 1);

        // Exclude the product itself
        return similar.stream()
                .filter(p -> !p.getId().equals(productId))
                .limit(topN)
                .collect(Collectors.toList());
    }
}
