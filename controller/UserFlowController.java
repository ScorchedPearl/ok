package com.screening.billing.controller;

import com.screening.billing.dto.request.CreatePaymentLinkRequest;
import com.screening.billing.dto.response.ApiResponse;
import com.screening.billing.dto.response.PaymentLinkResponse;
import com.screening.billing.entity.Plan;
import com.screening.billing.entity.Subscription;
import com.screening.billing.service.RazorpayService;
import com.screening.billing.service.UserSubscriptionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/billing/user")
@CrossOrigin(origins = "*", maxAge = 3600)
@Slf4j
public class UserFlowController {

    @Autowired
    private UserSubscriptionService userSubscriptionService;

    @Autowired
    private RazorpayService razorpayService;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    /**
     * Step 1: Get all available plans for home page display
     * This is the first API call when user visits home page
     */
    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<Plan>>> getAvailablePlans() {
        log.info("Fetching all available plans for home page");

        try {
            List<Plan> plans = userSubscriptionService.getAllAvailablePlans();
            return ResponseEntity.ok(ApiResponse.success("Available plans retrieved successfully", plans));
        } catch (Exception e) {
            log.error("Error fetching available plans", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.internalError("Error fetching plans: " + e.getMessage()));
        }
    }

    /**
     * Step 2: Get user's current subscription status
     * This is called after user login to show current plan
     */
    @GetMapping("/subscription/{tenantId}")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<ApiResponse<SubscriptionInfo>> getCurrentSubscription(@PathVariable String tenantId) {
        log.info("Fetching current subscription for tenant: {}", tenantId);

        try {
            Optional<Subscription> subscription = userSubscriptionService.getCurrentSubscription(tenantId);
            
            SubscriptionInfo info = new SubscriptionInfo();
            info.setTenantId(tenantId);
            info.setHasActiveSubscription(subscription.isPresent());
            
            if (subscription.isPresent()) {
                Subscription sub = subscription.get();
                info.setSubscription(sub);
                info.setCurrentPlanId(sub.getPlanId());
                info.setSubscriptionStatus(sub.getStatus().name());
                info.setEndDate(sub.getEndDate());
                info.setAutoRenew(sub.getAutoRenew());
            } else {
                info.setCurrentPlanId("NONE");
                info.setSubscriptionStatus("NO_SUBSCRIPTION");
            }

            return ResponseEntity.ok(ApiResponse.success("Subscription info retrieved", info));
        } catch (Exception e) {
            log.error("Error fetching subscription for tenant: {}", tenantId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.internalError("Error fetching subscription: " + e.getMessage()));
        }
    }

    /**
     * Step 3: Assign free plan to new user
     * This is called during user registration
     */
    @PostMapping("/register/{tenantId}")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<ApiResponse<Subscription>> registerNewUser(@PathVariable String tenantId) {
        log.info("Registering new user and assigning free plan: {}", tenantId);

        try {
            Subscription subscription = userSubscriptionService.assignFreePlanToNewUser(tenantId);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Free plan assigned successfully", subscription));
        } catch (Exception e) {
            log.error("Error registering new user: {}", tenantId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.internalError("Error registering user: " + e.getMessage()));
        }
    }

    /**
     * Step 4: Check if user can upgrade to a specific plan
     * This is called when user selects a plan to upgrade
     */
    @GetMapping("/can-upgrade/{tenantId}/{planId}")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<ApiResponse<UpgradeEligibility>> checkUpgradeEligibility(
            @PathVariable String tenantId, 
            @PathVariable String planId) {
        
        log.info("Checking upgrade eligibility for tenant: {} to plan: {}", tenantId, planId);

        try {
            boolean canUpgrade = userSubscriptionService.canUpgradeToPlan(tenantId, planId);
            
            UpgradeEligibility eligibility = new UpgradeEligibility();
            eligibility.setTenantId(tenantId);
            eligibility.setTargetPlanId(planId);
            eligibility.setCanUpgrade(canUpgrade);
            eligibility.setReason(canUpgrade ? "Upgrade allowed" : "Upgrade not allowed");

            return ResponseEntity.ok(ApiResponse.success("Upgrade eligibility checked", eligibility));
        } catch (Exception e) {
            log.error("Error checking upgrade eligibility for tenant: {} plan: {}", tenantId, planId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.internalError("Error checking eligibility: " + e.getMessage()));
        }
    }

