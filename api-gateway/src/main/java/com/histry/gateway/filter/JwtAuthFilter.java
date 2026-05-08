package com.histry.gateway.filter;

import com.histry.gateway.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * Centralized JWT authentication filter.
 * Downstream services never parse JWT — they only read X-User-Id and X-User-Role headers.
 */
@Component
@Slf4j
public class JwtAuthFilter extends AbstractGatewayFilterFactory<JwtAuthFilter.Config> {

    private final JwtUtil jwtUtil;

    // AbstractGatewayFilterFactory requires super(Config.class).
    // @RequiredArgsConstructor doesn't call super(), so we write it manually.
    public JwtAuthFilter(JwtUtil jwtUtil) {
        super(Config.class);
        this.jwtUtil = jwtUtil;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

            // No token present
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                if (config.isRequireAuth()) {
                    return unauthorized(exchange);
                }
                // Public route — pass through without user context
                return chain.filter(exchange);
            }

            String token = authHeader.substring(7);

            try {
                if (!jwtUtil.isValid(token)) {
                    return unauthorized(exchange);
                }

                String userId = jwtUtil.extractUserId(token);
                String role = jwtUtil.extractRole(token);

                // Role check for admin routes
                if (config.getRequiredRole() != null && !config.getRequiredRole().equals(role)) {
                    return forbidden(exchange);
                }

                // Inject user context headers for downstream services
                ServerWebExchange mutatedExchange = exchange.mutate()
                        .request(r -> r.header("X-User-Id", userId)
                                .header("X-User-Role", role))
                        .build();

                return chain.filter(mutatedExchange);

            } catch (Exception e) {
                log.warn("JWT validation failed: {}", e.getMessage());
                return unauthorized(exchange);
            }
        };
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }

    private Mono<Void> forbidden(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
        return exchange.getResponse().setComplete();
    }

    @Override
    public List<String> shortcutFieldOrder() {
        return List.of("requireAuth", "requiredRole");
    }

    public static class Config {
        private boolean requireAuth = false;
        private String requiredRole;

        public boolean isRequireAuth() { return requireAuth; }
        public void setRequireAuth(boolean requireAuth) { this.requireAuth = requireAuth; }
        public String getRequiredRole() { return requiredRole; }
        public void setRequiredRole(String requiredRole) { this.requiredRole = requiredRole; }
    }
}
