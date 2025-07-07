package com.screening.interviews.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "call_question_mappings")
public class CallQuestionMapping {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "call_id", nullable = false)
    private UUID callId;

    @Column(name = "question_id", nullable = false)
    private UUID questionId;

    @Column(name = "sequence_order")
    private Integer sequenceOrder;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    // Constructors, getters, and setters

    public CallQuestionMapping() {
    }

    // Getters and setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getCallId() {
        return callId;
    }

    public void setCallId(UUID callId) {
        this.callId = callId;
    }

    public UUID getQuestionId() {
        return questionId;
    }

    public void setQuestionId(UUID questionId) {
        this.questionId = questionId;
    }

    public Integer getSequenceOrder() {
        return sequenceOrder;
    }

    public void setSequenceOrder(Integer sequenceOrder) {
        this.sequenceOrder = sequenceOrder;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
}