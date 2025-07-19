package com.screening.interviews.service;


import com.screening.interviews.dto.*;
import com.screening.interviews.model.*;
import com.screening.interviews.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ApprovalService {

    private final OfferApprovalRepository offerApprovalRepository;
    private final OfferLetterRepository offerLetterRepository;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void initializeDefaultApprovalWorkflow(OfferLetter offer) {
        // Default approval chain can be configured here
        // For now, let's use a simple workflow that requires manual setup
    }

    public void initializeCustomApprovalWorkflow(OfferLetter offer, List<ApprovalWorkflowRequest.ApprovalStep> steps) {
        for (ApprovalWorkflowRequest.ApprovalStep step : steps) {
            OfferApproval approval = new OfferApproval();
            approval.setOffer(offer);
            approval.setApproverId(step.getApproverId());
            approval.setApproverRole(step.getApproverRole());
            approval.setApprovalOrder(step.getOrder());
            approval.setStatus(OfferApproval.ApprovalStatus.PENDING);

            offerApprovalRepository.save(approval);
        }

        // Notify first approver
        notifyNextApprover(offer);
    }

    public OfferApprovalDTO processApproval(Long approvalId, ApprovalActionRequest request, Long actorId, String actorRole) {
        OfferApproval approval = offerApprovalRepository.findById(approvalId)
                .orElseThrow(() -> new RuntimeException("Approval not found"));

        if (approval.getStatus() != OfferApproval.ApprovalStatus.PENDING) {
            throw new RuntimeException("Approval already processed");
        }

        if (!approval.getApproverId().equals(actorId)) {
            throw new RuntimeException("User not authorized to approve this offer");
        }

        approval.setStatus(request.getAction());
        approval.setComment(request.getComment());
        approval.setActionTimestamp(LocalDateTime.now());

        approval = offerApprovalRepository.save(approval);

        // Check if workflow is complete
        processWorkflowLogic(approval.getOffer());

        return convertToDTO(approval);
    }

    public List<OfferApprovalDTO> getPendingApprovals(Long approverId) {
        return offerApprovalRepository.findByApproverIdAndStatus(
                        approverId, OfferApproval.ApprovalStatus.PENDING)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public OfferApprovalDTO processApprovalByOfferId(Long offerId, ApprovalActionRequest request, Long actorId, String actorRole) {
        // Find the pending approval for this user and offer
        List<OfferApproval> pendingApprovals = offerApprovalRepository
                .findByOfferIdAndApproverIdAndStatus(offerId, actorId, OfferApproval.ApprovalStatus.PENDING);

        if (pendingApprovals.isEmpty()) {
            throw new RuntimeException("No pending approval found for user " + actorId + " on offer " + offerId);
        }

        if (pendingApprovals.size() > 1) {
            throw new RuntimeException("Multiple pending approvals found - please use specific approval ID");
        }

        OfferApproval approval = pendingApprovals.get(0);

        // Process the approval
        approval.setStatus(request.getAction());
        approval.setComment(request.getComment());
        approval.setActionTimestamp(LocalDateTime.now());

        approval = offerApprovalRepository.save(approval);

        // Check if workflow is complete
        processWorkflowLogic(approval.getOffer());

        return convertToDTO(approval);
    }

    public List<PendingApprovalDetailDTO> getPendingApprovalsWithDetails(Long approverId) {
        return offerApprovalRepository.findByApproverIdAndStatus(
                        approverId, OfferApproval.ApprovalStatus.PENDING)
                .stream()
                .map(this::convertToDetailedDTO)
                .collect(Collectors.toList());
    }

    public List<OfferApprovalDTO> getOfferApprovals(Long offerId) {
        return offerApprovalRepository.findByOfferIdOrderByApprovalOrder(offerId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<OfferApprovalDTO> getAllApprovalsForUser(Long approverId) {
        return offerApprovalRepository.findByApproverId(approverId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private PendingApprovalDetailDTO convertToDetailedDTO(OfferApproval approval) {
        PendingApprovalDetailDTO dto = new PendingApprovalDetailDTO();
        dto.setApprovalId(approval.getId());
        dto.setOfferId(approval.getOffer().getId());
        dto.setApproverId(approval.getApproverId());
        dto.setApproverRole(approval.getApproverRole());
        dto.setApprovalOrder(approval.getApprovalOrder());
        dto.setComment(approval.getComment());
        dto.setCreatedAt(approval.getOffer().getCreatedAt());

        // Add offer details for context
        OfferLetter offer = approval.getOffer();
        dto.setCandidateId(offer.getCandidateId());
        dto.setCreatedBy(offer.getCreatedBy());
        dto.setOfferStatus(offer.getStatus().toString());

        // Parse offer content to extract key details
        try {
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> offerData = mapper.readValue(offer.getOfferContent(), Map.class);
            dto.setCandidateName((String) offerData.get("candidateName"));
            dto.setPosition((String) offerData.get("position"));
            dto.setSalary((String) offerData.get("salary"));

            // Create summary
            String summary = String.format("Position: %s | Salary: %s | Candidate: %s",
                    dto.getPosition(), dto.getSalary(), dto.getCandidateName());
            dto.setOfferSummary(summary);
        } catch (Exception e) {
            dto.setOfferSummary("Offer details available in full content");
        }

        return dto;
    }

    public OfferApprovalDTO addApprover(Long offerId, Long approverId, String approverRole, Integer order) {
        OfferLetter offer = offerLetterRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        OfferApproval approval = new OfferApproval();
        approval.setOffer(offer);
        approval.setApproverId(approverId);
        approval.setApproverRole(approverRole);
        approval.setApprovalOrder(order);
        approval.setStatus(OfferApproval.ApprovalStatus.PENDING);

        approval = offerApprovalRepository.save(approval);

        return convertToDTO(approval);
    }

    private void processWorkflowLogic(OfferLetter offer) {
        List<OfferApproval> approvals = offerApprovalRepository.findByOfferIdOrderByApprovalOrder(offer.getId());

        // Check if any approval was rejected
        boolean hasRejection = approvals.stream()
                .anyMatch(a -> a.getStatus() == OfferApproval.ApprovalStatus.REJECTED);

        if (hasRejection) {
            // Mark offer as rejected directly
            offer.setStatus(OfferLetter.OfferStatus.REJECTED);
            offerLetterRepository.save(offer);
            return;
        }

        // Check if all approvals are complete
        boolean allApproved = approvals.stream()
                .allMatch(a -> a.getStatus() == OfferApproval.ApprovalStatus.APPROVED ||
                        a.getStatus() == OfferApproval.ApprovalStatus.SKIPPED);

        if (allApproved) {
            // Mark offer ready for signature directly
            offer.setStatus(OfferLetter.OfferStatus.READY_FOR_SIGN);
            offerLetterRepository.save(offer);

            // Send notification to candidate
            notificationService.sendOfferToCandidate(offer);
        } else {
            // Notify next approver
            notifyNextApprover(offer);
        }
    }

    private void notifyNextApprover(OfferLetter offer) {
        List<OfferApproval> pendingApprovals = offerApprovalRepository
                .findByOfferIdAndStatus(offer.getId(), OfferApproval.ApprovalStatus.PENDING);

        if (!pendingApprovals.isEmpty()) {
            // Find the next approver in order
            OfferApproval nextApproval = pendingApprovals.stream()
                    .min((a1, a2) -> a1.getApprovalOrder().compareTo(a2.getApprovalOrder()))
                    .orElse(null);

            if (nextApproval != null) {
                notificationService.sendApprovalNotification(nextApproval);
            }
        }
    }

    private OfferApprovalDTO convertToDTO(OfferApproval approval) {
        OfferApprovalDTO dto = new OfferApprovalDTO();
        dto.setId(approval.getId());
        dto.setOfferId(approval.getOffer().getId());
        dto.setApproverId(approval.getApproverId());
        dto.setApproverRole(approval.getApproverRole());
        dto.setApprovalOrder(approval.getApprovalOrder());
        dto.setStatus(approval.getStatus());
        dto.setComment(approval.getComment());
        dto.setActionTimestamp(approval.getActionTimestamp());
        return dto;
    }
}
