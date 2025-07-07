package com.screening.interviews.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TenantCandidateRequest {
    private Long tenantId;
    private Long candidateId;
    private String relationshipType;
}