package com.screening.interviews.dto;

import com.screening.interviews.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnboardingTaskDTO {
    private Long taskId;
    private Long tenantId;
    private Long candidateId;
    private UUID jobId;
    private String title;
    private String description;
    private TaskStatus status;
    private String priority;
    private Integer sequenceOrder;
    private LocalDateTime dueDate;
    private Long assignedBy;
    private LocalDateTime assignedAt;
    private LocalDateTime completedAt;
    private Long completedBy;
    private String notes;
    private Boolean isMandatory;
    private Boolean isOverdue;

    // Additional fields for display
    private String candidateName;
    private String jobTitle;
    private String assignedByName;
    private String completedByName;
}