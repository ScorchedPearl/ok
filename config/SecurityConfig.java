package com.screening.interviews.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${keycloak.auth-server-url}")
    private String authServerUrl;

    @Value("${keycloak.realms.super-admin}")
    private String superAdminRealm;

    @Value("${keycloak.realms.tenant}")
    private String tenantRealm;

    @Value("${keycloak.realms.candidate}")
    private String candidateRealm;

    // Role constants - only TENANT_ADMIN exists, not TENANT
    public static final String SUPER_ADMIN = "SUPER_ADMIN";
    public static final String TENANT_ADMIN = "TENANT_ADMIN";
    public static final String CANDIDATE = "CANDIDATE";

    @Bean
    public JwtDecoder superAdminJwtDecoder() {
        String jwkSetUri = String.format("%s/realms/%s/protocol/openid-connect/certs", authServerUrl, superAdminRealm);
        return NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
    }

    @Bean
    public JwtDecoder tenantJwtDecoder() {
        String jwkSetUri = String.format("%s/realms/%s/protocol/openid-connect/certs", authServerUrl, tenantRealm);
        return NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
    }

    @Bean
    public JwtDecoder candidateJwtDecoder() {
        String jwkSetUri = String.format("%s/realms/%s/protocol/openid-connect/certs", authServerUrl, candidateRealm);
        return NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
    }

    @Bean
    public MultiRealmJwtDecoder candidateTenantMultiDecoder() {
        return new MultiRealmJwtDecoder(
                List.of(candidateJwtDecoder(), tenantJwtDecoder()),
                "candidate-tenant shared routes"
        );
    }

    @Bean
    public MultiRealmJwtDecoder tenantAdminMultiDecoder() {
        return new MultiRealmJwtDecoder(
                List.of(tenantJwtDecoder(), superAdminJwtDecoder()),
                "tenant-admin shared routes"
        );
    }

    @Bean
    public DelegatingJwtDecoder delegatingJwtDecoder() {
        return new DelegatingJwtDecoder(request -> {
            String path = request.getRequestURI();
            String method = request.getMethod();

            if (path.startsWith("/api/super-admin")) {
                return superAdminJwtDecoder();
            }
            else if (path.startsWith("/api/tenants")) {
                return tenantAdminMultiDecoder();
            }
            else if (isSharedCandidateTenantRoute(path)) {
                return candidateTenantMultiDecoder();
            }
            else if (isTenantExclusiveRoute(path)) {
                return tenantJwtDecoder();
            }
            else if (isCandidateExclusiveRoute(path)) {
                return candidateJwtDecoder();
            }
            return tenantJwtDecoder();
        });
    }

    // PUBLIC ENDPOINTS FILTER CHAIN - NO AUTHENTICATION
    @Bean
    @Order(1)
    public SecurityFilterChain publicFilterChain(HttpSecurity http) throws Exception {
        log.info("Configuring PUBLIC Security Filter Chain");

        http
                .securityMatcher(
                        "/swagger-ui/**",
                        "/api-docs/**",
                        "/v3/api-docs/**",
                        "/api/public/**",
                        "/api/candidate/register",
                        "/api/auth/test",
                        "/api/debug/**",
                        "/api/jobs",
                        "/actuator/**",
                        "/api/health/**",
                        "/api/debug/**"
                )
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authorize -> authorize
                        .anyRequest().permitAll()
                );

        log.info("PUBLIC endpoints configured - no authentication required");
        return http.build();
    }

    // AUTHENTICATED ENDPOINTS FILTER CHAIN - REQUIRES JWT
    @Bean
    @Order(2)
    public SecurityFilterChain authenticatedFilterChain(HttpSecurity http) throws Exception {
        log.info("Configuring AUTHENTICATED Security Filter Chain");

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authorize -> authorize
                        // Super Admin routes
                        .requestMatchers("/api/super-admin/**").hasRole(SUPER_ADMIN)

                        // Tenant management routes
                        .requestMatchers("/api/tenants/**").hasAnyRole(SUPER_ADMIN, TENANT_ADMIN)

                        // Job routes with method-specific permissions
                        .requestMatchers(HttpMethod.GET, "/api/jobs/**").hasAnyRole(CANDIDATE, TENANT_ADMIN, SUPER_ADMIN)
                        .requestMatchers(HttpMethod.POST, "/api/jobs/**").hasAnyRole(TENANT_ADMIN, SUPER_ADMIN)
                        .requestMatchers(HttpMethod.PUT, "/api/jobs/**").hasAnyRole(TENANT_ADMIN, SUPER_ADMIN)
                        .requestMatchers(HttpMethod.DELETE, "/api/jobs/**").hasAnyRole(TENANT_ADMIN, SUPER_ADMIN)

                        // Shared candidate-tenant routes
                        .requestMatchers("/api/job-applications/**").hasAnyRole(CANDIDATE, TENANT_ADMIN, SUPER_ADMIN)
                        .requestMatchers("/api/candidate-jobs/**").hasAnyRole(CANDIDATE, TENANT_ADMIN, SUPER_ADMIN)
                        .requestMatchers("/api/calls/**").hasAnyRole(CANDIDATE, TENANT_ADMIN, SUPER_ADMIN)
                        .requestMatchers("/api/interviews/**").hasAnyRole(CANDIDATE, TENANT_ADMIN, SUPER_ADMIN)
                        .requestMatchers("/api/feedback/**").hasAnyRole(CANDIDATE, TENANT_ADMIN, SUPER_ADMIN)
                        .requestMatchers("/api/onboarding-tasks/**").hasAnyRole(CANDIDATE, TENANT_ADMIN, SUPER_ADMIN)
                        .requestMatchers("/api/candidates/**").hasAnyRole(CANDIDATE, TENANT_ADMIN, SUPER_ADMIN)

                        // Tenant exclusive routes
                        .requestMatchers("/api/tenant/**").hasAnyRole(TENANT_ADMIN, SUPER_ADMIN)
                        .requestMatchers("/api/hiring/**").hasAnyRole(TENANT_ADMIN, SUPER_ADMIN)
                        .requestMatchers("/api/tenant-candidates/**").hasAnyRole(TENANT_ADMIN, SUPER_ADMIN)
                        .requestMatchers("/api/feedback-templates/**").hasAnyRole(TENANT_ADMIN, SUPER_ADMIN)

                        // Candidate exclusive routes
                        .requestMatchers("/api/candidate/**").hasAnyRole(CANDIDATE, SUPER_ADMIN)
                        .requestMatchers("/api/files/**").hasAnyRole(CANDIDATE, TENANT_ADMIN, SUPER_ADMIN)
                        .requestMatchers("/api/documents/**").hasAnyRole(CANDIDATE, TENANT_ADMIN, SUPER_ADMIN)

                        // All other requests require authentication
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .jwtAuthenticationConverter(jwtAuthenticationConverter())
                                .decoder(delegatingJwtDecoder())
                        )
                );

        log.info("AUTHENTICATED endpoints configured - JWT authentication required");
        return http.build();
    }

    private boolean isSharedCandidateTenantRoute(String path) {
        boolean result = path.startsWith("/api/job-applications") ||
                path.startsWith("/api/candidate-jobs") ||
                path.startsWith("/api/jobs") ||
                path.startsWith("/api/calls") ||
                path.startsWith("/api/interviews") ||
                path.startsWith("/api/feedback") ||
                path.startsWith("/api/onboarding-tasks") ||
                path.startsWith("/api/candidates");

        log.debug("isSharedCandidateTenantRoute('{}') = {}", path, result);
        return result;
    }

    private boolean isTenantExclusiveRoute(String path) {
        boolean result = path.startsWith("/api/tenant/") ||
                path.startsWith("/api/hiring") ||
                path.startsWith("/api/tenant-candidates") ||
                path.startsWith("/api/feedback-templates");

        log.debug("isTenantExclusiveRoute('{}') = {}", path, result);
        return result;
    }

    private boolean isCandidateExclusiveRoute(String path) {
        boolean result = path.startsWith("/api/candidate/") ||
                path.startsWith("/api/documents") ||
                path.startsWith("/api/files");

        log.debug("isCandidateExclusiveRoute('{}') = {}", path, result);
        return result;
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        log.info("Creating JWT Authentication Converter");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            try {
                // Extract realm_access roles
                Object realmAccess = jwt.getClaim("realm_access");
                log.debug("Raw realm_access claim: {}", realmAccess);

                if (realmAccess instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> realmMap = (Map<String, Object>) realmAccess;
                    Object rolesObj = realmMap.get("roles");

                    if (rolesObj instanceof List) {
                        @SuppressWarnings("unchecked")
                        List<String> roles = (List<String>) rolesObj;
                        log.debug("Extracted roles: {}", roles);

                        Collection<? extends GrantedAuthority> authorities = roles.stream()
                                .map(role -> {
                                    String upperRole = role.toUpperCase();
                                    SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + upperRole);
                                    log.debug("Creating authority: {} from role: {}", authority.getAuthority(), role);
                                    return authority;
                                })
                                .collect(Collectors.toSet());

                        log.debug("Final authorities: {}",
                                authorities.stream().map(a -> a.getAuthority()).collect(Collectors.toList()));
                        return (Collection<GrantedAuthority>) authorities;
                    }
                }
                return Collections.emptySet();

            } catch (Exception e) {
                log.error("Error extracting authorities from JWT", e);
                return Collections.emptySet();
            }
        });

        return converter;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOriginPattern("*");
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true);

        configuration.addExposedHeader("Authorization");
        configuration.addAllowedHeader("Authorization");
        configuration.addAllowedHeader("Content-Type");

        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}