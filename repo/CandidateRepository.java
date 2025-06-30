package com.screening.interviews.repo;

import com.screening.interviews.model.Candidate;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    Optional<Candidate> findByUserId(Long userId);
    Optional<Candidate> findByEmail(String email);
    List<Candidate> findByFullNameContainingIgnoreCase(String name);
    @NotNull
    Optional<Candidate> findById(Long id);


//    Optional<Candidate> = findByˀˀ
    // Remove the findByTenantIdAndFullNameContainingIgnoreCase method
}