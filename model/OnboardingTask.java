package com.screening.interviews.model;

import com.screening.interviews.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "onboarding_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnboardingTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "task_id")
    private Long taskId;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;

    @Column(name = "job_id", nullable = false)
    private UUID jobId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private TaskStatus status = TaskStatus.PENDING;

    @Column(name = "priority", length = 20)
    private String priority;

    @Column(name = "sequence_order")
    private Integer sequenceOrder;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "assigned_by", nullable = false)
    private Long assignedBy;

    @Column(name = "assigned_at", nullable = false)
    @CreationTimestamp
    private LocalDateTime assignedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "completed_by")
    private Long completedBy;

    @Column(name = "notes", columnDefinition = "text")
    private String notes;
    @Column(name = "is_mandatory", nullable = false)
    @Builder.Default
    private Boolean isMandatory = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", insertable = false, updatable = false)
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", insertable = false, updatable = false)
    private Job job;

    @PrePersist
    public void prePersist() {
        this.assignedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = TaskStatus.PENDING;
        }
        if (this.isMandatory == null) {
            this.isMandatory = true;
        }
    }

    public void markAsCompleted(Long completedByUserId) {
        this.status = TaskStatus.COMPLETED;
        this.completedAt = LocalDateTime.now();
        this.completedBy = completedByUserId;
    }

    public void markAsPending() {
        this.status = TaskStatus.PENDING;
        this.completedAt = null;
        this.completedBy = null;
    }

    public boolean isCompleted() {
        return TaskStatus.COMPLETED.equals(this.status);
    }

    public boolean isPending() {
        return TaskStatus.PENDING.equals(this.status);
    }

    public boolean isOverdue() {
        return this.dueDate != null &&
                this.dueDate.isBefore(LocalDateTime.now()) &&
                isPending();
    }
}