package com.screening.billing.dto.request;

import com.screening.billing.enums.ServiceName;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class UsageValidationRequest {

    @NotBlank(message = "Tenant ID is required")
    @Size(max = 50, message = "Tenant ID must not exceed 50 characters")
    private String tenantId;

    @NotNull(message = "Service name is required")
    private ServiceName serviceName;

    @Positive(message = "Usage count must be positive")
    private Integer usageCount = 1;

    // Optional feature key to validate specific features
    @Size(max = 100, message = "Feature key must not exceed 100 characters")
    private String featureKey;

    // Whether to actually increment usage or just validate
    private Boolean incrementUsage = true;

    // Constructors
    public UsageValidationRequest() {}

    public UsageValidationRequest(String tenantId, ServiceName serviceName) {
        this.tenantId = tenantId;
        this.serviceName = serviceName;
        this.usageCount = 1;
        this.incrementUsage = true;
    }

    public UsageValidationRequest(String tenantId, ServiceName serviceName, Integer usageCount) {
        this.tenantId = tenantId;
        this.serviceName = serviceName;
        this.usageCount = usageCount;
        this.incrementUsage = true;
    }

    // Getters and Setters
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public ServiceName getServiceName() { return serviceName; }
    public void setServiceName(ServiceName serviceName) { this.serviceName = serviceName; }

    public Integer getUsageCount() { return usageCount; }
    public void setUsageCount(Integer usageCount) { this.usageCount = usageCount; }

    public String getFeatureKey() { return featureKey; }
    public void setFeatureKey(String featureKey) { this.featureKey = featureKey; }

    public Boolean getIncrementUsage() { return incrementUsage; }
    public void setIncrementUsage(Boolean incrementUsage) { this.incrementUsage = incrementUsage; }

    @Override
    public String toString() {
        return "UsageValidationRequest{" +
                "tenantId='" + tenantId + '\'' +
                ", serviceName=" + serviceName +
                ", usageCount=" + usageCount +
                ", featureKey='" + featureKey + '\'' +
                ", incrementUsage=" + incrementUsage +
                '}';
    }
} 