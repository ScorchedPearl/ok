package com.screening.interviews.config;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.filter.OncePerRequestFilter;

import java.util.function.Function;

@Slf4j
public class DelegatingJwtDecoder implements JwtDecoder {

    private final Function<HttpServletRequest, JwtDecoder> decoderResolver;

    public DelegatingJwtDecoder(Function<HttpServletRequest, JwtDecoder> decoderResolver) {
        this.decoderResolver = decoderResolver;
    }


    @Override
    public Jwt decode(String token) throws JwtException {
        try {
            HttpServletRequest request = getCurrentRequest();
            if (request == null) {
                log.warn("No HTTP request found in context, this might be a non-web context");
                throw new JwtException("Unable to resolve JWT decoder: No HTTP request context available");
            }

            JwtDecoder decoder = decoderResolver.apply(request);
            if (decoder == null) {
                log.error("No JWT decoder resolved for request path: {}", request.getRequestURI());
                throw new JwtException("Unable to resolve JWT decoder for request path: " + request.getRequestURI());
            }

            log.debug("Using JWT decoder for request path: {}", request.getRequestURI());
            return decoder.decode(token);

        } catch (JwtException e) {
            log.error("JWT decoding failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during JWT decoding: {}", e.getMessage(), e);
            throw new JwtException("JWT decoding failed due to unexpected error", e);
        }
    }

    private HttpServletRequest getCurrentRequest() {
        try {
            ServletRequestAttributes requestAttributes =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

            if (requestAttributes == null) {
                log.debug("No request attributes found in RequestContextHolder");
                return null;
            }

            return requestAttributes.getRequest();
        } catch (Exception e) {
            log.warn("Failed to get current request from RequestContextHolder: {}", e.getMessage());
            return null;
        }
    }
}