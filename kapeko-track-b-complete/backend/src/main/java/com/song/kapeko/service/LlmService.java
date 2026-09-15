package com.song.kapeko.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;
import java.util.Map;

/**
 * LlmService — provider-agnostic LLM client.
 * Supports: Azure OpenAI | OpenAI | Groq | Anthropic | OpenAI-compatible APIs
 *
 * All Level 2, 3, and 4 services call through here.
 * Switch provider via application.properties:
 *   llm.provider=azure | openai | groq | anthropic | openai-compatible
 */
@Service
public class LlmService {

    private final Environment env;
    private final ObjectMapper mapper = new ObjectMapper();

    public LlmService(Environment env) {
        this.env = env;
    }

    // ── complete() — single-turn, used by Labs 3, 4, 7, 9, 10 ────────────

    public String complete(String systemPrompt, String userPrompt) {
        String provider = env.getProperty("llm.provider", "azure");
        return switch (provider.toLowerCase()) {
            case "anthropic" -> completeAnthropic(systemPrompt, userPrompt);
            case "groq"      -> completeOpenAICompat("https://api.groq.com/openai/v1", systemPrompt, userPrompt);
            case "openai"    -> completeOpenAICompat("https://api.openai.com/v1", systemPrompt, userPrompt);
            case "openai-compatible", "custom", "ollama" -> completeOpenAICompat(
                    env.getRequiredProperty("llm.base-url"), systemPrompt, userPrompt);
            case "azure"     -> completeAzure(systemPrompt, userPrompt);
            default          -> throw unsupportedProvider(provider);
        };
    }

    // ── completeWithHistory() — multi-turn, used by Lab 6 Shopping Copilot ─

    public String completeWithHistory(String systemPrompt, List<Map<String, String>> history) {
        String provider = env.getProperty("llm.provider", "azure");
        return switch (provider.toLowerCase()) {
            case "anthropic" -> completeAnthropicWithHistory(systemPrompt, history);
            case "groq"      -> completeOpenAICompatWithHistory("https://api.groq.com/openai/v1", systemPrompt, history);
            case "openai"    -> completeOpenAICompatWithHistory("https://api.openai.com/v1", systemPrompt, history);
            case "openai-compatible", "custom", "ollama" -> completeOpenAICompatWithHistory(
                    env.getRequiredProperty("llm.base-url"), systemPrompt, history);
            case "azure"     -> completeAzureWithHistory(systemPrompt, history);
            default          -> throw unsupportedProvider(provider);
        };
    }

    // ── embed() — vector embedding, used by Labs 7 and 8 ────────────────────

    public float[] embed(String text) {
        String provider = env.getProperty("llm.provider", "azure");
        return switch (provider.toLowerCase()) {
            case "openai" -> embedOpenAI(text);
            case "groq"   -> embedFallback(text); // Groq has no embedding API
            case "anthropic" -> embedFallback(text); // Use embedFallback or switch to OpenAI for embeddings
            case "openai-compatible", "custom", "ollama" -> embedOpenAICompatible(text);
            case "azure" -> embedAzure(text);
            default -> throw unsupportedProvider(provider);
        };
    }

    // ── Azure OpenAI ─────────────────────────────────────────────────────────

    private String completeAzure(String system, String user) {
        if (isAzureResponsesEndpoint()) {
            return completeAzureResponses(system, user);
        }
        ObjectNode body = mapper.createObjectNode();
        body.put("temperature", 0.7);
        ArrayNode messages = body.putArray("messages");
        messages.addObject().put("role", "system").put("content", system);
        messages.addObject().put("role", "user").put("content", user);
        String response = azureClient().post()
                .uri("/chat/completions?api-version=2024-02-01")
                .bodyValue(body.toString()).retrieve().bodyToMono(String.class).block();
        return extractContent(response);
    }

    private String completeAzureResponses(String system, String user) {
        ObjectNode body = mapper.createObjectNode();
        body.put("model", env.getProperty("llm.azure.deployment", env.getProperty("llm.model", "gpt-4o")));
        ArrayNode input = body.putArray("input");
        input.addObject().put("role", "system").put("content", system);
        input.addObject().put("role", "user").put("content", user);

        String response = azureResponsesClient().post()
                .uri("/responses")
                .bodyValue(body.toString()).retrieve().bodyToMono(String.class).block();
        return extractResponsesContent(response);
    }

