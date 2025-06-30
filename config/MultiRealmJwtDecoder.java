package com.screening.interviews.config;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
public class MultiRealmJwtDecoder implements JwtDecoder {

    private final List<JwtDecoder> decoders;
    private final String description;

    public MultiRealmJwtDecoder(List<JwtDecoder> decoders, String description) {
        this.decoders = decoders;
        this.description = description;
    }

    @Override
    public Jwt decode(String token) throws JwtException {
        log.info("=== MULTI-REALM DECODER: {} ===", description);
        log.info("Token preview: {}...", token.substring(0, Math.min(50, token.length())));

        JwtException lastException = null;

        for (int i = 0; i < decoders.size(); i++) {
            JwtDecoder decoder = decoders.get(i);
            try {
                log.info("Attempt {}: Trying decoder {} for {}", i + 1, decoder.getClass().getSimpleName(), description);
                Jwt jwt = decoder.decode(token);
                log.info("SUCCESS: Decoded token using {} for {}", decoder.getClass().getSimpleName(), description);
                log.info("JWT Subject: {}, Issuer: {}", jwt.getSubject(), jwt.getIssuer());
                return jwt;
            } catch (JwtException e) {
                log.warn("FAILED: Decoder {} failed for {}: {}", decoder.getClass().getSimpleName(), description, e.getMessage());
                lastException = e;
            }
        }

        log.error("ALL DECODERS FAILED for {}", description);
        if (lastException != null) {
            log.error("Last exception: ", lastException);
        }
        throw lastException != null ? lastException : new JwtException("All JWT decoders failed for " + description);
    }
}