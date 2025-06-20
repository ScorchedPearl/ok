package com.screening.interviews.controller;

import com.screening.interviews.dto.CallRequestDto;
import com.screening.interviews.dto.CallResponseDto;
import com.screening.interviews.dto.CallStatusUpdateDto;
import com.screening.interviews.dto.CallUpdateRequest;
import com.screening.interviews.dto.callAnalysis.CallAnalysisResponseDTO;
import com.screening.interviews.service.CallService;
import com.screening.interviews.service.impl.CallServiceImpl;
import org.apache.tomcat.util.http.parser.Authorization;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/calls")
public class CallController {
    private static final Logger log = LoggerFactory.getLogger(CallController.class);

    private final CallService callService;
    private final CallServiceImpl callServiceImpl;

    @Autowired
    public CallController(CallService callService, CallServiceImpl callServiceImpl) {
        this.callService = callService;
        this.callServiceImpl = callServiceImpl;
    }

    @PostMapping
    public ResponseEntity<CallResponseDto> scheduleCall(
            @RequestBody CallRequestDto callRequestDto,
            @RequestHeader("X-Tenant-ID") Long tenantId)
    {
        log.info("hello this is test");
        CallResponseDto createdCall = callService.scheduleCall(callRequestDto, tenantId);
        return new ResponseEntity<>(createdCall, HttpStatus.CREATED);
    }

    @GetMapping("/{callId}")
    public ResponseEntity<CallResponseDto> getCall(
            @PathVariable UUID callId,
            @RequestHeader("X-Tenant-ID") Long tenantId) {

        CallResponseDto call = callService.getCall(callId, tenantId);
        return ResponseEntity.ok(call);
    }

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<Page<CallResponseDto>> getCallsByCandidate(
            @PathVariable Long candidateId,
            Pageable pageable) {
        Page<CallResponseDto> calls = callService.getAllCallsByCandidate(candidateId, pageable);
        return ResponseEntity.ok(calls);
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<Page<CallResponseDto>> getCallsByJob(
            @PathVariable UUID jobId,
            Pageable pageable) {
        Page<CallResponseDto> calls = callService.getAllCallsByJob(jobId, pageable);
        return ResponseEntity.ok(calls);
    }

    @GetMapping("/{callId}/questions")
    public ResponseEntity<List<UUID>> getQuestionsForCall(
            @PathVariable UUID callId,
            @RequestHeader("X-Tenant-ID") Long tenantId) {
        List<UUID> questionIds = callService.getQuestionsForCall(callId, tenantId);
        return ResponseEntity.ok(questionIds);
    }

    @PatchMapping("/{callId}/status")
    public ResponseEntity<CallResponseDto> updateCallStatus(
            @PathVariable UUID callId,
            @RequestBody CallStatusUpdateDto statusUpdateDto,
            @RequestHeader("X-Tenant-ID") Long tenantId) {
        CallResponseDto updatedCall = callService.updateCallStatus(callId, statusUpdateDto, tenantId);
        return ResponseEntity.ok(updatedCall);
    }

    @PostMapping("/update")
    public ResponseEntity<String> updateCallAndAddTranscripts(@RequestBody CallUpdateRequest request) {
        callService.updateCallAndAddTranscripts(request);
        return ResponseEntity.ok("Call status updated and transcripts added successfully.");
    }

    @PostMapping("/{callId}/analyze")
    public ResponseEntity<String> analyzeTranscript(@PathVariable UUID callId,@RequestHeader("Authorization") String token) {
        callServiceImpl.analyzeTranscript(callId,token);
        return ResponseEntity.ok("Transcript analysis completed successfully.");
    }

    @GetMapping("/{callId}/analysis")
    public ResponseEntity<CallAnalysisResponseDTO> getCallAnalysis(@PathVariable UUID callId) {
        CallAnalysisResponseDTO analysis = callServiceImpl.getCallAnalysis(callId);
        return ResponseEntity.ok(analysis);
    }
}