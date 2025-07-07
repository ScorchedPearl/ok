package com.screening.interviews.dto;

import com.screening.interviews.enums.CallStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class CallResponseDto {
    private UUID callId;
    private String remark;
    private String scheduledAt;
    private Integer durationMinutes;
    private CallStatus status;
    private UUID jobId;
    private String candidateFullName;
    private String candidateEmail;
    private Long candidateId;
    private Long tenantId;
    private String createdBy;
    private LocalDateTime createdAt;
    private List<UUID> questionIds;
}