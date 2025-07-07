package com.screening.interviews.repo;

import com.screening.interviews.enums.TaskStatus;
import com.screening.interviews.model.OnboardingTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface OnboardingTaskRepository extends JpaRepository<OnboardingTask, Long> {

    List<OnboardingTask> findByTenantIdOrderBySequenceOrderAsc(Long tenantId);

    List<OnboardingTask> findByTenantIdAndStatusOrderBySequenceOrderAsc(Long tenantId, TaskStatus status);

    List<OnboardingTask> findByTenantIdAndJobIdOrderBySequenceOrderAsc(Long tenantId, UUID jobId);

    List<OnboardingTask> findByTenantIdAndCandidateIdOrderBySequenceOrderAsc(Long tenantId, Long candidateId);

    List<OnboardingTask> findByCandidateIdOrderBySequenceOrderAsc(Long candidateId);

    List<OnboardingTask> findByCandidateIdAndStatusOrderBySequenceOrderAsc(Long candidateId, TaskStatus status);

    // to be implemented
    List<OnboardingTask> findByCandidateIdAndJobIdOrderBySequenceOrderAsc(Long candidateId, UUID jobId);

    @Query("SELECT t FROM OnboardingTask t WHERE t.candidateId = :candidateId AND t.status = 'PENDING' ORDER BY t.sequenceOrder ASC")
    List<OnboardingTask> findPendingTasksByCandidate(@Param("candidateId") Long candidateId);

    @Query("SELECT t FROM OnboardingTask t WHERE t.candidateId = :candidateId AND t.status = 'COMPLETED' ORDER BY t.completedAt DESC")
    List<OnboardingTask> findCompletedTasksByCandidate(@Param("candidateId") Long candidateId);

    @Query("SELECT t FROM OnboardingTask t WHERE t.tenantId = :tenantId AND t.status = 'PENDING' AND t.dueDate < :currentTime ORDER BY t.dueDate ASC")
    List<OnboardingTask> findOverdueTasksByTenant(@Param("tenantId") Long tenantId, @Param("currentTime") LocalDateTime currentTime);

    @Query("SELECT t FROM OnboardingTask t WHERE t.candidateId = :candidateId AND t.status = 'PENDING' AND t.dueDate < :currentTime ORDER BY t.dueDate ASC")
    List<OnboardingTask> findOverdueTasksByCandidate(@Param("candidateId") Long candidateId, @Param("currentTime") LocalDateTime currentTime);

    @Query("SELECT COUNT(t) FROM OnboardingTask t WHERE t.candidateId = :candidateId")
    Long countAllTasksForCandidate(@Param("candidateId") Long candidateId);

    @Query("SELECT COUNT(t) FROM OnboardingTask t WHERE t.candidateId = :candidateId AND t.status = :status")
    Long countTasksByStatusForCandidate(@Param("candidateId") Long candidateId, @Param("status") TaskStatus status);

    @Query("SELECT COUNT(t) FROM OnboardingTask t WHERE t.tenantId = :tenantId AND t.status = :status")
    Long countTasksByStatusForTenant(@Param("tenantId") Long tenantId, @Param("status") TaskStatus status);

    @Query("""
    SELECT 
        CASE 
            WHEN COUNT(t) = 0 THEN null 
            ELSE (COUNT(CASE WHEN t.status = 'COMPLETED' THEN 1 END) * 100.0 / COUNT(t)) 
        END
    FROM OnboardingTask t 
    WHERE t.candidateId = :candidateId
""")
    Double getCompletionRateForCandidate(@Param("candidateId") Long candidateId);


    @Query("SELECT t FROM OnboardingTask t WHERE t.candidateId = :candidateId AND t.status = 'PENDING' AND t.isMandatory = true ORDER BY t.sequenceOrder ASC")
    List<OnboardingTask> findMandatoryPendingTasksByCandidate(@Param("candidateId") Long candidateId);

    List<OnboardingTask> findByTenantIdAndCandidateIdAndJobIdOrderBySequenceOrderAsc(Long tenantId, Long candidateId, UUID jobId);

    @Query("SELECT COUNT(t) > 0 FROM OnboardingTask t WHERE t.candidateId = :candidateId AND t.status = 'PENDING' AND t.isMandatory = true")
    Boolean hasPendingMandatoryTasks(@Param("candidateId") Long candidateId);
}