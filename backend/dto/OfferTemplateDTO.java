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
public class OfferTemplateDTO {
    private Long id;
    private String name;
    private String description;
    private String templateContent;
    private String category;
    private Long createdBy;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}