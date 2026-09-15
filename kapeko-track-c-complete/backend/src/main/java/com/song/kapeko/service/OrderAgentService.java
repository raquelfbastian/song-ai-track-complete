package com.song.kapeko.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * OrderAgentService — Lab 9: Order Assistant Agent
 *
 * Teaches: tool-calling / function-calling agents.
 * The agent decides which tool to call based on customer intent.
 * No human selects the tool — the agent reasons and acts.
 *
 * Tools available:
 *   - getOrderStatus(orderId)
 *   - pauseSubscription(customerId, months)
 *   - changeSubscriptionProduct(customerId, newSku)
 *   - initiateReturn(orderId, reason)
 *
 * Real-world: autonomous order management agents in commerce platforms.
 * Reduces CS ticket volume for routine actions.
 */
@Service
public class OrderAgentService {

    private final LlmService llmService;
    private final ObjectMapper mapper = new ObjectMapper();

    // Tool definitions — tells the LLM what tools are available and when to use them
    private static final String AGENT_SYSTEM = """
            You are the Kape Ko Order Assistant — an autonomous agent that helps
            customers manage their orders and subscriptions.

            You have access to these tools. Call them by returning JSON in this format:
            { "tool": "toolName", "args": { "param": "value" } }

            Available tools:
            1. getOrderStatus
               Args: { "orderId": "string" }
               Use when: customer asks about order status, tracking, or delivery

            2. pauseSubscription
               Args: { "customerId": "string", "months": number }
               Use when: customer wants to pause their subscription
               Constraint: maximum 3 months per pause request

            3. changeSubscriptionProduct
               Args: { "customerId": "string", "newSku": "string" }
               Use when: customer wants to change which coffee they receive
               Valid SKUs: SKU-001, SKU-002, SKU-003, SKU-004

            4. initiateReturn
               Args: { "orderId": "string", "reason": "string" }
               Use when: customer wants to return an order

            If the request is unclear, ask ONE clarifying question.
            If no tool matches, respond conversationally.
            If a tool is called, also explain to the customer what you did.
            """;

    public OrderAgentService(LlmService llmService) {
        this.llmService = llmService;
    }

    /**
     * Lab 9: Process a customer message through the order agent.
     * The agent decides whether to call a tool or respond conversationally.
     */
    public Map<String, Object> process(String customerId, String message) throws Exception {
        // Ask LLM to reason about the request
        String response = llmService.complete(AGENT_SYSTEM, message);

        // Check if the LLM wants to call a tool
        if (isToolCall(response)) {
            return executeToolCall(customerId, response);
        }

        // No tool call — conversational response
        return Map.of(
            "type", "message",
            "response", response,
            "toolCalled", false
        );
    }

    /** Detect if the LLM response is a tool call */
    private boolean isToolCall(String response) {
        String trimmed = response.trim();
        return trimmed.startsWith("{") && trimmed.contains("\"tool\"");
    }

    /** Execute the tool the LLM decided to call */
    private Map<String, Object> executeToolCall(String customerId, String toolJson) {
        try {
            // Strip any surrounding text
            int start = toolJson.indexOf('{');
            int end = toolJson.lastIndexOf('}') + 1;
            String json = toolJson.substring(start, end);

            JsonNode node = mapper.readTree(json);
            String toolName = node.path("tool").asText();
            JsonNode args = node.path("args");

            return switch (toolName) {
                case "getOrderStatus" -> getOrderStatus(args.path("orderId").asText());
                case "pauseSubscription" -> pauseSubscription(
                    customerId,
                    args.path("months").asInt(1));
                case "changeSubscriptionProduct" -> changeSubscriptionProduct(
                    customerId,
                    args.path("newSku").asText());
                case "initiateReturn" -> initiateReturn(
                    args.path("orderId").asText(),
                    args.path("reason").asText());
                default -> Map.of(
                    "type", "error",
                    "response", "Unknown tool: " + toolName,
                    "toolCalled", false
                );
            };
        } catch (Exception e) {
            return Map.of("type", "error", "response", "Tool execution failed: " + e.getMessage());
        }
    }

    // ── Tool implementations ──────────────────────────────────────────────
    // In a real system, these would call an OMS, CRM, or subscription service API.
    // For Level 2, they return mock data to demonstrate the pattern.

    private Map<String, Object> getOrderStatus(String orderId) {
        // Mock OMS response
        return Map.of(
            "type", "tool_result",
            "tool", "getOrderStatus",
            "toolCalled", true,
            "result", Map.of(
                "orderId", orderId,
                "status", "In Transit",
                "estimatedDelivery", "2-3 business days",
                "carrier", "LBC Express",
                "trackingNumber", "LBC-" + orderId.toUpperCase()
            ),
            "response", String.format(
                "Your order %s is currently in transit via LBC Express. " +
                "Expected delivery in 2-3 business days. " +
                "Tracking number: LBC-%s.", orderId, orderId.toUpperCase())
        );
    }

    private Map<String, Object> pauseSubscription(String customerId, int months) {
        int validMonths = Math.min(months, 3); // Enforce max 3 months
        return Map.of(
            "type", "tool_result",
            "tool", "pauseSubscription",
            "toolCalled", true,
            "result", Map.of(
                "customerId", customerId,
                "pausedForMonths", validMonths,
                "resumeDate", "automatically resumes after " + validMonths + " months",
                "nextBillingDate", "paused"
            ),
            "response", String.format(
                "Done! Your Kape Ko subscription has been paused for %d month%s. " +
                "It will automatically resume after that. " +
                "Your coffee will be waiting for you when you're back! ☕",
                validMonths, validMonths > 1 ? "s" : "")
        );
    }

    private Map<String, Object> changeSubscriptionProduct(String customerId, String newSku) {
        Map<String, String> skuNames = Map.of(
            "SKU-001", "Benguet Sunrise — Light Roast",
            "SKU-002", "Sagada Mist — Medium Roast",
            "SKU-003", "Mt. Apo Dark — Dark Roast",
            "SKU-004", "Kape Ko Blend — Medium Roast"
        );
        String productName = skuNames.getOrDefault(newSku, newSku);
        return Map.of(
            "type", "tool_result",
            "tool", "changeSubscriptionProduct",
            "toolCalled", true,
            "result", Map.of(
                "customerId", customerId,
                "newProduct", productName,
                "effectiveFrom", "next billing cycle"
            ),
            "response", String.format(
                "Switched! Your next Kape Ko delivery will be %s. " +
                "The change takes effect from your next billing cycle. " +
                "Enjoy the new brew! ☕", productName)
        );
    }

    private Map<String, Object> initiateReturn(String orderId, String reason) {
        return Map.of(
            "type", "tool_result",
            "tool", "initiateReturn",
            "toolCalled", true,
            "result", Map.of(
                "orderId", orderId,
                "returnId", "RET-" + orderId.toUpperCase(),
                "reason", reason,
                "status", "Return initiated",
                "instructions", "Drop off at any LBC branch within 7 days"
            ),
            "response", String.format(
                "Return initiated for order %s (Reason: %s). " +
                "Your return ID is RET-%s. " +
                "Please drop off the package at any LBC branch within 7 days. " +
                "Refund will be processed within 5-7 business days.",
                orderId, reason, orderId.toUpperCase())
        );
    }
}