    /**
     * Step 5: Initiate plan upgrade (prepare for payment)
     * This creates the upgrade session and returns payment link
     */
    @PostMapping("/upgrade/{tenantId}/{planId}")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<ApiResponse<PaymentInitiationResponse>> initiateUpgrade(
            @PathVariable String tenantId, 
            @PathVariable String planId,
            @RequestBody UpgradeInitiationRequest request) {
        
        log.info("Initiating upgrade for tenant: {} to plan: {}", tenantId, planId);

        try {
            UserSubscriptionService.UpgradeResult upgradeResult = userSubscriptionService.initiatePlanUpgrade(tenantId, planId);
            
            // Create payment link
            PaymentLinkResponse paymentLink = createPaymentLink(upgradeResult, request);
            
            PaymentInitiationResponse response = new PaymentInitiationResponse();
            response.setUpgradeResult(upgradeResult);
            response.setPaymentLink(paymentLink);
            
            return ResponseEntity.ok(ApiResponse.success("Upgrade initiated successfully", response));
        } catch (IllegalArgumentException e) {
            log.warn("Invalid upgrade request for tenant: {} plan: {} - {}", tenantId, planId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.badRequest(e.getMessage()));
        } catch (Exception e) {
            log.error("Error initiating upgrade for tenant: {} plan: {}", tenantId, planId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.internalError("Error initiating upgrade: " + e.getMessage()));
        }
    }

