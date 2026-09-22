package com.song.kapeko.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private final long windowMillis;
    private final int generalLimit;
    private final int aiLimit;
    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

    public RateLimitInterceptor(
            @Value("${rate-limit.window-ms:900000}") long windowMillis,
            @Value("${rate-limit.general-limit:100}") int generalLimit,
            @Value("${rate-limit.ai-limit:10}") int aiLimit) {
        this.windowMillis = windowMillis;
        this.generalLimit = generalLimit;
        this.aiLimit = aiLimit;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws IOException {
        if (!request.getRequestURI().startsWith("/api/") || "OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String client = request.getRemoteAddr();
        boolean aiRequest = isAiRequest(request.getRequestURI());
        String key = (aiRequest ? "ai:" : "api:") + client;
        int limit = aiRequest ? aiLimit : generalLimit;
        Window window = windows.compute(key, (ignored, current) -> current == null || current.expired(windowMillis)
                ? new Window()
                : current);

        if (window.count.incrementAndGet() > limit) {
            long retryAfter = Math.max(1, (window.startedAt + windowMillis - System.currentTimeMillis()) / 1000);
            response.setStatus(429);
            response.setHeader("Retry-After", String.valueOf(retryAfter));
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("{\"error\":\"Too many requests. Please try again later.\"}");
            return false;
        }
        return true;
    }

    private boolean isAiRequest(String path) {
        return path.equals("/api/catalog/generate")
                || path.equals("/api/catalog/enrich-all")
                || path.matches("/api/products/[^/]+/enrich")
                || path.equals("/api/chat")
                || path.equals("/api/search")
                || path.startsWith("/api/rag/")
                || path.startsWith("/api/agent/");
    }

    private static final class Window {
        private final long startedAt = System.currentTimeMillis();
        private final AtomicInteger count = new AtomicInteger();

        private boolean expired(long duration) {
            return System.currentTimeMillis() - startedAt >= duration;
        }
    }
}
