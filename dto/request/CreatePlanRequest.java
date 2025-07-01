package com.screening.billing.dto.request;

import com.screening.billing.enums.BillingCycle;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.Map;

public class CreatePlanRequest {

    @NotBlank(message = "Plan ID is required")
    @Size(max = 50, message = "Plan ID must not exceed 50 characters")
    private String planId;

    @NotBlank(message = "Plan name is required")
    @Size(max = 100, message = "Plan name must not exceed 100 characters")
    private String planName;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @PositiveOrZero(message = "Number of calls allowed must be positive or zero")
    private Integer noOfCallsAllowed = 0;

    @PositiveOrZero(message = "Number of tests allowed must be positive or zero")
    private Integer noOfTestsAllowed = 0;

    @NotNull(message = "Price is required")
    @PositiveOrZero(message = "Price must be positive or zero")
    private BigDecimal price;

    private BillingCycle billingCycle = BillingCycle.MONTHLY;

    private Boolean isActive = true;

    private Map<String, String> features;

    // Constructors
    public CreatePlanRequest() {}

    public CreatePlanRequest(String planId, String planName, String description, 
                           Integer noOfCallsAllowed, Integer noOfTestsAllowed, 
                           BigDecimal price, BillingCycle billingCycle) {
        this.planId = planId;
        this.planName = planName;
        this.description = description;
        this.noOfCallsAllowed = noOfCallsAllowed;
        this.noOfTestsAllowed = noOfTestsAllowed;
        this.price = price;
        this.billingCycle = billingCycle;
    }

    // Getters and Setters
    public String getPlanId() { return planId; }
    public void setPlanId(String planId) { this.planId = planId; }

    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getNoOfCallsAllowed() { return noOfCallsAllowed; }
    public void setNoOfCallsAllowed(Integer noOfCallsAllowed) { this.noOfCallsAllowed = noOfCallsAllowed; }

    public Integer getNoOfTestsAllowed() { return noOfTestsAllowed; }
    public void setNoOfTestsAllowed(Integer noOfTestsAllowed) { this.noOfTestsAllowed = noOfTestsAllowed; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BillingCycle getBillingCycle() { return billingCycle; }
    public void setBillingCycle(BillingCycle billingCycle) { this.billingCycle = billingCycle; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Map<String, String> getFeatures() { return features; }
    public void setFeatures(Map<String, String> features) { this.features = features; }

    @Override
    public String toString() {
        return "CreatePlanRequest{" +
                "planId='" + planId + '\'' +
                ", planName='" + planName + '\'' +
                ", price=" + price +
                ", billingCycle=" + billingCycle +
                '}';
    }
} 