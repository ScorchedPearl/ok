package com.screening.interviews.controller;

import com.screening.interviews.dto.AddInterviewerDto;
import com.screening.interviews.dto.CreateInterviewDto;
import com.screening.interviews.dto.InterviewResponseDto;
import com.screening.interviews.dto.UpdateInterviewDto;
import com.screening.interviews.enums.InterviewStatus;
import com.screening.interviews.service.InterviewService;
import com.screening.interviews.model.Interview;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/interviews")
@CrossOrigin(origins = "*")
@Slf4j
public class InterviewController {

    private final InterviewService interviewService;

    @Autowired
    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @PostMapping
    public ResponseEntity<InterviewResponseDto> createInterview(@Valid @RequestBody CreateInterviewDto dto) {
        log.info("Received createInterview request: {}", dto);
        InterviewResponseDto interview = interviewService.createInterview(dto);
        return ResponseEntity.ok(interview);
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllInterviews() {
        log.info("Received getAllInterviews request");
        return ResponseEntity.ok(interviewService.getAllInterviews());
    }

    @GetMapping("/tenant/id/{tenantId}")
    public ResponseEntity<List<Map<String, Object>>> getInterviewsByTenantId(@PathVariable Long tenantId) {
        try {
            List<Map<String, Object>> interviews = interviewService.getInterviewsByTenantId(tenantId);
            return ResponseEntity.ok(interviews);
        } catch (Exception e) {
            log.error("Error retrieving interviews for tenant {}: {}", tenantId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @GetMapping("/{id}")
    public ResponseEntity<InterviewResponseDto> getInterviewById(@PathVariable("id") Long id) {
        InterviewResponseDto interview = interviewService.getInterviewById(id);
        return ResponseEntity.ok(interview);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInterview(@PathVariable("id") Long id) {
        interviewService.deleteInterview(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/interviewers")
    public Void addInterviewer(
            @PathVariable("id") Long interviewId,
            @Valid @RequestBody AddInterviewerDto dto) {
        interviewService.addInterviewer(interviewId, dto);
        return null;
    }

    @DeleteMapping("/{id}/interviewers/{userId}")
    public Void removeInterviewer(
            @PathVariable("id") Long interviewId,
            @PathVariable("userId") Long userId) {
        interviewService.removeInterviewer(interviewId, userId);
        return null;
    }

    // File: src/main/java/com/screening/interviews/controller/InterviewController.java

    @PutMapping("/{id}/status")
    public ResponseEntity<InterviewResponseDto> updateInterviewStatus(
            @PathVariable("id") Long id,
            @RequestParam("status") InterviewStatus status) {
        log.info("Received updateInterviewStatus request for id: {} with status: {}", id, status);

        // Validate the status
        if (status != InterviewStatus.SCHEDULED &&
                status != InterviewStatus.COMPLETED_COMPLETED &&
                status != InterviewStatus.COMPLETED_OVERDUE &&
                status != InterviewStatus.CANCELLED) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }

        InterviewResponseDto updatedInterview = interviewService.updateInterviewStatus(id, status);
        return ResponseEntity.ok(updatedInterview);
    }

    /**
     * Retrieves all interviews for which a given user is an interviewer.
     *
     * @param userId the ID of the interviewer
     * @return a list of interviews
     */
    @GetMapping("/interviewer/{userId}")
    public List<InterviewResponseDto> getInterviewsByInterviewerId(@PathVariable("userId") Long userId) {
        log.info("Fetching all interviews for interviewer with userId: {}", userId);

        try {
            // Get interview IDs where this user is an interviewer
            List<Long> interviewIds = interviewService.getInterviewIdsByInterviewerId(userId);

            if (interviewIds.isEmpty()) {
                log.info("No interviews found for interviewer with userId: {}", userId);
                return Collections.emptyList();
            }

            // Retrieve the full interview details for each ID
            // Retrieve the full interview details for each ID
            List<InterviewResponseDto> interviews = interviewIds.stream()
                    .map(id -> getInterviewById(id).getBody())  // Extract the InterviewResponseDto from ResponseEntity
                    .collect(Collectors.toList());

            log.info("Successfully retrieved {} interviews for interviewer with userId: {}",
                    interviews.size(), userId);
            return interviews;
        } catch (Exception e) {
            log.error("Error fetching interviews for interviewer with userId: {}: {}",
                    userId, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch interviews for interviewer", e);
        }
    }

    /**
     * Helper method to convert InterviewResponseDto to Map
     */
    private Map<String, Object> convertToMap(InterviewResponseDto interview) {
        Map<String, Object> interviewMap = new HashMap<>();
        interviewMap.put("interviewId", interview.getInterviewId());
        interviewMap.put("jobId", interview.getJobId());
        interviewMap.put("candidateId", interview.getCandidateId());
        interviewMap.put("tenantId", interview.getTenantId());
        interviewMap.put("candidateEmail", interview.getCandidateEmail());
        interviewMap.put("position", interview.getPosition());
        interviewMap.put("roundNumber", interview.getRoundNumber());
        interviewMap.put("interviewDate", interview.getInterviewDate());
        interviewMap.put("mode", interview.getMode());
        interviewMap.put("status", interview.getStatus());
        interviewMap.put("meetingLink", interview.getMeetingLink());
        interviewMap.put("createdAt", interview.getCreatedAt());
        interviewMap.put("emailSent", interview.getEmailSent());
        interviewMap.put("interviewers", interview.getInterviewers());
        interviewMap.put("resumeFileUrl", interview.getResumeFileUrl());
        interviewMap.put("resumeFileName", interview.getResumeFileName());
        interviewMap.put("resumeFileExpiresAfter", interview.getResumeFileExpiresAfter());
        return interviewMap;
    }

    /**
     * Retrieves all interviews for a specific candidate.
     *
     * @param candidateId the ID of the candidate
     * @return a list of interviews for the candidate
     */
//    @GetMapping("/candidate/{candidateId}")
//    public ResponseEntity<List<Map<String, Object>>> getInterviewsByCandidateId(@PathVariable("candidateId") Long candidateId) {
//        log.info("Fetching all interviews for candidate with ID: {}", candidateId);
//
//        try {
//            List<InterviewResponseDto> interviews = interviewService.getInterviewsByCandidateId(candidateId);
//            List<Map<String, Object>> interviewMaps = interviews.stream()
//                    .map(this::convertToMap)
//                    .collect(Collectors.toList());
//            log.info("Successfully retrieved {} interviews for candidate with ID: {}",
//                    interviewMaps.size(), candidateId);
//            return ResponseEntity.ok(interviewMaps);
//        } catch (Exception e) {
//            log.error("Error fetching interviews for candidate with ID: {}: {}",
//                    candidateId, e.getMessage(), e);
//            throw new RuntimeException("Failed to fetch interviews for candidate", e);
//        }
//    }

    /**
     * Retrieves all interviews for a specific candidate within a tenant.
     *
     * @param candidateId the ID of the candidate
     * @param tenantId the ID of the tenant
     * @return a list of interviews for the candidate in the specified tenant
     */
    @GetMapping("/candidate/{candidateId}/tenant/{tenantId}")
    public ResponseEntity<List<Map<String, Object>>> getInterviewsByCandidateIdAndTenantId(
            @PathVariable("candidateId") Long candidateId,
            @PathVariable("tenantId") Long tenantId) {
        log.info("Fetching interviews for candidate ID: {} and tenant ID: {}", candidateId, tenantId);

        try {
            List<InterviewResponseDto> interviews = interviewService.getInterviewsByCandidateIdAndTenantId(candidateId, tenantId);
            List<Map<String, Object>> interviewMaps = interviews.stream()
                    .map(this::convertToMap)
                    .collect(Collectors.toList());
            log.info("Successfully retrieved {} interviews for candidate ID: {} and tenant ID: {}",
                    interviewMaps.size(), candidateId, tenantId);
            return ResponseEntity.ok(interviewMaps);
        } catch (Exception e) {
            log.error("Error fetching interviews for candidate ID: {} and tenant ID: {}: {}",
                    candidateId, tenantId, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch interviews for candidate and tenant", e);
        }
    }
}