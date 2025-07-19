package com.screening.interviews.repo;

import com.screening.interviews.model.Signature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SignatureRepository extends JpaRepository<Signature, Long> {
    Optional<Signature> findByOfferId(Long offerId);
    List<Signature> findByCandidateId(Long candidateId);
}
