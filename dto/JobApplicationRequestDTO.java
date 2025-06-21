package com.screening.interviews.dto;

import com.google.api.client.util.DateTime;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class JobApplicationRequestDTO {
    private Long userId;
    private Long tenantId;
    private UUID jobId;
    private String mobileNumber;
    private String status;
    private Double matchScore;
    private Double experience;
    private String candidateName;
    private String candidateEmail;
    private List<String> skills;
    private String summary;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
}