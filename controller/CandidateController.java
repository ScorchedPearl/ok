package com.screening.interviews.controller;

import com.screening.interviews.exception.ResourceNotFoundException;
import com.screening.interviews.model.Candidate;
import com.screening.interviews.repo.CandidateRepository;
import com.screening.interviews.repo.TenantCandidateRepository;
import com.screening.interviews.service.JobService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
@Slf4j
public class CandidateController {

    private final CandidateRepository candidateRepository;
    private final TenantCandidateRepository tenantCandidateRepository;
    private final JobService jobService;

    @GetMapping
    public ResponseEntity<List<Candidate>> getAllCandidates() {
        return ResponseEntity.ok(candidateRepository.findAll());
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<Candidate>> getCandidatesPaged(Pageable pageable) {
        return ResponseEntity.ok(candidateRepository.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Candidate> getCandidateById(@PathVariable Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + id));
        return ResponseEntity.ok(candidate);
    }
    @GetMapping("/user/{userId}")
    public ResponseEntity<Candidate> getCandidateByUserId(@PathVariable Long userId) {
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with userId: " + userId));
        return ResponseEntity.ok(candidate);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Caidate> getCandidateByEmail(@PathVariable String email) {
        Candidate candidate = candidateRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with email: " + email));
        return ResponseEntity.ok(candidate);
    }
    @PostMapping
    public ResponseEntity<Candidate> createCandidate(@RequestBody Candidate candidate) {
        return new ResponseEntity<>(candidateRepository.save(candidate), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Candidate> updateCandidate(@PathVariable Long id, @RequestBody Candidate candidateDetails) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + id));
        if (candidate.getCandidateJobs() == null) {
            candidate.setCandidateJobs(new ArrayList<>());
        }

        log.info("candidateDetails {}",candidateDetails.toString());
        candidate.setFullName(candidateDetails.getFullName());
        candidate.setEmail(candidateDetails.getEmail());
        candidate.setPhoneNumber(candidateDetails.getPhoneNumber());
        candidate.setResumeContent(candidateDetails.getResumeContent());
        candidate.setResumeSummary(candidateDetails.getResumeSummary());
        candidate.setResumeFileUrl(candidateDetails.getResumeFileUrl());
        candidate.setJobTitle(candidateDetails.getJobTitle());
        candidate.setSalary(candidateDetails.getSalary());
        candidate.setLanguage(candidateDetails.getLanguage());
        candidate.setLocation(candidateDetails.getLocation());
        candidate.setWorkMode(candidateDetails.getWorkMode());
        candidate.setPreferredRole(candidateDetails.getPreferredRole());
        candidate.setPreferredLocations(candidateDetails.getPreferredLocations());
        candidate.setSkills(candidateDetails.getSkills());

        return ResponseEntity.ok(candidateRepository.save(candidate));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCandidate(@PathVariable Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + id));

        candidateRepository.delete(candidate);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<Candidate>> searchCandidates(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long tenantId) {

        if (name != null && tenantId != null) {
            return ResponseEntity.ok(tenantCandidateRepository.findCandidatesByTenantIdAndNameContaining(tenantId, name));
        } else if (name != null) {
            return ResponseEntity.ok(candidateRepository.findByFullNameContainingIgnoreCase(name));
        } else if (tenantId != null) {
            return ResponseEntity.ok(tenantCandidateRepository.findCandidatesByTenantId(tenantId));
        } else {
            return ResponseEntity.ok(candidateRepository.findAll());
        }
    }
    @GetMapping("/{jobId}/candidates")
    public ResponseEntity<List<Candidate>> getCandidatesByJobAndTenant(
            @PathVariable UUID jobId,
            @RequestParam Long tenantId
    ) {
        List<Candidate> candidates = jobService.getCandidatesByJobIdAndTenant(jobId, tenantId);
        return ResponseEntity.ok(candidates);
    }
}