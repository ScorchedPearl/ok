package com.screening.interviews.controller;

import com.screening.interviews.dto.TenantCandidateRequest;
import com.screening.interviews.model.Candidate;
import com.screening.interviews.model.TenantCandidate;
import com.screening.interviews.service.TenantCandidateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tenant-candidates")
@RequiredArgsConstructor
public class TenantCandidateController {
    private final TenantCandidateService tenantCandidateService;

    @PostMapping
    public ResponseEntity<TenantCandidate> createRelationship(
            @RequestBody TenantCandidateRequest request) {
        TenantCandidate relationship = tenantCandidateService.createOrUpdateRelationship(
                request.getTenantId(),
                request.getCandidateId(),
                request.getRelationshipType()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(relationship);
    }

    @GetMapping("/tenants/{tenantId}/candidates")
    public ResponseEntity<List<Candidate>> getCandidatesByTenant(@PathVariable Long tenantId) {
        List<Candidate> candidates = tenantCandidateService.getCandidatesByTenant(tenantId);
        return ResponseEntity.ok(candidates);
    }

    @GetMapping("/candidates/{candidateId}/tenants")
    public ResponseEntity<List<Long>> getTenantsByCandidateId(@PathVariable Long candidateId) {
        List<Long> tenantIds = tenantCandidateService.getTenantIdsByCandidateId(candidateId);
        return ResponseEntity.ok(tenantIds);
    }

    @DeleteMapping("/tenants/{tenantId}/candidates/{candidateId}")
    public ResponseEntity<Void> deleteRelationship(
            @PathVariable Long tenantId,
            @PathVariable Long candidateId) {
        tenantCandidateService.deleteRelationship(tenantId, candidateId);
        return ResponseEntity.noContent().build();
    }
}