package com.screening.interviews.service;

import com.screening.interviews.dto.JobApplicationRequestDTO;
import com.screening.interviews.exception.ResourceNotFoundException;
import com.screening.interviews.model.Candidate;
import com.screening.interviews.model.Job;
import com.screening.interviews.model.JobApplication;
import com.screening.interviews.repo.CandidateRepository;
import com.screening.interviews.repo.JobRepository;
import com.screening.interviews.repo.JobApplicationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class JobApplicationService {

    private static final Logger logger = LoggerFactory.getLogger(JobApplicationService.class);

    private final JobApplicationRepository jobApplicationRepository;
    private final TenantCandidateService tenantCandidateService;
    private final CandidateRepository candidateRepository;
    private final JobRepository jobRepository;

    public JobApplicationService(JobApplicationRepository jobApplicationRepository,
                                 TenantCandidateService tenantCandidateService,
                                 CandidateRepository candidateRepository,
                                 JobRepository jobRepository) {
        this.jobApplicationRepository = jobApplicationRepository;
        this.tenantCandidateService = tenantCandidateService;
        this.candidateRepository = candidateRepository;
        this.jobRepository = jobRepository;
    }

    @Transactional
    public JobApplication createJobApplication(JobApplicationRequestDTO jobApplicationDTO) {
        logger.info("Starting createJobApplication with DTO: {}", jobApplicationDTO);

        // Validate input
        if (jobApplicationDTO == null) {
            logger.error("JobApplication DTO is null");
            throw new IllegalArgumentException("Job application DTO must not be null");
        }

        Long userId = jobApplicationDTO.getUserId();
        logger.info("Extracted userId from DTO: {}", userId);

        if(jobApplicationDTO.getCandidateEmail() == null){
            logger.error("CandidateEmail is null");
            throw new IllegalArgumentException("CandidateEmail must not be null");
        }

        if (userId == null) {
            logger.error("userId is null in JobApplication DTO");
            throw new IllegalArgumentException("userId must not be null");
        }
        if (jobApplicationDTO.getTenantId() == null) {
            logger.error("tenantId is null in JobApplication DTO");
            throw new IllegalArgumentException("tenantId must not be null");
        }
        if (jobApplicationDTO.getJobId() == null) {
            logger.error("jobId is null in JobApplication DTO");
            throw new IllegalArgumentException("jobId must not be null");
        }
        if (jobApplicationDTO.getStatus() == null) {
            logger.error("status is null in JobApplication DTO");
            throw new IllegalArgumentException("status must not be null");
        }

        logger.info("Validated DTO - userId: {}, tenantId: {}, jobId: {}, status: {}",
                userId, jobApplicationDTO.getTenantId(), jobApplicationDTO.getJobId(), jobApplicationDTO.getStatus());

        // Verify candidate exists
        logger.info("Fetching candidate for userId: {}", userId);
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseThrow(() -> {
                    logger.error("Candidate not found for userId: {}", userId);
                    return new ResourceNotFoundException("Candidate not found with userId: " + userId);
                });



        candidate.setPhoneNumber(jobApplicationDTO.getMobileNumber());
        candidate.setResumeSummary(jobApplicationDTO.getSummary());
        candidate.setResumeContent(jobApplicationDTO.getSummary());

        candidateRepository.save(candidate);
        logger.info("Found candidate - id: {}, fullName: {}", candidate.getId(), candidate.getFullName());

        // Verify job exists
        logger.info("Fetching job for jobId: {}", jobApplicationDTO.getJobId());
        Job job = jobRepository.findById(jobApplicationDTO.getJobId())
                .orElseThrow(() -> {
                    logger.error("Job not found for jobId: {}", jobApplicationDTO.getJobId());
                    return new ResourceNotFoundException("Job not found with id: " + jobApplicationDTO.getJobId());
                });
        logger.info("Found job - id: {}", job.getId());

        logger.info("Checking for existing job application for userId: {} and jobId: {}", userId, job.getId());
        jobApplicationRepository.findByUserIdAndJobId(userId, job.getId()).ifPresent(existingApp -> {
            logger.warn("Duplicate job application attempt detected for userId: {} and jobId: {}", userId, job.getId());
            throw new IllegalStateException("Candidate has already applied to this job.");
        });

        // Create JobApplication entity
        JobApplication jobApplication = new JobApplication();
        jobApplication.setUserId(userId);
        jobApplication.setCandidatePhone(candidate.getPhoneNumber());
        jobApplication.setCandidateId(candidate.getId());
        jobApplication.setCandidateName(candidate.getFullName());
        jobApplication.setCandidateEmail(candidate.getEmail());
        jobApplication.setJob(job);
        jobApplication.setTenantId(jobApplicationDTO.getTenantId());
        jobApplication.setStatus(jobApplicationDTO.getStatus());
        jobApplication.setMatchScore(jobApplicationDTO.getMatchScore());
        jobApplication.setExperience(jobApplicationDTO.getExperience());
        jobApplication.setSkills(jobApplicationDTO.getSkills());
        jobApplication.setSummary(jobApplicationDTO.getSummary());

        logger.info("Created JobApplication entity: userId: {}, candidateId: {}, tenantId: {}, jobId: {}, status: {}",
                jobApplication.getUserId(), jobApplication.getCandidateId(), jobApplication.getTenantId(),
                jobApplication.getJob().getId(), jobApplication.getStatus());

        try {
            // Save the job application
            logger.info("Saving job application to repository for userId: {}", userId);
            JobApplication savedApplication = jobApplicationRepository.save(jobApplication);
            logger.info("Successfully saved job application - ID: {}, userId: {}", savedApplication.getId(), savedApplication.getUserId());

            // Create or update the TenantCandidate relationship
            logger.info("Creating/updating TenantCandidate relationship - tenantId: {}, candidateId: {}, relationshipType: APPLICANT",
                    jobApplication.getTenantId(), candidate.getId());
            tenantCandidateService.createOrUpdateRelationship(
                    jobApplication.getTenantId(),
                    userId,
                    "APPLICANT"
            );
            logger.info("Successfully created/updated TenantCandidate relationship - tenantId: {}, candidateId: {}",
                    jobApplication.getTenantId(), candidate.getId());

            return savedApplication;
        } catch (Exception e) {
            logger.error("Failed to create job application - userId: {}, tenantId: {}, candidateId: {}. Error: {}",
                    userId, jobApplication.getTenantId(), candidate.getId(), e.getMessage(), e);
            throw e; // Re-throw to ensure transactional rollback
        }
    }

    public List<JobApplication> getAllJobApplications() {
        logger.debug("Fetching all job applications");
        return jobApplicationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public JobApplication getJobApplicationById(UUID id) {
        logger.debug("Fetching job application with ID: {}", id);
        return jobApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job Application not found with id: " + id));
    }

    public List<JobApplication> getJobApplicationsByJobId(UUID jobId) {
        logger.debug("Fetching job applications for jobId: {}", jobId);
        return jobApplicationRepository.findByJobId(jobId);
    }

    public List<JobApplication> getJobApplicationsByUserId(Long userId) {
        logger.debug("Finding job applications for userId: {}", userId);
        List<JobApplication> applications = jobApplicationRepository.findByUserId(userId);

        if (applications.isEmpty()) {
            logger.info("No job applications found for userId: {}", userId);
        } else {
            logger.debug("Found {} job applications for userId: {}", applications.size(), userId);
        }

        return applications;
    }

    @Transactional
    public JobApplication updateJobApplication(UUID id, JobApplicationRequestDTO jobApplicationDTO) {
        logger.debug("Updating job application with ID: {}", id);

        // Validate input
        if (jobApplicationDTO == null || jobApplicationDTO.getUserId() == null || jobApplicationDTO.getTenantId() == null
                || jobApplicationDTO.getJobId() == null || jobApplicationDTO.getStatus() == null) {
            logger.error("Invalid job application DTO: required fields (userId, tenantId, jobId, status) are null");
            throw new IllegalArgumentException("Job application DTO and its required fields (userId, tenantId, jobId, status) must not be null");
        }

        // Fetch existing job application
        JobApplication jobApplication = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job Application not found with id: " + id));

        // Verify candidate exists
        Candidate candidate = candidateRepository.findByUserId(jobApplicationDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with userId: " + jobApplicationDTO.getUserId()));

        // Verify job exists
        Job job = jobRepository.findById(jobApplicationDTO.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobApplicationDTO.getJobId()));

        // Update fields
        jobApplication.setUserId(jobApplicationDTO.getUserId());
        jobApplication.setCandidateId(candidate.getId());
        jobApplication.setCandidateName(candidate.getFullName());
        jobApplication.setJob(job);
        jobApplication.setTenantId(jobApplicationDTO.getTenantId());
        jobApplication.setStatus(jobApplicationDTO.getStatus());
        jobApplication.setMatchScore(jobApplicationDTO.getMatchScore());
        jobApplication.setExperience(jobApplicationDTO.getExperience());
        jobApplication.setSkills(jobApplicationDTO.getSkills());
        jobApplication.setSummary(jobApplicationDTO.getSummary());

        logger.info("Updating job application: {}", jobApplication);

        JobApplication updatedApplication = jobApplicationRepository.save(jobApplication);
        logger.info("Successfully updated job application with ID: {}", id);
        return updatedApplication;
    }

    @Transactional
    public void deleteJobApplication(UUID id) {
        logger.debug("Deleting job application with ID: {}", id);
        if (!jobApplicationRepository.existsById(id)) {
            logger.error("Job application not found with ID: {}", id);
            throw new ResourceNotFoundException("Job Application not found with id: " + id);
        }
        jobApplicationRepository.deleteById(id);
        logger.info("Successfully deleted job application with ID: {}", id);
    }

    public List<JobApplication> getJobApplicationsByCandidateId(Long userId) {
        logger.debug("Fetching job applications for userId: {}", userId);
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with userId: " + userId));
        return jobApplicationRepository.findByCandidateId(candidate.getId());
    }

    public List<JobApplication> getJobApplicationsByCandidateIdAndTenantId(Long userId, Long tenantId) {
        logger.debug("Fetching job applications for userId: {} and tenantId: {}", userId, tenantId);
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with userId: " + userId));
        return jobApplicationRepository.findByCandidateIdAndTenantId(candidate.getId(), tenantId);
    }
}