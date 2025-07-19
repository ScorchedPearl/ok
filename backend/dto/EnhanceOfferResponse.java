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
public class EnhanceOfferResponse {
    private String enhancedContent;
    private String suggestions;
    private List<String> improvements;
}