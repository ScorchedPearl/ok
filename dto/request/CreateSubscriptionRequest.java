package com.screening.billing.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class CreateSubscriptionRequest {

    @NotBlank(message = "Tenant ID is required")
    @Size(max = 50, message = "Tenant ID must not exceed 50 characters")
    private String tenantId;

    @NotBlank(message = "Plan ID is required")
    @Size(max = 50, message = "Plan ID must not exceed 50 characters")
    private String planId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @Future(message = "End date must be in the future")
    private LocalDate endDate;

    private Boolean autoRenew = true;

    // For trial subscriptions
    private Boolean isTrial = false;
    private Integer trialDays;

    // Constructors
    public CreateSubscriptionRequest() {}

    public CreateSubscriptionRequest(String tenantId, String planId, LocalDate startDate, LocalDate endDate) {
        this.tenantId = tenantId;
        this.planId = planId;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    // Getters and Setters
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public String getPlanId() { return planId; }
    public void setPlanId(String planId) { this.planId = planId; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Boolean getAutoRenew() { return autoRenew; }
    public void setAutoRenew(Boolean autoRenew) { this.autoRenew = autoRenew; }

    public Boolean getIsTrial() { return isTrial; }
    public void setIsTrial(Boolean isTrial) { this.isTrial = isTrial; }

    public Integer getTrialDays() { return trialDays; }
    public void setTrialDays(Integer trialDays) { this.trialDays = trialDays; }

    @Override
    public String toString() {
        return "CreateSubscriptionRequest{" +
                "tenantId='" + tenantId + '\'' +
                ", planId='" + planId + '\'' +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", autoRenew=" + autoRenew +
                ", isTrial=" + isTrial +
                '}';
    }
} 