// File: `src/main/java/com/screening/interviews/dto/CandidateMatchScoreResponseDto.java`
package com.screening.interviews.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@Builder
public class CandidateMatchScoreResponseDto {
    private Double matchPercentage;
//    private Map<String, String> matchDetails;  // e.g. strongSkills, missingSkills, suggestedImprovements
    private String fitSummary;                 // Candidate's fit summary
    private String[] skills;                   // new field: skills as string array
    private int yearsOfExperience;             // new field: years of experience
    private String error;
}