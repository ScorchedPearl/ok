package com.screening.interviews.config;

import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.boot.actuate.health.Health;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Configuration
@Slf4j
public class HealthConfiguration {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

//    @Bean("externalServicesHealth")
    public HealthIndicator externalServicesHealthIndicator() {
        return () -> {
            Map<String, Object> details = new HashMap<>();
            boolean allServicesUp = true;

            // FIX: Convert LocalDateTime to String
            details.put("timestamp", LocalDateTime.now().toString());

            try {
                details.put("aiService", Map.of(
                        "status", "UP",
                        "description", "AI Service for resume analysis"
                ));
            } catch (Exception e) {
                details.put("aiService", Map.of(
                        "status", "DOWN",
                        "error", e.getMessage()
                ));
                allServicesUp = false;
            }

            try {
                details.put("fileStorage", Map.of(
                        "status", "UP",
                        "description", "MinIO file storage service"
                ));
            } catch (Exception e) {
                details.put("fileStorage", Map.of(
                        "status", "DOWN",
                        "error", e.getMessage()
                ));
                allServicesUp = false;
            }

            try {
                details.put("emailService", Map.of(
                        "status", "UP",
                        "description", "Email notification service"
                ));
            } catch (Exception e) {
                details.put("emailService", Map.of(
                        "status", "DOWN",
                        "error", e.getMessage()
                ));
                allServicesUp = false;
            }

            return allServicesUp ? Health.up().withDetails(details).build()
                    : Health.down().withDetails(details).build();
        };
    }

//    @Bean("applicationMetricsHealth")
    public HealthIndicator applicationMetricsHealthIndicator() {
        return () -> {
            Map<String, Object> details = new HashMap<>();

            Runtime runtime = Runtime.getRuntime();
            long maxMemory = runtime.maxMemory();
            long totalMemory = runtime.totalMemory();
            long freeMemory = runtime.freeMemory();
            long usedMemory = totalMemory - freeMemory;

            details.put("memory", Map.of(
                    "max", formatBytes(maxMemory),
                    "total", formatBytes(totalMemory),
                    "used", formatBytes(usedMemory),
                    "free", formatBytes(freeMemory),
                    "usagePercentage", (usedMemory * 100) / maxMemory
            ));

            details.put("processors", runtime.availableProcessors());

            // FIX: Convert LocalDateTime to String
            details.put("timestamp", LocalDateTime.now().toString());

            long memoryUsagePercentage = (usedMemory * 100) / maxMemory;
            boolean healthy = memoryUsagePercentage < 90;

            details.put("status", healthy ? "HEALTHY" : "HIGH_MEMORY_USAGE");

            return healthy ? Health.up().withDetails(details).build()
                    : Health.down().withDetails(details).build();
        };
    }

    private String formatBytes(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.2f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format("%.2f MB", bytes / (1024.0 * 1024));
        return String.format("%.2f GB", bytes / (1024.0 * 1024 * 1024));
    }
}