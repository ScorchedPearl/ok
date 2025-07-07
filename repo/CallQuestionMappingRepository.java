package com.screening.interviews.repo;

import com.screening.interviews.model.CallQuestionMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CallQuestionMappingRepository extends JpaRepository<CallQuestionMapping, UUID> {
    List<CallQuestionMapping> findByCallIdOrderBySequenceOrder(UUID callId);
    void deleteByCallId(UUID callId);
}