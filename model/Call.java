package com.screening.interviews.model;

import com.screening.interviews.enums.CallStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Setter
@Getter
@Entity
@Table(name = "calls")
public class Call {

    // Getters and setters
    @Id
    @GeneratedValue
    private UUID callId;

    @Column(name = "mobile_number")
    private String mobileNumber;

    @Column(columnDefinition = "text")
    private String remark;

    @Column(name = "scheduled_at", nullable = false)
    private String scheduledAt;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CallStatus status;

    @Column(name = "job_id", nullable = false)
    private UUID jobId;

    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    // Constructors, getters, and setters

    public Call() {
    }

    @OneToMany(mappedBy = "call", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Transcript> transcripts = new ArrayList<>();

    @Column(name = "summary", columnDefinition = "text", nullable = true)
    private String summary;
}