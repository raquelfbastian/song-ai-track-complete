package com.song.kapeko.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.song.kapeko.model.Product;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * ChatService — Lab 6: Shopping Copilot
 *
 * Teaches: conversational commerce.
 * A mood-based chat interface that maps customer feelings
 * to Kape Ko product recommendations.
 *
 * Real-world: this is Stage 3 (Browse) from the Lab 2 journey map —
 * "AI recommends based on mood description" — now built.
 */
@Service
public class ChatService {

    private final LlmService llmService;
    private final CatalogService catalogService;
    private final ObjectMapper mapper = new ObjectMapper();

    // In-memory session store (resets on server restart)
    // Lab 9 (agentic) will replace this with persistent storage
    private final Map<String, List<Map<String, String>>> sessions =
            new java.util.concurrent.ConcurrentHashMap<>();

    private static final String SYSTEM_PROMPT_TEMPLATE = """
            You are the Kape Ko Shopping Copilot — a friendly coffee guide
            embedded in the Kape Ko online store.

            Your job: help customers find the right Kape Ko coffee based on
            how they are feeling, what they need, or what they are doing.

            Rules:
            1. Always recommend exactly ONE coffee per response.
            2. Give one specific reason for your recommendation (2 sentences max).
            3. After recommending, mention the subscription price and invite them to subscribe.
            4. Keep every response under 80 words.
            5. Tone: warm, conversational, never pushy.
            6. Only recommend coffees from the catalog below. Never invent products.
            7. If the question is not about coffee, say:
               "I am here to help you find your perfect Kape Ko cup!
                What kind of coffee mood are you in today?"

            Kape Ko Catalog:
            %s
            """;

    public ChatService(LlmService llmService, CatalogService catalogService) {
        this.llmService = llmService;
        this.catalogService = catalogService;
    }

    /**
     * Lab 6: Send a message to the Shopping Copilot.
     * Maintains conversation history per session.
     *
     * @param sessionId  Client session identifier
     * @param userMessage The customer's message
     * @return           The copilot's response
     */
    public String chat(String sessionId, String userMessage) throws Exception {
        // Get or create session history
        List<Map<String, String>> history =
                sessions.computeIfAbsent(sessionId, k -> new ArrayList<>());

        // Build system prompt with current catalog
        String catalogContext = buildCatalogContext();
        String systemPrompt = String.format(SYSTEM_PROMPT_TEMPLATE, catalogContext);

        // Add user message to history
        history.add(Map.of("role", "user", "content", userMessage));

        // Call LLM with full conversation history
        String response = llmService.completeWithHistory(systemPrompt, history);

        // Add assistant response to history
        history.add(Map.of("role", "assistant", "content", response));

        // Keep history bounded (last 10 messages)
        if (history.size() > 10) {
            history.subList(0, history.size() - 10).clear();
        }

        return response;
    }

    /** Clear a session (called when user resets the chat) */
    public void clearSession(String sessionId) {
        sessions.remove(sessionId);
    }

    /** Build catalog context string for the system prompt */
    private String buildCatalogContext() throws Exception {
        List<Product> products = catalogService.getCatalog();
        StringBuilder sb = new StringBuilder();
        for (Product p : products) {
            sb.append(String.format(
                "- %s (%s roast) | ₱%d one-time / ₱%d/mo subscription | Best for: %s | Flavors: %s%n",
                p.getName(), p.getRoast(),
                p.getPricePHP(), p.getSubPricePHP(),
                p.getBestFor(),
                String.join(", ", p.getFlavorNotes())
            ));
        }
        return sb.toString();
    }
}
