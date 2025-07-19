package com.screening.interviews.service;

import com.screening.interviews.dto.*;
import com.screening.interviews.model.*;
import com.screening.interviews.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OfferLetterService {

    private final OfferLetterRepository offerLetterRepository;
    private final ApprovalService approvalService;
    private final NotificationService notificationService;
    private final OfferTemplateService offerTemplateService;

    public OfferLetterDTO createOffer(CreateOfferRequest request, Long createdById) {
        OfferLetter offer = new OfferLetter();
        offer.setCandidateId(request.getCandidateId());
        offer.setCreatedBy(createdById);
        offer.setOfferContent(request.getOfferContent());
        offer.setStatus(OfferLetter.OfferStatus.DRAFT);

        offer = offerLetterRepository.save(offer);

        return convertToDTO(offer);
    }

    public OfferLetterDTO createOfferFromTemplate(CreateOfferFromTemplateRequest request, Long createdById) {
        // Process template with customizations
        String processedContent = offerTemplateService.processTemplateWithCustomizations(
                request.getTemplateId(), request.getCustomizations());

        OfferLetter offer = new OfferLetter();
        offer.setCandidateId(request.getCandidateId());
        offer.setCreatedBy(createdById);
        offer.setOfferContent(processedContent);
        offer.setStatus(OfferLetter.OfferStatus.DRAFT);

        offer = offerLetterRepository.save(offer);

        return convertToDTO(offer);
    }

    public OfferLetterDTO updateOffer(Long offerId, CreateOfferRequest request, Long updatedById) {
        OfferLetter offer = getOfferEntity(offerId);

        if (offer.getStatus() != OfferLetter.OfferStatus.DRAFT) {
            throw new RuntimeException("Can only edit offers in DRAFT status");
        }

        offer.setOfferContent(request.getOfferContent());
        offer = offerLetterRepository.save(offer);

        return convertToDTO(offer);
    }

    public OfferLetterDTO submitForApproval(Long offerId, Long submitterId, String submitterRole,
                                            ApprovalWorkflowRequest workflowRequest) {
        OfferLetter offer = getOfferEntity(offerId);

        if (offer.getStatus() != OfferLetter.OfferStatus.DRAFT) {
            throw new RuntimeException("Can only submit offers in DRAFT status");
        }

        offer.setStatus(OfferLetter.OfferStatus.PENDING_APPROVAL);
        offer = offerLetterRepository.save(offer);

        // Initialize approval workflow with provided approvers
        if (workflowRequest != null && workflowRequest.getApprovalSteps() != null) {
            approvalService.initializeCustomApprovalWorkflow(offer, workflowRequest.getApprovalSteps());
        } else {
            approvalService.initializeDefaultApprovalWorkflow(offer);
        }

        return convertToDTO(offer);
    }

    public OfferLetterDTO getOffer(Long offerId) {
        OfferLetter offer = getOfferEntity(offerId);
        return convertToDTO(offer);
    }

    public List<OfferSummaryDTO> getAllOffers() {
        return offerLetterRepository.findAll().stream()
                .map(this::convertToSummaryDTO)
                .collect(Collectors.toList());
    }

    public List<OfferSummaryDTO> getOffersByStatus(OfferLetter.OfferStatus status) {
        return offerLetterRepository.findByStatus(status).stream()
                .map(this::convertToSummaryDTO)
                .collect(Collectors.toList());
    }

    public List<OfferSummaryDTO> getOffersByCreator(Long createdById) {
        return offerLetterRepository.findByCreatedBy(createdById).stream()
                .map(this::convertToSummaryDTO)
                .collect(Collectors.toList());
    }

    public void markOfferReadyForSignature(Long offerId) {
        OfferLetter offer = getOfferEntity(offerId);
        offer.setStatus(OfferLetter.OfferStatus.READY_FOR_SIGN);
        offerLetterRepository.save(offer);

        // Send notification to candidate
        notificationService.sendOfferToCandidate(offer);
    }

    public void markOfferSigned(Long offerId, String signedPdfUrl) {
        OfferLetter offer = getOfferEntity(offerId);
        offer.setStatus(OfferLetter.OfferStatus.SIGNED);
        offer.setSignedPdfUrl(signedPdfUrl);
        offerLetterRepository.save(offer);
    }

    public void markOfferRejected(Long offerId, String reason) {
        OfferLetter offer = getOfferEntity(offerId);
        offer.setStatus(OfferLetter.OfferStatus.REJECTED);
        offerLetterRepository.save(offer);
    }

    private OfferLetter getOfferEntity(Long offerId) {
        return offerLetterRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found"));
    }

    private OfferLetterDTO convertToDTO(OfferLetter offer) {
        OfferLetterDTO dto = new OfferLetterDTO();
        dto.setId(offer.getId());
        dto.setCandidateId(offer.getCandidateId());
        dto.setCreatedBy(offer.getCreatedBy());
        dto.setStatus(offer.getStatus());
        dto.setOfferContent(offer.getOfferContent());
        dto.setSignedPdfUrl(offer.getSignedPdfUrl());
        dto.setCreatedAt(offer.getCreatedAt());
        dto.setUpdatedAt(offer.getUpdatedAt());

        if (offer.getApprovals() != null) {
            dto.setApprovals(offer.getApprovals().stream()
                    .map(this::convertApprovalToDTO)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    private OfferApprovalDTO convertApprovalToDTO(OfferApproval approval) {
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

    private OfferSummaryDTO convertToSummaryDTO(OfferLetter offer) {
        OfferSummaryDTO dto = new OfferSummaryDTO();
        dto.setId(offer.getId());
        dto.setCandidateId(offer.getCandidateId());
        dto.setStatus(offer.getStatus());
        dto.setCreatedBy(offer.getCreatedBy());
        dto.setCreatedAt(offer.getCreatedAt());

        if (offer.getApprovals() != null) {
            dto.setTotalApprovalsCount(offer.getApprovals().size());
            dto.setPendingApprovalsCount((int) offer.getApprovals().stream()
                    .filter(a -> a.getStatus() == OfferApproval.ApprovalStatus.PENDING)
                    .count());
        }

        return dto;
    }
}