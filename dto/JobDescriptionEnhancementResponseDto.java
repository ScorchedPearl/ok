package com.screening.interviews.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobDescriptionEnhancementResponseDto {
    private String enhancedDescription;
    private Integer overallScore; // 0-100 score
    private List<String> improvements; // Suggested improvements
    private List<String> strengths; // Strengths of the job description
    private List<String> missingElements; // Important missing elements
    private String summary; // Overall assessment and guidance
}