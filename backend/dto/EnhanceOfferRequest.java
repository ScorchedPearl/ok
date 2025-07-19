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
public class EnhanceOfferRequest {
    private String offerContent;
    private String role; // Job role for context
    private String experience; // Experience level for context
    private String enhancementType; // "PROFESSIONAL", "FRIENDLY", "FORMAL", "CREATIVE"
}