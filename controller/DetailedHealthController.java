//package com.screening.interviews.controller;
//
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.boot.actuate.health.Health;
//import org.springframework.boot.actuate.health.HealthIndicator;
//import org.springframework.context.ApplicationContext;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.client.RestTemplate;
//import org.springframework.core.env.Environment;
//
//import java.time.LocalDateTime;
//import java.util.*;
//import java.util.concurrent.CompletableFuture;
//import java.util.concurrent.ExecutorService;
//import java.util.concurrent.Executors;
//
//@RestController
//@RequestMapping("/actuator")
//@RequiredArgsConstructor
//@Slf4j
//@CrossOrigin(origins = "*")
//public class DetailedHealthController {
//
//    private final ApplicationContext applicationContext;
//    private final Environment environment;
//    private final RestTemplate restTemplate = new RestTemplate();
//    private final ExecutorService executorService = Executors.newFixedThreadPool(10);
//
//    @GetMapping("/health")
//    public ResponseEntity<Map<String, Object>> getDetailedHealth() {
//        Map<String, Object> healthReport = new HashMap<>();
//
//        // Basic application info
//        healthReport.put("timestamp", LocalDateTime.now());
//        healthReport.put("application", "Screening Interviews API");
//        healthReport.put("version", getClass().getPackage().getImplementationVersion());
//        healthReport.put("profiles", Arrays.asList(environment.getActiveProfiles()));
//
//        // Get all health indicators
//        Map<String, HealthIndicator> healthIndicators = applicationContext.getBeansOfType(HealthIndicator.class);
//        Map<String, Object> componentsHealth = new HashMap<>();
//
//        boolean overallHealthy = true;
//
//        for (Map.Entry<String, HealthIndicator> entry : healthIndicators.entrySet()) {
//            try {
//                Health health = entry.getValue().health();
//                componentsHealth.put(entry.getKey(), Map.of(
//                        "status", health.getStatus().getCode(),
//                        "details", health.getDetails()
//                ));
//
//                if (!"UP".equals(health.getStatus().getCode())) {
//                    overallHealthy = false;
//                }
//            } catch (Exception e) {
//                componentsHealth.put(entry.getKey(), Map.of(
//                        "status", "DOWN",
//                        "error", e.getMessage()
//                ));
//                overallHealthy = false;
//            }
//        }
//
//        healthReport.put("status", overallHealthy ? "UP" : "DOWN");
//        healthReport.put("components", componentsHealth);
//        healthReport.put("endpoints", checkEndpointsHealth());
//
//        return ResponseEntity.ok(healthReport);
//    }
//
//    @GetMapping("/health/endpoints")
//    public ResponseEntity<Map<String, Object>> getEndpointsHealth() {
//        Map<String, Object> endpointsHealth = checkEndpointsHealth();
//        return ResponseEntity.ok(endpointsHealth);
//    }
//
//    @GetMapping("/health/detailed")
//    public ResponseEntity<Map<String, Object>> getComprehensiveHealth() {
//        Map<String, Object> detailedHealth = new HashMap<>();
//
//        // System metrics
//        Runtime runtime = Runtime.getRuntime();
//        Map<String, Object> systemMetrics = new HashMap<>();
//        systemMetrics.put("totalMemory", runtime.totalMemory());
//        systemMetrics.put("freeMemory", runtime.freeMemory());
//        systemMetrics.put("maxMemory", runtime.maxMemory());
//        systemMetrics.put("usedMemory", runtime.totalMemory() - runtime.freeMemory());
//        systemMetrics.put("availableProcessors", runtime.availableProcessors());
//
//        detailedHealth.put("systemMetrics", systemMetrics);
//        detailedHealth.put("basicHealth", getDetailedHealth().getBody());
//        detailedHealth.put("endpointTests", performEndpointTests());
//
//        return ResponseEntity.ok(detailedHealth);
//    }
//
//    private Map<String, Object> checkEndpointsHealth() {
//        Map<String, Object> endpointsStatus = new HashMap<>();
//
//        // Define all your endpoints to check
//        List<EndpointCheck> endpoints = Arrays.asList(
//                new EndpointCheck("Candidates", "/api/candidates", "GET"),
//                new EndpointCheck("Jobs", "/api/jobs", "GET"),
//                new EndpointCheck("Interviews", "/api/interviews", "GET"),
//                new EndpointCheck("Calls", "/api/calls", "GET"),
//                new EndpointCheck("Feedback", "/api/feedback", "GET"),
//                new EndpointCheck("OnboardingTasks", "/api/onboarding-tasks/statuses", "GET"),
//                new EndpointCheck("JobApplications", "/api/job-applications", "GET")
//        );
//
//        String baseUrl = "http://localhost:" + environment.getProperty("server.port", "8080");
//
//        for (EndpointCheck endpoint : endpoints) {
//            endpointsStatus.put(endpoint.getName(), checkSingleEndpoint(baseUrl + endpoint.getPath(), endpoint.getMethod()));
//        }
//
//        return endpointsStatus;
//    }
//
//    private Map<String, Object> checkSingleEndpoint(String url, String method) {
//        Map<String, Object> status = new HashMap<>();
//        try {
//            long startTime = System.currentTimeMillis();
//
//            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
//
//            long responseTime = System.currentTimeMillis() - startTime;
//
//            status.put("status", "UP");
//            status.put("httpStatus", response.getStatusCode().value());
//            status.put("responseTime", responseTime + "ms");
//            status.put("timestamp", LocalDateTime.now());
//
//        } catch (Exception e) {
//            status.put("status", "DOWN");
//            status.put("error", e.getMessage());
//            status.put("timestamp", LocalDateTime.now());
//        }
//
//        return status;
//    }
//
//    private Map<String, Object> performEndpointTests() {
//        Map<String, Object> tests = new HashMap<>();
//
//        // Create async tests for all endpoints
//        List<CompletableFuture<Map.Entry<String, Object>>> futures = new ArrayList<>();
//
//        String baseUrl = "http://localhost:" + environment.getProperty("server.port", "8080");
//
//        // Test critical endpoints with sample data
//        futures.add(CompletableFuture.supplyAsync(() ->
//                Map.entry("candidatesEndpoint", testCandidatesEndpoint(baseUrl)), executorService));
//
//        futures.add(CompletableFuture.supplyAsync(() ->
//                Map.entry("jobsEndpoint", testJobsEndpoint(baseUrl)), executorService));
//
//        futures.add(CompletableFuture.supplyAsync(() ->
//                Map.entry("interviewsEndpoint", testInterviewsEndpoint(baseUrl)), executorService));
//
//        // Wait for all tests to complete
//        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
//
//        // Collect results
//        for (CompletableFuture<Map.Entry<String, Object>> future : futures) {
//            try {
//                Map.Entry<String, Object> result = future.get();
//                tests.put(result.getKey(), result.getValue());
//            } catch (Exception e) {
//                log.error("Error in endpoint test", e);
//            }
//        }
//
//        return tests;
//    }
//
//    private Map<String, Object> testCandidatesEndpoint(String baseUrl) {
//        Map<String, Object> result = new HashMap<>();
//        try {
//            ResponseEntity<String> response = restTemplate.getForEntity(baseUrl + "/api/candidates", String.class);
//            result.put("status", "UP");
//            result.put("httpStatus", response.getStatusCode().value());
//            result.put("hasData", response.getBody() != null && !response.getBody().isEmpty());
//        } catch (Exception e) {
//            result.put("status", "DOWN");
//            result.put("error", e.getMessage());
//        }
//        return result;
//    }
//
//    private Map<String, Object> testJobsEndpoint(String baseUrl) {
//        Map<String, Object> result = new HashMap<>();
//        try {
//            ResponseEntity<String> response = restTemplate.getForEntity(baseUrl + "/api/jobs", String.class);
//            result.put("status", "UP");
//            result.put("httpStatus", response.getStatusCode().value());
//            result.put("hasData", response.getBody() != null && !response.getBody().isEmpty());
//        } catch (Exception e) {
//            result.put("status", "DOWN");
//            result.put("error", e.getMessage());
//        }
//        return result;
//    }
//
//    private Map<String, Object> testInterviewsEndpoint(String baseUrl) {
//        Map<String, Object> result = new HashMap<>();
//        try {
//            ResponseEntity<String> response = restTemplate.getForEntity(baseUrl + "/api/interviews", String.class);
//            result.put("status", "UP");
//            result.put("httpStatus", response.getStatusCode().value());
//            result.put("hasData", response.getBody() != null && !response.getBody().isEmpty());
//        } catch (Exception e) {
//            result.put("status", "DOWN");
//            result.put("error", e.getMessage());
//        }
//        return result;
//    }
//
//    // Inner class for endpoint definition
//    private static class EndpointCheck {
//        private final String name;
//        private final String path;
//        private final String method;
//
//        public EndpointCheck(String name, String path, String method) {
//            this.name = name;
//            this.path = path;
//            this.method = method;
//        }
//
//        public String getName() { return name; }
//        public String getPath() { return path; }
//        public String getMethod() { return method; }
//    }
//}