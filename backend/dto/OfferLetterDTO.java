package com.screening.interviews.dto;
import com.screening.interviews.model.OfferLetter;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.screening.interviews.dto.OfferLetterDTO;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OfferLetterDTO {
    private Long id;
    private Long candidateId;
    private Long createdBy;
    private OfferLetter.OfferStatus status;
    private String offerContent;
    private String signedPdfUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OfferApprovalDTO> approvals;
}
