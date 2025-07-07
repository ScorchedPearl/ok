package com.screening.interviews.repo;

import com.screening.interviews.model.Transcript;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TranscriptRepository extends JpaRepository<Transcript, UUID> {
    List<Transcript> findByCall_CallId(UUID callId);
    @Query("SELECT t FROM Transcript t WHERE t.call.callId = :callId ORDER BY t.id")
    List<Transcript> findByCallIdOrderById(@Param("callId") UUID callId);
}