    private String completeAzureWithHistory(String system, List<Map<String, String>> history) {
        if (isAzureResponsesEndpoint()) {
            ObjectNode body = mapper.createObjectNode();
            body.put("model", env.getProperty("llm.azure.deployment", env.getProperty("llm.model", "gpt-4o")));
            ArrayNode input = body.putArray("input");
            input.addObject().put("role", "system").put("content", system);
            history.forEach(m -> input.addObject()
                .put("role", m.get("role")).put("content", m.get("content")));
            String response = azureResponsesClient().post()
                .uri("/responses")
                .bodyValue(body.toString()).retrieve().bodyToMono(String.class).block();
            return extractResponsesContent(response);
        }
        ObjectNode body = mapper.createObjectNode();
        body.put("temperature", 0.7);
        ArrayNode messages = body.putArray("messages");
        messages.addObject().put("role", "system").put("content", system);
        history.forEach(m -> messages.addObject().put("role", m.get("role")).put("content", m.get("content")));
        String response = azureClient().post()
                .uri("/chat/completions?api-version=2024-02-01")
                .bodyValue(body.toString()).retrieve().bodyToMono(String.class).block();
        return extractContent(response);
    }

    private float[] embedAzure(String text) {
        if (isAzureResponsesEndpoint()) {
            ObjectNode body = mapper.createObjectNode();
            body.put("model", env.getProperty("llm.azure.embedding-deployment", "text-embedding-3-small"));
            body.put("input", text);
            try {
                String response = azureResponsesClient().post()
                        .uri("/embeddings")
                        .bodyValue(body.toString()).retrieve().bodyToMono(String.class).block();
                return parseEmbedding(response);
            } catch (WebClientResponseException.NotFound error) {
                if (!Boolean.parseBoolean(env.getProperty("llm.azure.embedding-fallback", "true"))) {
                    throw error;
                }
                System.err.println("⚠️ Azure embedding deployment not found; using local fallback for RAG.");
                return embedFallback(text);
            }
        }
        // Embedding uses a different deployment — text-embedding-ada-002
        String embeddingEndpoint = env.getProperty("llm.azure.embedding-endpoint", "");
        if (embeddingEndpoint.isBlank()) {
            embeddingEndpoint = azureDeploymentEndpoint(
                env.getProperty("llm.azure.endpoint", ""),
                env.getProperty("llm.azure.embedding-deployment", "text-embedding-3-small"));
        }
        ObjectNode body = mapper.createObjectNode();
        body.put("input", text);
        String response = WebClient.builder().baseUrl(embeddingEndpoint)
                .defaultHeader("api-key", env.getProperty("llm.api-key"))
                .defaultHeader("Content-Type", "application/json")
                .build().post()
                .uri("/embeddings?api-version=2024-02-01")
                .bodyValue(body.toString()).retrieve().bodyToMono(String.class).block();
        return parseEmbedding(response);
    }

