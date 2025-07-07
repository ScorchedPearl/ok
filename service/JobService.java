// package com.screening.interviews.service;


// import com.screening.interviews.model.Job;
// import com.screening.interviews.repo.JobRepository;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;

// import java.util.List;
// import java.util.UUID;

// @Service
// public class JobService {

//     @Autowired
//     private JobRepository jobRepository;

//     public List<Job> getAllJobs() {
//         return jobRepository.findAll();
//     }

//     public Job getJobById(UUID id) {
//         return jobRepository.findById(id)
//                 .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
//     }

//     public Job createJob(Job job) {
//         return jobRepository.save(job);
//     }

//     public Job updateJob(UUID id, Job jobDetails) {
//         Job job = jobRepository.findById(id)
//                 .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
//         job.setTitle(jobDetails.getTitle());
//         job.setDepartment(jobDetails.getDepartment());
//         job.setLocation(jobDetails.getLocation());
//         job.setEmploymentType(jobDetails.getEmploymentType());
//         job.setDescription(jobDetails.getDescription());
//         job.setRecruiterId(jobDetails.getRecruiterId());

//         return jobRepository.save(job);
//     }

//     public void deleteJob(UUID id) {
//         jobRepository.deleteById(id);
//     }
// }

package com.screening.interviews.service;

import com.screening.interviews.model.Candidate;
import com.screening.interviews.model.CandidateJob;
import com.screening.interviews.model.Job;
import com.screening.interviews.repo.CandidateJobRepository;
import com.screening.interviews.repo.JobRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class JobService {
    
    @Autowired
    private JobRepository jobRepository;
    private final CandidateJobRepository candidateJobRepository;

    public JobService(CandidateJobRepository candidateJobRepository) {
        this.candidateJobRepository = candidateJobRepository;
    }

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }
    
    public List<Job> getJobsByTenantId(Long tenantId) {
        return jobRepository.findByTenantId(tenantId);
    }
    
    public Job getJobById(UUID id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
    }
    public List<Candidate> getCandidatesByJobIdAndTenant(UUID jobId, Long tenantId) {
        List<CandidateJob> candidateJobs = candidateJobRepository.findByJob_IdAndJob_TenantId(jobId, tenantId);
        return candidateJobs.stream()
                .map(CandidateJob::getCandidate)
                .collect(Collectors.toList());
    }

    public Job createJob(Job job) {
        return jobRepository.save(job);
    }

    public Job updateJob(UUID id, Job jobDetails) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
        job.setTitle(jobDetails.getTitle());
        job.setDepartment(jobDetails.getDepartment());
        job.setLocation(jobDetails.getLocation());
        job.setEmploymentType(jobDetails.getEmploymentType());
        job.setDescription(jobDetails.getDescription());
        job.setRecruiterId(jobDetails.getRecruiterId());
        job.setTenantId(jobDetails.getTenantId());
        job.setCompanyName(jobDetails.getCompanyName());

        return jobRepository.save(job);
    }
    
    public void deleteJob(UUID id) {
        jobRepository.deleteById(id);
    }

    public List<Job> getJobsByTenantAndDepartment(Long tenantId, String department) {
        return jobRepository.findByTenantIdAndDepartment(tenantId, department);
    }


    @Transactional
    public List<Job> updateDepartmentName(Long tenantId, String oldDepartment, String newDepartment) {
        // First find all jobs with the specified tenant ID and department
        List<Job> jobsToUpdate = jobRepository.findByTenantIdAndDepartment(tenantId, oldDepartment);

        // Update the department name for each job
        for (Job job : jobsToUpdate) {
            job.setDepartment(newDepartment);
        }

        // Save all updated jobs
        return jobRepository.saveAll(jobsToUpdate);
    }

    public Job toggleJobStatus(UUID id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));

        // Toggle the current status
        job.setDisable(!job.isDisable());

        return jobRepository.save(job);
    }

    // Optional - if you want explicit methods
    public Job disableJob(UUID id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
        job.setDisable(true);
        return jobRepository.save(job);
    }

    public Job enableJob(UUID id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
        job.setDisable(false);
        return jobRepository.save(job);
    }
}