package com.screening.interviews.dto;

import com.screening.interviews.enums.CallStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class CallRequestDto {
    private String remark;
    private Long tenantId;
    private String scheduledAt;
    private Integer durationMinutes;
    private CallStatus status;
    private UUID jobId;
    private Long candidateId;
    private String createdBy;
    private String mobileNumber;
    private List<QuestionDto> questions;
}