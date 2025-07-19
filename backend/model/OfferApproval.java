package com.screening.interviews.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;
@Entity
@Table(name = "offer_approvals")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OfferApproval {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offer_id", nullable = false)
    private OfferLetter offer;

    @Column(nullable = false)
    private Long approverId; // User ID from auth service

    @Column(nullable = false)
    private String approverRole; // Role from auth service

    @Column(nullable = false)
    private Integer approvalOrder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus status = ApprovalStatus.PENDING;

    @Column(columnDefinition = "text")
    private String comment;

    private LocalDateTime actionTimestamp;

    public enum ApprovalStatus {
        PENDING, APPROVED, REJECTED, SKIPPED
    }
}