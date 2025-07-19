package com.screening.interviews.dto;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalWorkflowRequest {
    private List<ApprovalStep> approvalSteps;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApprovalStep {
        private Long approverId;
        private String approverRole;
        private Integer order;
    }
}