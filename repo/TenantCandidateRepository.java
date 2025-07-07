package com.screening.interviews.repo;

import com.screening.interviews.model.Candidate;
import com.screening.interviews.model.TenantCandidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TenantCandidateRepository extends JpaRepository<TenantCandidate, Long> {
    List<TenantCandidate> findByTenantId(Long tenantId);
    List<TenantCandidate> findByCandidate(Candidate candidate);
    List<TenantCandidate> findByCandidateId(Long candidateId);
    Optional<TenantCandidate> findByTenantIdAndCandidateId(Long tenantId, Long candidateId);

    @Query("SELECT tc.candidate FROM TenantCandidate tc WHERE tc.tenantId = :tenantId")
    List<Candidate> findCandidatesByTenantId(@Param("tenantId") Long tenantId);

    @Query("SELECT tc.candidate FROM TenantCandidate tc WHERE tc.tenantId = :tenantId AND tc.candidate.fullName LIKE %:name%")
    List<Candidate> findCandidatesByTenantIdAndNameContaining(@Param("tenantId") Long tenantId, @Param("name") String name);
}