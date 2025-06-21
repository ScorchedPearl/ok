package com.screening.interviews.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnboardingTaskSummaryDTO {
    private Long candidateId;
    private String candidateName;
    private Long totalTasks;
    private Long completedTasks;
    private Long pendingTasks;
    private Long overdueTasks;
    private Double completionRate;
    private Boolean hasPendingMandatoryTasks;
}
