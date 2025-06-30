package com.screening.interviews.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

public class ImprovementAnalysisDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImprovementAnalysisRequest {
        private String resume;
        private String interviewTranscript;
        private String interviewerFeedback;
        private String jobDescription;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImprovementAnalysisResponse {
        private int candidateScore;
        private String overallAssessment;
        private List<SkillAnalysis> skillAnalysis;
        private List<ImprovementSuggestion> improvementSuggestions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillAnalysis {
        private String skillArea;
        private String currentLevel;
        private String status;
        private String description;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImprovementSuggestion {
        private String skillArea;
        private String priority;
        private String description;
        private String howToImprove;
        private List<YoutubeLink> youtubeLinks;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class YoutubeLink {
        private String title;
        private String url;
        private String channel;
        private String duration;
    }
}
