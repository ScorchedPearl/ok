package com.screening.interviews.repo;

import com.screening.interviews.model.OfferLetter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OfferLetterRepository extends JpaRepository<OfferLetter, Long> {
    List<OfferLetter> findByStatus(OfferLetter.OfferStatus status);
    List<OfferLetter> findByCreatedBy(Long createdById);
}
