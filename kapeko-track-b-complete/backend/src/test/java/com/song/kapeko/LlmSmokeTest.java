package com.song.kapeko;

import com.song.kapeko.service.LlmService;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.fail;

class LlmSmokeTest {

    @Test
    void configuredLlmCanAnswer() {
        String provider = requiredEnv("LLM_PROVIDER", "azure");
        String apiKey = requiredEnv("LLM_API_KEY", null);
        MockEnvironment environment = new MockEnvironment()
                .withProperty("llm.provider", provider)
                .withProperty("llm.api-key", apiKey)
                .withProperty("llm.model", envOrDefault("LLM_MODEL", "gpt-4o"));

        if (provider.equalsIgnoreCase("azure")) {
            environment.withProperty("llm.azure.endpoint", requiredEnv("AZURE_OPENAI_ENDPOINT", null));
            environment.withProperty("llm.azure.deployment", requiredEnv("AZURE_OPENAI_DEPLOYMENT", null));
        } else if (provider.equalsIgnoreCase("openai-compatible")
                || provider.equalsIgnoreCase("custom")
                || provider.equalsIgnoreCase("ollama")) {
            environment.withProperty("llm.base-url", requiredEnv("LLM_BASE_URL", null));
        }

        try {
            String response = new LlmService(environment).complete(
                    "You are a concise test assistant.",
                    "Reply with exactly: LLM connection works.");
            assertFalse(response == null || response.isBlank(), "LLM returned an empty response");
            System.out.println("LLM smoke test passed. Provider: " + provider);
            System.out.println("Response: " + response);
        } catch (Exception error) {
            fail("LLM smoke test failed for provider " + provider + ": " + error.getMessage(), error);
        }
    }

    private static String requiredEnv(String name, String defaultValue) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) {
            if (defaultValue != null) return defaultValue;
            fail("Missing required environment variable: " + name);
        }
        return value;
    }

    private static String envOrDefault(String name, String defaultValue) {
        String value = System.getenv(name);
        return value == null || value.isBlank() ? defaultValue : value;
    }
}