    private WebClient azureClient() {
        return WebClient.builder()
                .baseUrl(azureDeploymentEndpoint(
                        env.getProperty("llm.azure.endpoint", ""),
                        env.getProperty("llm.azure.deployment", env.getProperty("llm.model", "gpt-4o"))))
                .defaultHeader("api-key", env.getProperty("llm.api-key"))
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    private WebClient azureResponsesClient() {
        return WebClient.builder()
                .baseUrl(env.getProperty("llm.azure.endpoint", "").replaceAll("/+$", ""))
                .defaultHeader("api-key", env.getProperty("llm.api-key"))
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    private boolean isAzureResponsesEndpoint() {
        return env.getProperty("llm.azure.endpoint", "").matches(".*?/openai/v1/?$");
    }

    private String azureDeploymentEndpoint(String endpoint, String deployment) {
        String normalized = endpoint == null ? "" : endpoint.replaceAll("/+$", "");
        if (normalized.contains("/openai/deployments/")) {
            return normalized;
        }
        if (normalized.endsWith("/chat/completions")) {
            normalized = normalized.substring(0, normalized.length() - "/chat/completions".length());
        }
        return normalized + "/openai/deployments/" + deployment;
    }

    // ── OpenAI-compatible (OpenAI + Groq use same API format) ────────────────

    private String completeOpenAICompat(String baseUrl, String system, String user) {
        ObjectNode body = mapper.createObjectNode();
        body.put("model", env.getProperty("llm.model", "gpt-4o"));
        body.put("temperature", 0.7);
        ArrayNode messages = body.putArray("messages");
        messages.addObject().put("role", "system").put("content", system);
        messages.addObject().put("role", "user").put("content", user);
        String response = openAICompatClient(baseUrl).post()
            .uri("/chat/completions")
                .bodyValue(body.toString()).retrieve().bodyToMono(String.class).block();
        return extractContent(response);
    }

    private String completeOpenAICompatWithHistory(String baseUrl, String system, List<Map<String, String>> history) {
        ObjectNode body = mapper.createObjectNode();
        body.put("model", env.getProperty("llm.model", "gpt-4o"));
        body.put("temperature", 0.7);
        ArrayNode messages = body.putArray("messages");
        messages.addObject().put("role", "system").put("content", system);
        history.forEach(m -> messages.addObject().put("role", m.get("role")).put("content", m.get("content")));
        String response = openAICompatClient(baseUrl).post()
            .uri("/chat/completions")
                .bodyValue(body.toString()).retrieve().bodyToMono(String.class).block();
        return extractContent(response);
    }

    private float[] embedOpenAI(String text) {
        ObjectNode body = mapper.createObjectNode();
        body.put("model", "text-embedding-ada-002");
        body.put("input", text);
        String response = openAICompatClient("https://api.openai.com/v1").post()
            .uri("/embeddings").bodyValue(body.toString())
                .retrieve().bodyToMono(String.class).block();
        return parseEmbedding(response);
    }

        private float[] embedOpenAICompatible(String text) {
        ObjectNode body = mapper.createObjectNode();
        body.put("model", env.getProperty("llm.embedding-model", env.getProperty("llm.model", "text-embedding-3-small")));
        body.put("input", text);
        String response = openAICompatClient(env.getRequiredProperty("llm.base-url")).post()
            .uri("/embeddings").bodyValue(body.toString())
            .retrieve().bodyToMono(String.class).block();
        return parseEmbedding(response);
        }

    private WebClient openAICompatClient(String baseUrl) {
        return WebClient.builder().baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + env.getProperty("llm.api-key"))
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    // ── Anthropic ─────────────────────────────────────────────────────────────

    private String completeAnthropic(String system, String user) {
        ObjectNode body = mapper.createObjectNode();
        body.put("model", env.getProperty("llm.model", "claude-sonnet-4-6"));
        body.put("max_tokens", 1024);
        body.put("system", system);
        body.putArray("messages").addObject().put("role", "user").put("content", user);
        String response = anthropicClient().post()
            .uri("/v1/messages")
            .bodyValue(body.toString()).retrieve().bodyToMono(String.class).block();
        return extractAnthropicContent(response);
        }

        private WebClient anthropicClient() {
        return WebClient.builder().baseUrl(env.getProperty("llm.base-url", "https://api.anthropic.com"))
                .defaultHeader("x-api-key", env.getProperty("llm.api-key"))
                .defaultHeader("anthropic-version", "2023-06-01")
                .defaultHeader("Content-Type", "application/json")
            .build();
    }

    private String completeAnthropicWithHistory(String system, List<Map<String, String>> history) {
        ObjectNode body = mapper.createObjectNode();
        body.put("model", env.getProperty("llm.model", "claude-sonnet-4-6"));
        body.put("max_tokens", 1024);
        body.put("system", system);
        ArrayNode messages = body.putArray("messages");
        history.forEach(m -> messages.addObject().put("role", m.get("role")).put("content", m.get("content")));
        String response = anthropicClient().post().uri("/v1/messages")
                .bodyValue(body.toString()).retrieve().bodyToMono(String.class).block();
        return extractAnthropicContent(response);
    }

    // ── Groq fallback embedding (hash-based, not semantic) ───────────────────

    /**
     * Groq and Anthropic don't have embedding APIs.
     * This deterministic hash fallback allows the code to run — but results
     * won't be semantically meaningful. For real RAG, use Azure OpenAI or OpenAI.
     */
    private float[] embedFallback(String text) {
        float[] vec = new float[128];
        for (String word : text.toLowerCase().split("\\s+")) {
            vec[Math.abs(word.hashCode() % 128)] += 1.0f;
        }
        float norm = 0;
        for (float v : vec) norm += v * v;
        norm = (float) Math.sqrt(norm);
        if (norm > 0) for (int i = 0; i < vec.length; i++) vec[i] /= norm;
        return vec;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String extractContent(String response) {
        try {
            return mapper.readTree(response).path("choices").get(0)
                    .path("message").path("content").asText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse LLM response: " + response, e);
        }
    }

    private String extractAnthropicContent(String response) {
        try {
            return mapper.readTree(response).path("content").get(0).path("text").asText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Anthropic response: " + response, e);
        }
    }

    private String extractResponsesContent(String response) {
        try {
            JsonNode output = mapper.readTree(response).path("output");
            for (JsonNode item : output) {
                for (JsonNode content : item.path("content")) {
                    String text = content.path("text").asText();
                    if (!text.isBlank()) return text;
                }
            }
            throw new IllegalStateException("No text content in Responses API output");
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Responses API response: " + response, e);
        }
    }

    private float[] parseEmbedding(String response) {
        try {
            JsonNode values = mapper.readTree(response).path("data").get(0).path("embedding");
            float[] vec = new float[values.size()];
            for (int i = 0; i < values.size(); i++) vec[i] = (float) values.get(i).asDouble();
            return vec;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse embedding: " + response, e);
        }
    }

    private IllegalArgumentException unsupportedProvider(String provider) {
        return new IllegalArgumentException("Unsupported llm.provider: " + provider
                + ". Use azure, openai, anthropic, groq, openai-compatible, custom, or ollama.");
    }
}
