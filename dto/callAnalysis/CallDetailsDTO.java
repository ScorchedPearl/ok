package com.screening.interviews.dto.callAnalysis;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CallDetailsDTO {
    private UUID callId;
    private String scheduledAt;
    private Integer durationMinutes;
    private String status;
    private UUID jobId;
    private String jobTitle; // Optional - if you want to include job details
    private String createdBy;
    private LocalDateTime createdAt;
}