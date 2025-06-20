package com.screening.interviews.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Collections;
import java.util.List;
import java.util.Map;
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
    public DelegatingJwtDecoder delegatingJwtDecoder() {
        return new DelegatingJwtDecoder(request -> {
            String path = request.getRequestURI();
            log.debug("Determining JWT decoder for path: {}", path);

            if (path.startsWith("/api/super-admin") || path.startsWith("/api/tenants")) {
                log.debug("Using super admin decoder for path: {}", path);
                return superAdminJwtDecoder();
            } else if (path.startsWith("/api/tenant")
                    || path.startsWith("/api/hiring")
                    || path.startsWith("/api/calls")
                    || path.startsWith("/api/interviews")
                    || path.startsWith("/api/feedback")
                    || path.startsWith("/api/candidates")
                    || path.startsWith("/api/tenant-candidates")) {
                log.debug("Using tenant decoder for path: {}", path);
                return tenantJwtDecoder();
            } else if (path.startsWith("/api/candidate")
                    || path.startsWith("/api/jobs")
                    || path.startsWith("/api/candidate-jobs")
                    || path.startsWith("/api/job-applications")) {
                log.debug("Using candidate decoder for path: {}", path);
                return candidateJwtDecoder();
            }

            log.debug("Using default tenant decoder for path: {}", path);
            return tenantJwtDecoder();
        });
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/swagger-ui/**", "/api-docs/**", "/v3/api-docs/**", "/api/candidate/**",
                                "/api/files/**",
                                "/api/candidate-jobs/**",
                                "/api/candidates/**",
                                "/api/documents/**",
                                "/api/interviews/**",
                                "/api/feedback/**",
                                "/api/jobs/**",
                                "/api/job-applications/**","/api/tenant/**",
                                "/api/hiring/**",
                                "/api/candidates/**",
                                "/api/documents/**",
                                "/api/files/**",
                                "/api/interviews/**",
                                "/api/feedback/**",
                                "/api/calls/**",
                                "/api/tenant-candidates/**",
                                "/api/public/**",
                                "/api/candidate/register",
                                "/api/documents",
                                "/api/files"
                        ,"api/onboarding-tasks/").permitAll()
                        .requestMatchers("/api/tenants/**", "/api/super-admin/**").hasRole("SUPER_ADMIN")

                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .jwtAuthenticationConverter(jwtAuthenticationConverter())
                                .decoder(delegatingJwtDecoder())
                        )
                );
        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        log.debug("Configuring JWT converter");

        var converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            var roles = (Map<String, List<String>>) jwt.getClaims().get("realm_access");

            if (roles != null && roles.get("roles") != null) {
                return roles.get("roles").stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                        .peek(authority -> log.debug("Granted Authority: {}", authority))
                        .collect(Collectors.toSet());
            }

            log.debug("No roles found in JWT token");
            return Collections.emptySet();
        });

        return converter;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOriginPattern("*"); // Allow all origins
        configuration.addAllowedMethod("*"); // Allow all HTTP methods
        configuration.addAllowedHeader("*"); // Allow all headers
        configuration.setAllowCredentials(true); // Allow credentials (if needed)

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}