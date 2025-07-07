package com.screening.interviews.repo;

import com.screening.interviews.model.Candidate;
import com.screening.interviews.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, UUID> {
    List<JobApplication> findByJobId(UUID jobId);
    List<JobApplication> findByCandidateId(Long candidateId); // Changed from Long to UUID
    List<JobApplication> findByCandidateIdAndTenantId(Long candidateId, Long tenantId); // Changed from Long to UUID
    List<JobApplication> findByUserId(Long userId);
    Optional<JobApplication> findByUserIdAndJobId(Long userId, UUID jobId);
    List<JobApplication> findByJobIdAndTenantId(UUID jobId, Long tenantId);
    List<JobApplication> findByTenantId(Long tenantId);
}