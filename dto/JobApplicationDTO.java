package com.screening.interviews.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class JobApplicationDTO {

    private UUID id;
    private Long candidateId;
    private String candidateName;
    private UUID jobId;
    private Long tenantId;
    private String status;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
    private Double matchScore;
    private Double experience;
    private List<String> skills;
    private String summary;

    public UUID getId() {
        return id;
    }
    public void setId(UUID id) {
        this.id = id;
    }
    public Long getCandidateId() { // Changed return type
        return candidateId;
    }
    public void setCandidateId(Long candidateId) {
        this.candidateId = candidateId;
    }
    public String getCandidateName() {
        return candidateName;
    }
    public void setCandidateName(String candidateName) {
        this.candidateName = candidateName;
    }
    public UUID getJobId() {
        return jobId;
    }
    public void setJobId(UUID jobId) {
        this.jobId = jobId;
    }
    public Long getTenantId() {
        return tenantId;
    }
    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }
    public void setAppliedAt(LocalDateTime appliedAt) {
        this.appliedAt = appliedAt;
    }
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    public Double getMatchScore() {
        return matchScore;
    }
    public void setMatchScore(Double matchScore) {
        this.matchScore = matchScore;
    }
    public Double getExperience() {
        return experience;
    }
    public void setExperience(Double experience) {
        this.experience = experience;
    }
    public List<String> getSkills() {
        return skills;
    }
    public void setSkills(List<String> skills) {
        this.skills = skills;
    }
    public String getSummary() {
        return summary;
    }
    public void setSummary(String summary) {
        this.summary = summary;
    }
}