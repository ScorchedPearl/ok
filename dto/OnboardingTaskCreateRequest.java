package com.screening.interviews.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnboardingTaskCreateRequest {
    @NotNull(message = "Candidate ID is required")
    private Long candidateId;

    @NotNull(message = "Job ID is required")
    private UUID jobId;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String priority;
    private Integer sequenceOrder;
    private LocalDateTime dueDate;
    private String notes;
    private Boolean isMandatory;
}