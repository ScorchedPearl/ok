package com.screening.billing.controller;

import com.screening.billing.dto.request.UsageValidationRequest;
import com.screening.billing.dto.response.ApiResponse;
import com.screening.billing.dto.response.UsageValidationResponse;
import com.screening.billing.enums.ServiceName;
import com.screening.billing.service.UsageValidationService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/billing/usage")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UsageValidationController {

    private static final Logger logger = LoggerFactory.getLogger(UsageValidationController.class);

    @Autowired
    private UsageValidationService usageValidationService;

    /**
     * Validate usage and track consumption
     * This is the main endpoint that other services will call
     */
    @PostMapping("/validate")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<ApiResponse<UsageValidationResponse>> validateUsage(
            @Valid @RequestBody UsageValidationRequest request) {
        
        logger.info("Usage validation request from tenant: {} for service: {}", 
                   request.getTenantId(), request.getServiceName());

        try {
            UsageValidationResponse response = usageValidationService.validateAndTrackUsage(request);
            
            if (response.getAllowed()) {
                logger.debug("Usage allowed for tenant: {} service: {}", 
                           request.getTenantId(), request.getServiceName());
                return ResponseEntity.ok(ApiResponse.success("Usage validated successfully", response));
            } else {
                logger.warn("Usage denied for tenant: {} service: {} reason: {}", 
                           request.getTenantId(), request.getServiceName(), response.getReason());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Usage not allowed: " + response.getReason(), "USAGE_DENIED", response));
            }
        } catch (Exception e) {
            logger.error("Error validating usage for tenant: {} service: {}", 
                        request.getTenantId(), request.getServiceName(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.internalError("Error validating usage: " + e.getMessage()));
        }
    }

    /**
     * Check quota status without incrementing usage
     */
    @GetMapping("/quota/{tenantId}/{serviceName}")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<ApiResponse<UsageValidationResponse>> getQuotaStatus(
            @PathVariable String tenantId,
            @PathVariable ServiceName serviceName) {
        
        logger.debug("Quota status request for tenant: {} service: {}", tenantId, serviceName);

        try {
            UsageValidationResponse response = usageValidationService.getQuotaStatus(tenantId, serviceName);
            return ResponseEntity.ok(ApiResponse.success("Quota status retrieved", response));
        } catch (Exception e) {
            logger.error("Error getting quota status for tenant: {} service: {}", tenantId, serviceName, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.internalError("Error retrieving quota status: " + e.getMessage()));
        }
    }

    /**
     * Check if tenant has access to a specific feature
     */
    @GetMapping("/feature/{tenantId}/{featureKey}")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<ApiResponse<UsageValidationResponse>> checkFeatureAccess(
            @PathVariable String tenantId,
            @PathVariable String featureKey) {
        
        logger.debug("Feature access check for tenant: {} feature: {}", tenantId, featureKey);

        try {
            UsageValidationResponse response = usageValidationService.checkFeatureAccess(tenantId, featureKey);
            return ResponseEntity.ok(ApiResponse.success("Feature access checked", response));
        } catch (Exception e) {
            logger.error("Error checking feature access for tenant: {} feature: {}", tenantId, featureKey, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.internalError("Error checking feature access: " + e.getMessage()));
        }
    }

    /**
     * Bulk validate usage for multiple services
     */
    @PostMapping("/validate/bulk")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<ApiResponse<UsageValidationResponse[]>> validateBulkUsage(
            @Valid @RequestBody UsageValidationRequest[] requests) {
        
        logger.info("Bulk usage validation request with {} items", requests.length);

        try {
            UsageValidationResponse[] responses = new UsageValidationResponse[requests.length];
            
            for (int i = 0; i < requests.length; i++) {
                responses[i] = usageValidationService.validateAndTrackUsage(requests[i]);
            }
            
            return ResponseEntity.ok(ApiResponse.success("Bulk usage validated", responses));
        } catch (Exception e) {
            logger.error("Error in bulk usage validation", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.internalError("Error in bulk validation: " + e.getMessage()));
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        return ResponseEntity.ok(ApiResponse.success("Usage validation service is healthy"));
    }

    /**
     * Get all available service names
     */
    @GetMapping("/services")
    public ResponseEntity<ApiResponse<ServiceName[]>> getAvailableServices() {
        return ResponseEntity.ok(ApiResponse.success("Available services", ServiceName.values()));
    }
} 