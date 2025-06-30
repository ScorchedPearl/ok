package com.screening.interviews.model;

import jakarta.persistence.*;
import lombok.*;
import org.apache.catalina.User;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tenant_candidates",
        uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "user_id"}))
@Getter
@Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TenantCandidate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @ManyToOne
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @Column(name = "relationship_type")
    private String relationshipType; // "APPLIED", "HIRED", etc.

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}