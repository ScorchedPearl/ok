package com.screening.interviews.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Configuration
@ConditionalOnProperty(name = "app.security.debug", havingValue = "true", matchIfMissing = false)
public class JwtDecoderDebugConfiguration {

    @Bean
    @Order(1)
    public JwtDecoderDebugFilter jwtDecoderDebugFilter() {
        return new JwtDecoderDebugFilter();
    }

    @Slf4j
    public static class JwtDecoderDebugFilter extends OncePerRequestFilter {

        @Override
        protected void doFilterInternal(HttpServletRequest request,
                                        HttpServletResponse response,
                                        FilterChain filterChain) throws ServletException, IOException {

            String path = request.getRequestURI();
            String method = request.getMethod();
            String authHeader = request.getHeader("Authorization");

            log.debug("=== JWT Decoder Debug ===");
            log.debug("Request: {} {}", method, path);
            log.debug("Authorization Header: {}", authHeader != null ? "Present" : "Not Present");

            // Determine which decoder should be used
            String expectedDecoder = determineExpectedDecoder(path);
            log.debug("Expected JWT Decoder: {}", expectedDecoder);

            try {
                filterChain.doFilter(request, response);
                log.debug("Request processed successfully");
            } catch (Exception e) {
                log.error("Error processing request: {}", e.getMessage());
                throw e;
            }
        }

        private String determineExpectedDecoder(String path) {
            if (path.matches("^/api/(super-admin|tenants)(/.*)?$")) {
                return "Super Admin Decoder";
            } else if (path.startsWith("/api/onboarding-tasks/candidate/")) {
                return "Candidate Decoder (Onboarding Tasks)";
            } else if (path.startsWith("/api/onboarding-tasks/tenant/") ||
                    path.matches("/api/onboarding-tasks/\\d+") ||
                    path.startsWith("/api/onboarding-tasks/statuses") ||
                    path.startsWith("/api/onboarding-tasks")) {
                return "Tenant Decoder (Onboarding Tasks)";
            } else if (path.matches("^/api/(tenant|hiring|calls|interviews|feedback|candidates|documents|files|tenant-candidates)(/.*)?$")) {
                return "Tenant Decoder";
            } else if (path.matches("^/api/(candidate|jobs|candidate-jobs|job-applications)(/.*)?$")) {
                return "Candidate Decoder";
            }
            return "Default (Tenant) Decoder";
        }
    }
}