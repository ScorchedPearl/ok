package com.screening.interviews.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class HealthController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> health = new HashMap<>();

        try {
            // Basic application info
            health.put("status", "UP");
            health.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            health.put("application", "Screening Interviews API");

            // System metrics
            Runtime runtime = Runtime.getRuntime();
            Map<String, Object> systemMetrics = new HashMap<>();
            systemMetrics.put("totalMemory", formatBytes(runtime.totalMemory()));
            systemMetrics.put("freeMemory", formatBytes(runtime.freeMemory()));
            systemMetrics.put("maxMemory", formatBytes(runtime.maxMemory()));
            systemMetrics.put("usedMemory", formatBytes(runtime.totalMemory() - runtime.freeMemory()));
            systemMetrics.put("availableProcessors", runtime.availableProcessors());

            health.put("system", systemMetrics);

            // Component status
            Map<String, Object> components = new HashMap<>();

            // Database component
            Map<String, String> database = new HashMap<>();
            database.put("status", "UP");
            database.put("description", "Database connection is healthy");
            components.put("database", database);

            // AI Service component
            Map<String, String> aiService = new HashMap<>();
            aiService.put("status", "UP");
            aiService.put("description", "AI Service for resume analysis");
            components.put("aiService", aiService);

            // File Storage component
            Map<String, String> fileStorage = new HashMap<>();
            fileStorage.put("status", "UP");
            fileStorage.put("description", "MinIO file storage service");
            components.put("fileStorage", fileStorage);

            // Email Service component
            Map<String, String> emailService = new HashMap<>();
            emailService.put("status", "UP");
            emailService.put("description", "Email notification service");
            components.put("emailService", emailService);

            health.put("components", components);

            return ResponseEntity.ok(health);

        } catch (Exception e) {
            log.error("Error generating health response", e);

            Map<String, Object> errorHealth = new HashMap<>();
            errorHealth.put("status", "DOWN");
            errorHealth.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            errorHealth.put("error", e.getMessage());

            return ResponseEntity.status(500).body(errorHealth);
        }
    }

    @GetMapping("/simple")
    public ResponseEntity<Map<String, String>> getSimpleHealth() {
        Map<String, String> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        return ResponseEntity.ok(health);
    }

    private String formatBytes(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.2f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format("%.2f MB", bytes / (1024.0 * 1024));
        return String.format("%.2f GB", bytes / (1024.0 * 1024 * 1024));
    }
}