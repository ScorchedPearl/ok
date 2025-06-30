package com.screening.interviews.dto;

import com.screening.interviews.model.Candidate;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;


@Data
public class JobApplicationResponseDTO {
    private UUID id;
    private Long userId;
    private Long candidateId;
    private String candidateName;
    private String candidatePhone;
    private UUID jobId;
    private Long tenantId;
    private String status;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
    private Double matchScore;
    private Double experience;
    private List<String> skills;
    private String summary;
}