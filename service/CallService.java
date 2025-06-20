package com.screening.interviews.service;

import com.screening.interviews.dto.CallRequestDto;
import com.screening.interviews.dto.CallResponseDto;
import com.screening.interviews.dto.CallStatusUpdateDto;
import com.screening.interviews.dto.CallUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface CallService {
    CallResponseDto scheduleCall(CallRequestDto callRequestDto, Long tenantId);
    CallResponseDto getCall(UUID callId, Long tenantId);
    Page<CallResponseDto> getAllCallsByCandidate(Long candidateId, Pageable pageable);
    Page<CallResponseDto> getAllCallsByJob(UUID jobId, Pageable pageable);
    List<UUID> getQuestionsForCall(UUID callId, Long tenantId);
    CallResponseDto updateCallStatus(UUID callId, CallStatusUpdateDto statusUpdateDto, Long tenantId);
    void updateCallAndAddTranscripts(CallUpdateRequest request);
}