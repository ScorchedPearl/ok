package com.screening.interviews.repo;

import com.screening.interviews.model.*;
import com.screening.interviews.model.OfferTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OfferTemplateRepository extends JpaRepository<OfferTemplate, Long> {
    List<OfferTemplate> findByIsActiveTrue();
    List<OfferTemplate> findByCategoryAndIsActiveTrue(String category);
    List<OfferTemplate> findByCreatedByAndIsActiveTrue(Long createdById);
    List<OfferTemplate> findByCategory(String category);
}