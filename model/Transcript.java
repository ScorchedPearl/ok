package com.screening.interviews.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "transcripts")
public class Transcript {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "call_id", nullable = false)
    private Call call;

    @Column(name = "call_id_ref", nullable = false)  // Store the actual callId from transcript
    private String callIdRef;

    @Column(nullable = false)
    private String speaker;

    @Column(columnDefinition = "text", nullable = false)
    private String content;

    @Column(name = "message_timestamp")  // Store the timestamp from transcript
    private LocalDateTime messageTimestamp;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Transcript() {
    }
}