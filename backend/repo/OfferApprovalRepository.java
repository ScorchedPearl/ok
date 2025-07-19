package com.screening.interviews.repo;

import com.screening.interviews.model.OfferApproval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface OfferApprovalRepository extends JpaRepository<OfferApproval, Long> {
    List<OfferApproval> findByOfferIdOrderByApprovalOrder(Long offerId);
    List<OfferApproval> findByApproverIdAndStatus(Long approverId, OfferApproval.ApprovalStatus status);
    List<OfferApproval> findByOfferIdAndStatus(Long offerId, OfferApproval.ApprovalStatus status);
    List<OfferApproval> findByApproverId(Long approverId);
    List<OfferApproval> findByOfferIdAndApproverIdAndStatus(Long offerId, Long approverId, OfferApproval.ApprovalStatus status);
}