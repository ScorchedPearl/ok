package com.screening.billing.controller;

import com.screening.billing.dto.request.CreatePlanRequest;
import com.screening.billing.dto.response.ApiResponse;
import com.screening.billing.entity.Plan;
import com.screening.billing.enums.BillingCycle;
import com.screening.billing.service.PlanService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/billing/plans")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PlanController {

    private static final Logger logger = LoggerFactory.getLogger(PlanController.class);

    @Autowired
    private PlanService planService;

    /**
     * Create a new plan
     */
    @PostMapping
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<ApiResponse<Plan>> createPlan(@Valid @RequestBody CreatePlanRequest request) {
        logger.info("Creating new plan: {}", request.getPlanId());

        try {
            Plan plan = planService.createPlan(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Plan created successfully", plan));
        } catch (IllegalArgumentException e) {
            logger.warn("Failed to create plan: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.badRequest(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error creating plan: {}", request.getPlanId(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.internalError("Error creating plan: " + e.getMessage()));
        }
    }

    /**
     * Update an existing plan
     */
    @PutMapping("/{planId}")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<ApiResponse<Plan>> updatePlan(
            @PathVariable String planId,
            @Valid @RequestBody CreatePlanRequest request) {
        
        logger.info("Updating plan: {}", planId);

        try {
            Plan plan = planService.updatePlan(planId, request);
            return ResponseEntity.ok(ApiResponse.success("Plan updated successfully", plan));
        } catch (IllegalArgumentException e) {
            logger.warn("Failed to update plan {}: {}", planId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.notFound(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error updating plan: {}", planId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.internalError("Error updating plan: " + e.getMessage()));
        }
    }

    /**
     * Get plan by ID
     */
    @GetMapping("/{planId}")
    public ResponseEntity<ApiResponse<Plan>> getPlanById(@PathVariable String planId) {
        logger.debug("Fetching plan: {}", planId);

        try {
            Optional<Plan> plan = planService.getPlanById(planId);
            if (plan.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success("Plan retrieved successfully", plan.get()));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.notFound("Plan not found: " + planId));
            }
        } catch (Exception e) {
            logger.error("Error fetching plan: {}", planId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.internalError("Error fetching plan: " + e.getMessage()));
        }
    }

    /**
     * Get all active plans
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Plan>>> getAllActivePlans() {
        logger.debug("Fetching all active plans");

        try {
            List<Plan> plans = planService.getAllActivePlans();
            return ResponseEntity.ok(ApiResponse.success("Active plans retrieved successfully", plans));
        } catch (Exception e) {
            logger.error("Error fetching active plans", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.internalError("Error fetching plans: " + e.getMessage()));
        }
    }

    /**
     * Get all plans (including inactive)
     */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<Plan>>> getAllPlans() {
        logger.debug("Fetching all plans");

        try {
            List<Plan> plans = planService.getAllPlans();
            return ResponseEntity.ok(ApiResponse.success("All plans retrieved successfully", plans));
        } catch (Exception e) {
            logger.error("Error fetching all plans", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.internalError("Error fetching plans: " + e.getMessage()));
        }
    }

    /**
     * Get plans by billing cycle
     */
    @GetMapping("/billing-cycle/{billingCycle}")
    public ResponseEntity<ApiResponse<List<Plan>>> getPlansByBillingCycle(
            @PathVariable BillingCycle billingCycle) {
        
        logger.debug("Fetching plans for billing cycle: {}", billingCycle);

        try {
            List<Plan> plans = planService.getPlansByBillingCycle(billingCycle);
            return ResponseEntity.ok(ApiResponse.success(
                "Plans for " + billingCycle + " retrieved successfully", plans));
        } catch (Exception e) {
            logger.error("Error fetching plans for billing cycle: {}", billingCycle, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.internalError("Error fetching plans: " + e.getMessage()));
        }
    }

    /**
     * Get plans within price range
     */
    @GetMapping("/price-range")
    public ResponseEntity<ApiResponse<List<Plan>>> getPlansByPriceRange(
            @RequestParam BigDecimal minPrice,
            @RequestParam BigDecimal maxPrice) {
        
        logger.debug("Fetching plans for price range: {} - {}", minPrice, maxPrice);

        try {
            List<Plan> plans = planService.getPlansByPriceRange(minPrice, maxPrice);
            return ResponseEntity.ok(ApiResponse.success(
                "Plans in price range retrieved successfully", plans));
        } catch (Exception e) {
            logger.error("Error fetching plans for price range: {} - {}", minPrice, maxPrice, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.internalError("Error fetching plans: " + e.getMessage()));
        }
    }

    /**
     * Get unlimited plans
     */
    @GetMapping("/unlimited")
    public ResponseEntity<ApiResponse<List<Plan>>> getUnlimitedPlans() {
        logger.debug("Fetching unlimited plans");

        try {
            List<Plan> plans = planService.getUnlimitedPlans();
            return ResponseEntity.ok(ApiResponse.success("Unlimited plans retrieved successfully", plans));
        } catch (Exception e) {
            logger.error("Error fetching unlimited plans", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.internalError("Error fetching plans: " + e.getMessage()));
        }
    }

    /**
     * Find suitable plans for usage requirements
     */
    @GetMapping("/suitable")
    public ResponseEntity<ApiResponse<List<Plan>>> findSuitablePlans(
            @RequestParam(required = false) Integer callsRequired,
            @RequestParam(required = false) Integer testsRequired) {
        
        logger.debug("Finding suitable plans for calls: {}, tests: {}", callsRequired, testsRequired);

        try {
            List<Plan> plans = planService.findPlansForUsage(
                callsRequired != null ? callsRequired : 0,
                testsRequired != null ? testsRequired : 0
            );
            return ResponseEntity.ok(ApiResponse.success("Suitable plans retrieved successfully", plans));
        } catch (Exception e) {
            logger.error("Error finding suitable plans", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.internalError("Error finding plans: " + e.getMessage()));
        }
    }

    /**
     * Get plans by feature
     */
    @GetMapping("/feature/{featureKey}")
    public ResponseEntity<ApiResponse<List<Plan>>> getPlansByFeature(@PathVariable String featureKey) {
        logger.debug("Fetching plans with feature: {}", featureKey);

        try {
            List<Plan> plans = planService.getPlansByFeature(featureKey);
            return ResponseEntity.ok(ApiResponse.success(
                "Plans with feature '" + featureKey + "' retrieved successfully", plans));
        } catch (Exception e) {
            logger.error("Error fetching plans with feature: {}", featureKey, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.internalError("Error fetching plans: " + e.getMessage()));
        }
    }

    /**
     * Activate a plan
     */
    @PutMapping("/{planId}/activate")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<ApiResponse<Plan>> activatePlan(@PathVariable String planId) {
        logger.info("Activating plan: {}", planId);

        try {
            Plan plan = planService.activatePlan(planId);
            return ResponseEntity.ok(ApiResponse.success("Plan activated successfully", plan));
        } catch (IllegalArgumentException e) {
            logger.warn("Failed to activate plan {}: {}", planId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.notFound(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error activating plan: {}", planId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.internalError("Error activating plan: " + e.getMessage()));
        }
    }

    /**
     * Deactivate a plan
     */
    @PutMapping("/{planId}/deactivate")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<ApiResponse<Plan>> deactivatePlan(@PathVariable String planId) {
        logger.info("Deactivating plan: {}", planId);

        try {
            Plan plan = planService.deactivatePlan(planId);
            return ResponseEntity.ok(ApiResponse.success("Plan deactivated successfully", plan));
        } catch (IllegalArgumentException e) {
            logger.warn("Failed to deactivate plan {}: {}", planId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.notFound(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error deactivating plan: {}", planId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.internalError("Error deactivating plan: " + e.getMessage()));
        }
    }

    /**
     * Delete a plan
     */
    @DeleteMapping("/{planId}")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePlan(@PathVariable String planId) {
        logger.info("Deleting plan: {}", planId);

        try {
            planService.deletePlan(planId);
            return ResponseEntity.ok(ApiResponse.success("Plan deleted successfully"));
        } catch (IllegalArgumentException e) {
            logger.warn("Failed to delete plan {}: {}", planId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.notFound(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error deleting plan: {}", planId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.internalError("Error deleting plan: " + e.getMessage()));
        }
    }

    /**
     * Check if plan is active
     */
    @GetMapping("/{planId}/active")
    public ResponseEntity<ApiResponse<Boolean>> isPlanActive(@PathVariable String planId) {
        logger.debug("Checking if plan is active: {}", planId);

        try {
            boolean isActive = planService.isPlanActive(planId);
            return ResponseEntity.ok(ApiResponse.success("Plan status checked", isActive));
        } catch (Exception e) {
            logger.error("Error checking plan status: {}", planId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.internalError("Error checking plan status: " + e.getMessage()));
        }
    }

    /**
     * Get total count of active plans
     */
    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> getActivePlansCount() {
        logger.debug("Getting active plans count");

        try {
            long count = planService.getActivePlansCount();
            return ResponseEntity.ok(ApiResponse.success("Active plans count retrieved", count));
        } catch (Exception e) {
            logger.error("Error getting active plans count", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.internalError("Error getting plans count: " + e.getMessage()));
        }
    }
} 