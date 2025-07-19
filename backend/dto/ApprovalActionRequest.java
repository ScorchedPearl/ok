package com.screening.interviews.dto;
import com.screening.interviews.model.OfferApproval;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalActionRequest {
    private OfferApproval.ApprovalStatus action; // APPROVED, REJECTED, SKIPPED
    private String comment;
}