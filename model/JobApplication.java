package com.screening.interviews.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Entity
@Table(name = "job_applications")
public class JobApplication {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "candidate_id")
    private Long candidateId;

    // New field for candidate name
    @Column(name = "candidate_name", nullable = false, length = 255)
    private String candidateName;

    @Column(name = "candidate_phone_number", nullable = false, length = 255)
    private String candidatePhone;

    @Column(name = "candidate_email", nullable = false, length = 255)
    private String candidateEmail;

    @ManyToOne
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Column(name = "tenant_id")
    private Long tenantId;

    @Column(length = 50)
    private String status;

    @Column(name = "applied_at")
    @Temporal(TemporalType.TIMESTAMP)
    @CreationTimestamp
    private LocalDateTime appliedAt;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        appliedAt = LocalDateTime.now();
        updatedAt = appliedAt;
    }

    @Column(name = "match_score")
    private Double matchScore;

    @Column(name = "experience")
    private Double experience;

    @ElementCollection
    @CollectionTable(name = "job_application_skills", joinColumns = @JoinColumn(name = "job_application_id"))
    @Column(name = "skill")
    private List<String> skills;

    @Column(name = "summary", length = 10000)
    private String summary;

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

}