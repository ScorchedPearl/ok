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
public class JobDescriptionEnhancementRequestDto {
    private String title;
    private String department;
    private String location;
    private String employmentType;
    private String description;
    private String companyInfo; // Optional company information
    private List<String> skills; // Optional specific skills to emphasize
    private String experienceLevel; // Optional experience level (entry, mid, senior)
}