    /**
     * Step 6: Complete upgrade after successful payment
     * This is called from payment success callback
     */
    @PostMapping("/upgrade/complete")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<ApiResponse<Subscription>> completeUpgrade(
            @RequestBody UpgradeCompletionRequest request) {
        
        log.info("Completing upgrade for tenant: {} to plan: {} with payment: {}", 
                request.getTenantId(), request.getPlanId(), request.getPaymentId());

        try {
            Subscription subscription = userSubscriptionService.completePlanUpgrade(
                request.getTenantId(), 
                request.getPlanId(), 
                request.getPaymentId()
            );
            
            return ResponseEntity.ok(ApiResponse.success("Upgrade completed successfully", subscription));
        } catch (Exception e) {
            log.error("Error completing upgrade for tenant: {} plan: {}", 
                     request.getTenantId(), request.getPlanId(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.internalError("Error completing upgrade: " + e.getMessage()));
        }
    }

    /**
     * Step 7: Handle upgrade failure
     * This is called from payment failure callback
     */
    @PostMapping("/upgrade/failure")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<ApiResponse<String>> handleUpgradeFailure(
            @RequestBody UpgradeFailureRequest request) {
        
        log.warn("Handling upgrade failure for tenant: {} to plan: {} - Reason: {}", 
                request.getTenantId(), request.getPlanId(), request.getFailureReason());

        try {
            userSubscriptionService.handleUpgradeFailure(
                request.getTenantId(), 
                request.getPlanId(), 
                request.getFailureReason()
            );
            
            return ResponseEntity.ok(ApiResponse.success("Upgrade failure handled"));
        } catch (Exception e) {
            log.error("Error handling upgrade failure for tenant: {}", request.getTenantId(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.internalError("Error handling failure: " + e.getMessage()));
        }
    }

    // DTOs for API requests/responses

    public static class SubscriptionInfo {
        private String tenantId;
        private boolean hasActiveSubscription;
        private String currentPlanId;
        private String subscriptionStatus;
        private Subscription subscription;
        private java.time.LocalDate endDate;
        private Boolean autoRenew;

        // Getters and setters
        public String getTenantId() { return tenantId; }
        public void setTenantId(String tenantId) { this.tenantId = tenantId; }

        public boolean isHasActiveSubscription() { return hasActiveSubscription; }
        public void setHasActiveSubscription(boolean hasActiveSubscription) { this.hasActiveSubscription = hasActiveSubscription; }

        public String getCurrentPlanId() { return currentPlanId; }
        public void setCurrentPlanId(String currentPlanId) { this.currentPlanId = currentPlanId; }

        public String getSubscriptionStatus() { return subscriptionStatus; }
        public void setSubscriptionStatus(String subscriptionStatus) { this.subscriptionStatus = subscriptionStatus; }

        public Subscription getSubscription() { return subscription; }
        public void setSubscription(Subscription subscription) { this.subscription = subscription; }

        public java.time.LocalDate getEndDate() { return endDate; }
        public void setEndDate(java.time.LocalDate endDate) { this.endDate = endDate; }

        public Boolean getAutoRenew() { return autoRenew; }
        public void setAutoRenew(Boolean autoRenew) { this.autoRenew = autoRenew; }
    }

    public static class UpgradeEligibility {
        private String tenantId;
        private String targetPlanId;
        private boolean canUpgrade;
        private String reason;

        // Getters and setters
        public String getTenantId() { return tenantId; }
        public void setTenantId(String tenantId) { this.tenantId = tenantId; }

        public String getTargetPlanId() { return targetPlanId; }
        public void setTargetPlanId(String targetPlanId) { this.targetPlanId = targetPlanId; }

        public boolean isCanUpgrade() { return canUpgrade; }
        public void setCanUpgrade(boolean canUpgrade) { this.canUpgrade = canUpgrade; }

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class UpgradeCompletionRequest {
        private String tenantId;
        private String planId;
        private String paymentId;
        private String upgradeId;

        // Getters and setters
        public String getTenantId() { return tenantId; }
        public void setTenantId(String tenantId) { this.tenantId = tenantId; }

        public String getPlanId() { return planId; }
        public void setPlanId(String planId) { this.planId = planId; }

        public String getPaymentId() { return paymentId; }
        public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

        public String getUpgradeId() { return upgradeId; }
        public void setUpgradeId(String upgradeId) { this.upgradeId = upgradeId; }
    }

    public static class UpgradeFailureRequest {
        private String tenantId;
        private String planId;
        private String upgradeId;
        private String failureReason;

        // Getters and setters
        public String getTenantId() { return tenantId; }
        public void setTenantId(String tenantId) { this.tenantId = tenantId; }

        public String getPlanId() { return planId; }
        public void setPlanId(String planId) { this.planId = planId; }

        public String getUpgradeId() { return upgradeId; }
        public void setUpgradeId(String upgradeId) { this.upgradeId = upgradeId; }

        public String getFailureReason() { return failureReason; }
        public void setFailureReason(String failureReason) { this.failureReason = failureReason; }
    }

    public static class UpgradeInitiationRequest {
        private String customerName;
        private String customerEmail;
        private String customerPhone;

        // Getters and setters
        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }

        public String getCustomerEmail() { return customerEmail; }
        public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

        public String getCustomerPhone() { return customerPhone; }
        public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    }

    public static class PaymentInitiationResponse {
        private UserSubscriptionService.UpgradeResult upgradeResult;
        private PaymentLinkResponse paymentLink;

        // Getters and setters
        public UserSubscriptionService.UpgradeResult getUpgradeResult() { return upgradeResult; }
        public void setUpgradeResult(UserSubscriptionService.UpgradeResult upgradeResult) { this.upgradeResult = upgradeResult; }

        public PaymentLinkResponse getPaymentLink() { return paymentLink; }
        public void setPaymentLink(PaymentLinkResponse paymentLink) { this.paymentLink = paymentLink; }
    }

    /**
     * Helper method to create payment link
     */
    private PaymentLinkResponse createPaymentLink(UserSubscriptionService.UpgradeResult upgradeResult, 
                                                UpgradeInitiationRequest request) {
        CreatePaymentLinkRequest paymentLinkRequest = new CreatePaymentLinkRequest();
        paymentLinkRequest.setTenantId(upgradeResult.getTenantId());
        paymentLinkRequest.setPlanId(upgradeResult.getTargetPlan().getPlanId());
        paymentLinkRequest.setPlanName(upgradeResult.getTargetPlan().getPlanName());
        paymentLinkRequest.setUpgradeId(upgradeResult.getUpgradeId());
        paymentLinkRequest.setAmount(upgradeResult.getAmount());
        paymentLinkRequest.setCustomerName(request.getCustomerName());
        paymentLinkRequest.setCustomerEmail(request.getCustomerEmail());
        paymentLinkRequest.setCustomerPhone(request.getCustomerPhone());
        paymentLinkRequest.setCallbackUrl(frontendUrl + "/upgrade/callback");
        paymentLinkRequest.setDescription("Upgrade to " + upgradeResult.getTargetPlan().getPlanName());

        return razorpayService.createPaymentLink(paymentLinkRequest);
    }
} 