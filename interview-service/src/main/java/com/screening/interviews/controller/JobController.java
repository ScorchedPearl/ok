package com.screening.interviews.controller;

import com.screening.interviews.dto.DepartmentUpdateRequest;
import com.screening.interviews.dto.JobDTO;
import com.screening.interviews.model.Job;
import com.screening.interviews.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "https://screenera.ai", allowCredentials = "true")
public class JobController {
    
    @Autowired
    private JobService jobService;
    
    @GetMapping
    public List<Job> getAllJobs() {
        return jobService.getAllJobs();
    }
    
    @GetMapping("/tenant/{tenantId}")
    public List<Job> getJobsByTenantId(@PathVariable Long tenantId) {
        return jobService.getJobsByTenantId(tenantId);
    }
    
    @GetMapping("/{id}")
    public Job getJobById(@PathVariable UUID id) {
        return jobService.getJobById(id);
    }
    
    @PostMapping
    public Job createJob(@RequestBody Job job) {
        return jobService.createJob(job);
    }
    
    @PutMapping("/{id}")
    public Job updateJob(@PathVariable UUID id, @RequestBody Job jobDetails) {
        return jobService.updateJob(id, jobDetails);
    }
    
    @DeleteMapping("/{id}")
    public void deleteJob(@PathVariable UUID id) {
        jobService.deleteJob(id);
    }
    
    @PutMapping("/{jobId}/assignTest/{testId}")
    public JobDTO assignTestToJob(@PathVariable UUID jobId, @PathVariable Long testId) {
        // First, retrieve the job (if not found, the service will throw an exception)
        Job job = jobService.getJobById(jobId);
        // Set the test id (each job can have at most one test id)
        job.setTestId(testId);
        // Save the updated job
        Job updatedJob = jobService.createJob(job); // or updateJob(jobId, job) depending on your implementation
        
        return new JobDTO(
            updatedJob.getId(),
            updatedJob.getTitle(),
            updatedJob.getDepartment(),
            updatedJob.getLocation(),
            updatedJob.getEmploymentType(),
            updatedJob.getDescription(),
            updatedJob.getRecruiterId(),
            updatedJob.getTestId(),
            updatedJob.getTenantId(),
            updatedJob.getCompanyName(),
            updatedJob.getCreatedAt(),
            updatedJob.getUpdatedAt()
        );
    }


    @GetMapping("/by-tenant-department/{tenantId}/{department}")
    public ResponseEntity<List<Job>> getJobsByTenantAndDepartment(
            @PathVariable Long tenantId,
            @PathVariable String department) {
        List<Job> jobs = jobService.getJobsByTenantAndDepartment(tenantId, department);
        return ResponseEntity.ok(jobs);
    }

    @PutMapping("/tenant/{tenantId}/department/update")
    public ResponseEntity<List<Job>> updateDepartmentName(
            @PathVariable Long tenantId,
            @RequestBody DepartmentUpdateRequest request) {
        List<Job> updatedJobs = jobService.updateDepartmentName(tenantId, request.getOldDepartment(), request.getNewDepartment());
        return ResponseEntity.ok(updatedJobs);
    }

    @GetMapping("/{id}/title")
    public ResponseEntity<String> getJobTitleById(@PathVariable UUID id) {
        Job job = jobService.getJobById(id);
        return ResponseEntity.ok(job.getTitle());
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<Job> toggleJobStatus(@PathVariable UUID id) {
        Job job = jobService.getJobById(id);
        job.setDisable(!job.isDisable()); // Note: getter might be isDisable but field is disable
        Job updatedJob = jobService.updateJob(id, job);
        return ResponseEntity.ok(updatedJob);
    }

    // Optional - if you want explicit endpoints
    @PutMapping("/{id}/disable")
    public ResponseEntity<Job> disableJob(@PathVariable UUID id) {
        Job updatedJob = jobService.disableJob(id);
        return ResponseEntity.ok(updatedJob);
    }

    @PutMapping("/{id}/enable")
    public ResponseEntity<Job> enableJob(@PathVariable UUID id) {
        Job updatedJob = jobService.enableJob(id);
        return ResponseEntity.ok(updatedJob);
    }
}