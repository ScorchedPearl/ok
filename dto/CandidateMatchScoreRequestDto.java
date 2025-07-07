package com.screening.interviews.dto;

public class CandidateMatchScoreRequestDto {
    private String jobDescription;
    private String resume;

    // Getters and setters
    public String getJobDescription() {
        return jobDescription;
    }

    public void setJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
    }

    public String getResume() {
        return resume;
    }

    public void setResume(String resume) {
        this.resume = resume;
    }
}
