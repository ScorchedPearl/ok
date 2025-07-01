package com.screening.billing.dto.response;

import com.screening.billing.enums.ServiceName;

public class UsageValidationResponse {

    private String tenantId;
    private ServiceName serviceName;
    private Boolean allowed;
    private String reason;
    
    // Quota information
    private Integer currentUsage;
    private Integer allowedUsage;
    private Integer remainingUsage;
    private Boolean isUnlimited;
    
    // Subscription information
    private String subscriptionId;
    private String planId;
    private String planName;
    private Boolean hasFeature;
    
    // Additional info
    private String message;
    private Boolean subscriptionActive;

    // Constructors
    public UsageValidationResponse() {}

    public UsageValidationResponse(String tenantId, ServiceName serviceName, Boolean allowed, String reason) {
        this.tenantId = tenantId;
        this.serviceName = serviceName;
        this.allowed = allowed;
        this.reason = reason;
    }

    // Static factory methods for common responses
    public static UsageValidationResponse allowed(String tenantId, ServiceName serviceName) {
        return new UsageValidationResponse(tenantId, serviceName, true, "Usage allowed");
    }

    public static UsageValidationResponse denied(String tenantId, ServiceName serviceName, String reason) {
        return new UsageValidationResponse(tenantId, serviceName, false, reason);
    }

    public static UsageValidationResponse quotaExceeded(String tenantId, ServiceName serviceName, 
                                                       Integer currentUsage, Integer allowedUsage) {
        UsageValidationResponse response = new UsageValidationResponse(tenantId, serviceName, false, "Quota exceeded");
        response.setCurrentUsage(currentUsage);
        response.setAllowedUsage(allowedUsage);
        response.setRemainingUsage(0);
        return response;
    }

    public static UsageValidationResponse noActiveSubscription(String tenantId, ServiceName serviceName) {
        return new UsageValidationResponse(tenantId, serviceName, false, "No active subscription found");
    }

    public static UsageValidationResponse featureNotAvailable(String tenantId, ServiceName serviceName, String featureKey) {
        return new UsageValidationResponse(tenantId, serviceName, false, 
            "Feature '" + featureKey + "' is not available in current plan");
    }

    // Getters and Setters
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public ServiceName getServiceName() { return serviceName; }
    public void setServiceName(ServiceName serviceName) { this.serviceName = serviceName; }

    public Boolean getAllowed() { return allowed; }
    public void setAllowed(Boolean allowed) { this.allowed = allowed; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public Integer getCurrentUsage() { return currentUsage; }
    public void setCurrentUsage(Integer currentUsage) { this.currentUsage = currentUsage; }

    public Integer getAllowedUsage() { return allowedUsage; }
    public void setAllowedUsage(Integer allowedUsage) { this.allowedUsage = allowedUsage; }

    public Integer getRemainingUsage() { return remainingUsage; }
    public void setRemainingUsage(Integer remainingUsage) { this.remainingUsage = remainingUsage; }

    public Boolean getIsUnlimited() { return isUnlimited; }
    public void setIsUnlimited(Boolean isUnlimited) { this.isUnlimited = isUnlimited; }

    public String getSubscriptionId() { return subscriptionId; }
    public void setSubscriptionId(String subscriptionId) { this.subscriptionId = subscriptionId; }

    public String getPlanId() { return planId; }
    public void setPlanId(String planId) { this.planId = planId; }

    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }

    public Boolean getHasFeature() { return hasFeature; }
    public void setHasFeature(Boolean hasFeature) { this.hasFeature = hasFeature; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Boolean getSubscriptionActive() { return subscriptionActive; }
    public void setSubscriptionActive(Boolean subscriptionActive) { this.subscriptionActive = subscriptionActive; }

    @Override
    public String toString() {
        return "UsageValidationResponse{" +
                "tenantId='" + tenantId + '\'' +
                ", serviceName=" + serviceName +
                ", allowed=" + allowed +
                ", reason='" + reason + '\'' +
                ", currentUsage=" + currentUsage +
                ", allowedUsage=" + allowedUsage +
                ", remainingUsage=" + remainingUsage +
                ", isUnlimited=" + isUnlimited +
                '}';
    }
} 