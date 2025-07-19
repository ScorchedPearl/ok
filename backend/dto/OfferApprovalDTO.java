package com.screening.interviews.dto;
import com.screening.interviews.model.OfferApproval;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OfferApprovalDTO {
    private Long id;
    private Long offerId;
    private Long approverId;
    private String approverRole;
    private Integer approvalOrder;
    private OfferApproval.ApprovalStatus status;
    private String comment;
    private LocalDateTime actionTimestamp;
}