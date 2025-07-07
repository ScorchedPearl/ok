package com.screening.interviews.controller;

import com.screening.interviews.dto.JobApplicationRequestDTO;
import com.screening.interviews.dto.JobApplicationResponseDTO;
import com.screening.interviews.exception.ResourceNotFoundException;
import com.screening.interviews.model.Candidate;
import com.screening.interviews.model.JobApplication;
import com.screening.interviews.service.JobApplicationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

//import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/job-applications")
public class JobApplicationController {

    private static final Logger logger = LoggerFactory.getLogger(JobApplicationController.class);

    @Autowired
    private JobApplicationService jobApplicationService;

    @GetMapping
    public ResponseEntity<List<JobApplicationResponseDTO>> getAllJobApplications() {
        logger.debug("Fetching all job applications");
        List<JobApplication> applications = jobApplicationService.getAllJobApplications();
        List<JobApplicationResponseDTO> dtos = applications.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobApplicationResponseDTO> getJobApplicationById(@PathVariable UUID id) {
        logger.debug("Fetching job application with ID: {}", id);
        JobApplication application = jobApplicationService.getJobApplicationById(id);
        return ResponseEntity.ok(convertToResponseDTO(application));
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<JobApplicationResponseDTO>> getJobApplicationsByJobId(@PathVariable UUID jobId) {
        logger.debug("Fetching job applications for jobId: {}", jobId);
        List<JobApplication> applications = jobApplicationService.getJobApplicationsByJobId(jobId);
        List<JobApplicationResponseDTO> dtos = applications.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createJobApplication( @RequestBody JobApplicationRequestDTO dto) {
        logger.info("Creating job application for userId: {}, tenantId: {}", dto.getUserId(), dto.getTenantId());
        JobApplication savedApplication = jobApplicationService.createJobApplication(dto);
        JobApplicationResponseDTO responseDto = convertToResponseDTO(savedApplication);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Successfully created job application");
        response.put("data", responseDto);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateJobApplication(@PathVariable UUID id,  @RequestBody JobApplicationRequestDTO dto) {
        logger.debug("Updating job application with ID: {}", id);
        JobApplication updatedApplication = jobApplicationService.updateJobApplication(id, dto);
        JobApplicationResponseDTO responseDto = convertToResponseDTO(updatedApplication);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Successfully updated job application");
        response.put("data", responseDto);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteJobApplication(@PathVariable UUID id) {
        logger.debug("Deleting job application with ID: {}", id);
        jobApplicationService.deleteJobApplication(id);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Successfully deleted job application");
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @GetMapping("/candidate/{userId}/tenant/{tenantId}")
    public ResponseEntity<List<JobApplicationResponseDTO>> getJobApplicationsByCandidateIdAndTenantId(
            @PathVariable("userId") Long userId,
            @PathVariable("tenantId") Long tenantId) {
        logger.debug("Fetching job applications for userId: {} and tenantId: {}", userId, tenantId);
        List<JobApplication> applications = jobApplicationService.getJobApplicationsByCandidateIdAndTenantId(userId, tenantId);
        List<JobApplicationResponseDTO> dtos = applications.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<JobApplicationResponseDTO>> getJobApplicationsByUserId(@PathVariable Long userId) {
        logger.debug("Fetching all job applications for userId: {}", userId);
        List<JobApplication> applications = jobApplicationService.getJobApplicationsByUserId(userId);
        List<JobApplicationResponseDTO> dtos = applications.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    @GetMapping("/candidate/{jobId}/{tenantId}")
    public ResponseEntity<List<Candidate>> getCandidatesByJobIdAndTenantId(@PathVariable UUID jobId,@PathVariable Long tenantId) {
        logger.info("Fetching candidates for jobId: {} and tenantId: {}", jobId, tenantId);
        System.out.println("here");
        List<Candidate> candidates= jobApplicationService.getCandidateByJobIdAndTenantId(jobId,tenantId);
        System.out.println(candidates);
        return ResponseEntity.ok(candidates);
    }

    @GetMapping("/candidate/{tenantId}")
    public ResponseEntity<List<JobApplication>> getJobApplicationsByTenantId(@PathVariable Long tenantId){
        logger.info("Fetching candidates for tenantId: {}", tenantId);
        List<JobApplication> candidates=jobApplicationService.getJobApplicationsByTenantId(tenantId);
        return ResponseEntity.ok(candidates);
    }

    private JobApplicationResponseDTO convertToResponseDTO(JobApplication application) {
        JobApplicationResponseDTO dto = new JobApplicationResponseDTO();
        dto.setId(application.getId());
        dto.setCandidatePhone(application.getCandidatePhone());
        dto.setUserId(application.getUserId());
        dto.setCandidateId(application.getCandidateId());
        dto.setCandidateName(application.getCandidateName());
        dto.setJobId(application.getJob() != null ? application.getJob().getId() : null);
        dto.setTenantId(application.getTenantId());
        dto.setStatus(application.getStatus());
        dto.setAppliedAt(application.getAppliedAt());
        dto.setUpdatedAt(application.getUpdatedAt());
        dto.setMatchScore(application.getMatchScore());
        dto.setExperience(application.getExperience());
        dto.setSkills(application.getSkills());
        dto.setSummary(application.getSummary());
        return dto;
    }
}