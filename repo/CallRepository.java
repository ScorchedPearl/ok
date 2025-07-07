package com.screening.interviews.repo;

import com.screening.interviews.model.Call;
import com.screening.interviews.enums.CallStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CallRepository extends JpaRepository<Call, UUID> {
    Page<Call> findAllByCandidateId(Long candidateId, Pageable pageable);
    Page<Call> findAllByJobId(UUID jobId, Pageable pageable);
    Page<Call> findAllByTenantId(Long tenantId, Pageable pageable);
    Optional<Call> findByCallIdAndTenantId(UUID callId, Long tenantId);
    List<Call> findByStatus(CallStatus status);
    @Query("SELECT c FROM Call c WHERE c.callId = :callId")
    Optional<Call> findByCallId(@Param("callId") UUID callId);

    List<Call> findByJobId(UUID jobId);

    List<Call> findByCandidateId(Long candidateId);
}