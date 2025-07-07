package com.screening.interviews.dto;

import com.screening.interviews.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnboardingTaskUpdateRequest {
    private String title;
    private String description;
    private TaskStatus status;
    private String priority;
    private Integer sequenceOrder;
    private LocalDateTime dueDate;
    private String notes;
    private Boolean isMandatory;
}