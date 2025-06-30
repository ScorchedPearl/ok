package com.screening.interviews.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for returning test suggestions based on a job description
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestSuggestionResponseDto {
    private List<String> recommendedTestTypes;
    private String explanation;
    private List<String> specificSkillsToAssess;
    private Integer complexityScore;
    private String customPromptSuggestion;
}