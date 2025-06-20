package com.screening.interviews.service;

import com.screening.interviews.exception.ResourceNotFoundException;
import com.screening.interviews.model.Candidate;
import com.screening.interviews.model.TenantCandidate;
import com.screening.interviews.repo.CandidateRepository;
import com.screening.interviews.repo.TenantCandidateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TenantCandidateService {
    private final TenantCandidateRepository tenantCandidateRepository;
    private final CandidateRepository candidateRepository;

    @Transactional
    public TenantCandidate createOrUpdateRelationship(Long tenantId, Long candidateUserId, String relationshipType) {
        Candidate candidate = candidateRepository.findByUserId(candidateUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with ID: " + candidateUserId));

        Long candidateId = candidate.getId();
        TenantCandidate tenantCandidate = tenantCandidateRepository
                .findByTenantIdAndCandidateId(tenantId, candidateId)
                .orElse(TenantCandidate.builder()
                        .tenantId(tenantId)
                        .candidate(candidate)
                        .build());

        tenantCandidate.setRelationshipType(relationshipType);
        return tenantCandidateRepository.save(tenantCandidate);
    }

    @Transactional(readOnly = true)
    public List<Candidate> getCandidatesByTenant(Long tenantId) {
        return tenantCandidateRepository.findCandidatesByTenantId(tenantId);
    }

    @Transactional(readOnly = true)
    public List<Long> getTenantIdsByCandidateId(Long candidateId) {
        return tenantCandidateRepository.findByCandidateId(candidateId)
                .stream()
                .map(TenantCandidate::getTenantId)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteRelationship(Long tenantId, Long candidateId) {
        tenantCandidateRepository.findByTenantIdAndCandidateId(tenantId, candidateId)
                .ifPresent(tenantCandidateRepository::delete);
    }
}