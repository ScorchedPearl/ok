package com.screening.interviews.dto;

import com.screening.interviews.model.OfferLetter;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import java.time.LocalDateTime;
import java.util.List;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OfferSummaryDTO {
    private Long id;
    private Long candidateId;
    private OfferLetter.OfferStatus status;
    private Long createdBy;
    private LocalDateTime createdAt;
    private int pendingApprovalsCount;
    private int totalApprovalsCount;
}