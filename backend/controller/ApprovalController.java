package com.screening.interviews.controller;

import com.screening.interviews.dto.*;
import com.screening.interviews.model.OfferLetter;
import com.screening.interviews.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;


@RestController
@RequestMapping("/api/approvals")
@RequiredArgsConstructor
public class ApprovalController {

    private final ApprovalService approvalService;

    @PostMapping("/{id}/action")
    public ResponseEntity<OfferApprovalDTO> processApproval(
            @PathVariable Long id,
            @RequestBody ApprovalActionRequest request,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String userRole) {
        OfferApprovalDTO approval = approvalService.processApproval(id, request, userId, userRole);
        return ResponseEntity.ok(approval);
    }

    @PostMapping("/offer/{offerId}/approve")
    public ResponseEntity<OfferApprovalDTO> approveOfferByOfferId(
            @PathVariable Long offerId,
            @RequestBody ApprovalActionRequest request,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String userRole) {
        OfferApprovalDTO approval = approvalService.processApprovalByOfferId(offerId, request, userId, userRole);
        return ResponseEntity.ok(approval);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<OfferApprovalDTO>> getPendingApprovals(
            @RequestHeader("X-User-Id") Long userId) {
        List<OfferApprovalDTO> approvals = approvalService.getPendingApprovals(userId);
        return ResponseEntity.ok(approvals);
    }

    @GetMapping("/pending/detailed")
    public ResponseEntity<List<PendingApprovalDetailDTO>> getPendingApprovalsWithOfferDetails(
            @RequestHeader("X-User-Id") Long userId) {
        List<PendingApprovalDetailDTO> approvals = approvalService.getPendingApprovalsWithDetails(userId);
        return ResponseEntity.ok(approvals);
    }

    @GetMapping("/offer/{offerId}")
    public ResponseEntity<List<OfferApprovalDTO>> getOfferApprovals(@PathVariable Long offerId) {
        List<OfferApprovalDTO> approvals = approvalService.getOfferApprovals(offerId);
        return ResponseEntity.ok(approvals);
    }

    @GetMapping("/my-approvals")
    public ResponseEntity<List<OfferApprovalDTO>> getMyApprovals(
            @RequestHeader("X-User-Id") Long userId) {
        List<OfferApprovalDTO> approvals = approvalService.getAllApprovalsForUser(userId);
        return ResponseEntity.ok(approvals);
    }

    @PostMapping("/offer/{offerId}/add-approver")
    public ResponseEntity<OfferApprovalDTO> addApprover(
            @PathVariable Long offerId,
            @RequestParam Long approverId,
            @RequestParam String approverRole,
            @RequestParam Integer order) {
        OfferApprovalDTO approval = approvalService.addApprover(offerId, approverId, approverRole, order);
        return ResponseEntity.ok(approval);
    }
}