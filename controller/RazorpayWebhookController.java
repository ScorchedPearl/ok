package com.screening.billing.controller;

import com.screening.billing.dto.response.ApiResponse;
import com.screening.billing.service.RazorpayService;
import com.screening.billing.service.UserSubscriptionService;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/billing/webhook")
@Slf4j
public class RazorpayWebhookController {

    @Autowired
    private RazorpayService razorpayService;

    @Autowired
    private UserSubscriptionService userSubscriptionService;

    /**
     * Handle Razorpay webhooks
     * Configure this URL in Razorpay Dashboard: https://yourdomain.com/api/billing/webhook/razorpay
     */
    @PostMapping("/razorpay")
    public ResponseEntity<ApiResponse<String>> handleRazorpayWebhook(
            @RequestBody String webhookBody,
            @RequestHeader("X-Razorpay-Signature") String signature) {

        log.info("Received Razorpay webhook with signature: {}", signature);

        try {
            // Verify webhook signature
            boolean isSignatureValid = razorpayService.verifyWebhookSignature(webhookBody, signature);
            
            if (!isSignatureValid) {
                log.error("Invalid webhook signature received");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid signature"));
            }

            // Parse webhook payload
            JSONObject webhookData = new JSONObject(webhookBody);
            String event = webhookData.getString("event");
            JSONObject payload = webhookData.getJSONObject("payload");

            log.info("Processing webhook event: {}", event);

            // Handle different webhook events
            switch (event) {
                case "payment_link.paid":
                    handlePaymentLinkPaid(payload);
                    break;
                    
                case "payment.captured":
                    handlePaymentCaptured(payload);
                    break;
                    
                case "payment.failed":
                    handlePaymentFailed(payload);
                    break;
                    
                case "payment_link.cancelled":
                    handlePaymentLinkCancelled(payload);
                    break;
                    
                case "payment_link.expired":
                    handlePaymentLinkExpired(payload);
                    break;
                    
                default:
                    log.info("Unhandled webhook event: {}", event);
                    break;
            }

            return ResponseEntity.ok(ApiResponse.success("Webhook processed successfully"));

        } catch (Exception e) {
            log.error("Error processing Razorpay webhook", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.internalError("Webhook processing failed"));
        }
    }

    /**
     * Handle payment link paid event
     */
    private void handlePaymentLinkPaid(JSONObject payload) {
        try {
            JSONObject paymentLinkEntity = payload.getJSONObject("payment_link").getJSONObject("entity");
            JSONObject paymentEntity = payload.getJSONObject("payment").getJSONObject("entity");

            String paymentLinkId = paymentLinkEntity.getString("id");
            String paymentId = paymentEntity.getString("id");
            JSONObject notes = paymentLinkEntity.getJSONObject("notes");
            
            String tenantId = notes.getString("tenant_id");
            String planId = notes.getString("plan_id");
            String upgradeId = notes.getString("upgrade_id");

            log.info("Payment link paid - PaymentLinkID: {}, PaymentID: {}, TenantID: {}, PlanID: {}", 
                    paymentLinkId, paymentId, tenantId, planId);

            // Complete the upgrade
            userSubscriptionService.completePlanUpgrade(tenantId, planId, paymentId);

            log.info("Successfully completed upgrade for tenant: {} to plan: {}", tenantId, planId);

        } catch (Exception e) {
            log.error("Error handling payment_link.paid webhook", e);
        }
    }

    /**
     * Handle payment captured event
     */
    private void handlePaymentCaptured(JSONObject payload) {
        try {
            JSONObject paymentEntity = payload.getJSONObject("payment").getJSONObject("entity");
            String paymentId = paymentEntity.getString("id");
            
            log.info("Payment captured successfully: {}", paymentId);
            
            // Additional processing if needed
            // This is usually handled by payment_link.paid event
            
        } catch (Exception e) {
            log.error("Error handling payment.captured webhook", e);
        }
    }

    /**
     * Handle payment failed event
     */
    private void handlePaymentFailed(JSONObject payload) {
        try {
            JSONObject paymentEntity = payload.getJSONObject("payment").getJSONObject("entity");
            String paymentId = paymentEntity.getString("id");
            String errorCode = paymentEntity.optString("error_code", "UNKNOWN");
            String errorDescription = paymentEntity.optString("error_description", "Payment failed");

            log.warn("Payment failed - PaymentID: {}, Error: {} - {}", paymentId, errorCode, errorDescription);

            // Extract upgrade details from payment notes if available
            if (paymentEntity.has("notes")) {
                JSONObject notes = paymentEntity.getJSONObject("notes");
                if (notes.has("tenant_id") && notes.has("plan_id") && notes.has("upgrade_id")) {
                    String tenantId = notes.getString("tenant_id");
                    String planId = notes.getString("plan_id");
                    String upgradeId = notes.getString("upgrade_id");

                    // Handle upgrade failure
                    userSubscriptionService.handleUpgradeFailure(tenantId, planId, errorDescription);
                    
                    log.info("Handled upgrade failure for tenant: {} to plan: {}", tenantId, planId);
                }
            }

        } catch (Exception e) {
            log.error("Error handling payment.failed webhook", e);
        }
    }

    /**
     * Handle payment link cancelled event
     */
    private void handlePaymentLinkCancelled(JSONObject payload) {
        try {
            JSONObject paymentLinkEntity = payload.getJSONObject("payment_link").getJSONObject("entity");
            String paymentLinkId = paymentLinkEntity.getString("id");
            JSONObject notes = paymentLinkEntity.getJSONObject("notes");
            
            String tenantId = notes.getString("tenant_id");
            String planId = notes.getString("plan_id");
            String upgradeId = notes.getString("upgrade_id");

            log.info("Payment link cancelled - PaymentLinkID: {}, TenantID: {}, PlanID: {}", 
                    paymentLinkId, tenantId, planId);

            // Handle upgrade cancellation
            userSubscriptionService.handleUpgradeFailure(tenantId, planId, "Payment cancelled by user");

        } catch (Exception e) {
            log.error("Error handling payment_link.cancelled webhook", e);
        }
    }

    /**
     * Handle payment link expired event
     */
    private void handlePaymentLinkExpired(JSONObject payload) {
        try {
            JSONObject paymentLinkEntity = payload.getJSONObject("payment_link").getJSONObject("entity");
            String paymentLinkId = paymentLinkEntity.getString("id");
            JSONObject notes = paymentLinkEntity.getJSONObject("notes");
            
            String tenantId = notes.getString("tenant_id");
            String planId = notes.getString("plan_id");
            String upgradeId = notes.getString("upgrade_id");

            log.info("Payment link expired - PaymentLinkID: {}, TenantID: {}, PlanID: {}", 
                    paymentLinkId, tenantId, planId);

            // Handle upgrade expiration
            userSubscriptionService.handleUpgradeFailure(tenantId, planId, "Payment link expired");

        } catch (Exception e) {
            log.error("Error handling payment_link.expired webhook", e);
        }
    }

    /**
     * Test webhook endpoint for development
     */
    @PostMapping("/test")
    public ResponseEntity<ApiResponse<String>> testWebhook(@RequestBody String body) {
        log.info("Test webhook received: {}", body);
        return ResponseEntity.ok(ApiResponse.success("Test webhook received"));
    }
} 