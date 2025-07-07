package com.screening.interviews.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.screening.interviews.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AIFeedbackService {
    private static final Logger logger = LoggerFactory.getLogger(AIFeedbackService.class);
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private String geminiApiKey = "AIzaSyCcTsDBMal4lRkGCjxy6dIwFcaWGRG4ntU";

    public AIFeedbackService(WebClient webClient, ObjectMapper objectMapper) {
        this.webClient = webClient;
        this.objectMapper = objectMapper;
    }

    public List<String> generateFeedbackTemplates(String prompt, String feedbackMethod) {
        String apiRequest = "ai".equalsIgnoreCase(feedbackMethod)
                ? buildGeminiRequestAI(prompt)
                : buildGeminiRequestManual(prompt);

        try {
            String response = webClient.post()
                    .uri("/v1beta/models/gemini-1.5-flash:generateContent")
                    .header("Content-Type", "application/json")
                    .header("x-goog-api-key", geminiApiKey)
                    .bodyValue(apiRequest)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            logger.info("Gemini API response received");
            return parseFeedbackTemplates(response);
        } catch (Exception e) {
            logger.error("Error generating feedback templates: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    private String buildGeminiRequestAI(String jobDescription) {
        String escapedJobDescription = jobDescription.replace("\"", "\\\"");

        return String.format("""
            {
                "contents": [{
                    "parts": [{
                        "text": "Generate a JSON object containing an array of feedback templates for this job description. The response must be ONLY valid JSON without backticks, markdown formatting, or explanations. Each template should have an id, name, and fields array with name, label, icon, type, placeholder, and validation properties. Job Description: %s"
                    }]
                }]
            }
            """, escapedJobDescription);
    }

    private String buildGeminiRequestManual(String questions) {
        String escapedQuestions = questions.replace("\"", "\\\"");

        return String.format("""
            {
                "contents": [{
                    "parts": [{
                        "text": "Convert these questions into a JSON object containing an array of feedback templates. The response must be ONLY valid JSON without backticks, markdown formatting, or explanations. Each template should have an id, name, and fields array with name, label, icon, type, placeholder, and validation properties. Questions: %s"
                    }]
                }]
            }
            """, escapedQuestions);
    }

    private List<String> parseFeedbackTemplates(String response) throws Exception {
        List<String> templates = new ArrayList<>();

        try {
            // First clean the response
            String cleanedResponse = cleanResponse(response);

            // Parse the cleaned response
            JsonNode root = objectMapper.readTree(cleanedResponse);
            String jsonContent = root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text")
                    .asText();

            // Further clean the actual JSON content
            jsonContent = cleanJsonContent(jsonContent);

            // Try to parse the content
            JsonNode parsedContent = objectMapper.readTree(jsonContent);

            // Handle both possible response formats
            JsonNode feedbackTemplates;
            if (parsedContent.has("feedbackTemplates")) {
                feedbackTemplates = parsedContent.path("feedbackTemplates");
            } else if (parsedContent.isArray()) {
                feedbackTemplates = parsedContent;
            } else {
                logger.warn("Unexpected JSON structure, trying to adapt");
                feedbackTemplates = objectMapper.createArrayNode().add(parsedContent);
            }

            if (feedbackTemplates.isArray()) {
                for (JsonNode template : feedbackTemplates) {
                    // Create properly structured template
                    ObjectNode wrapper = objectMapper.createObjectNode();
                    wrapper.putArray("feedbackTemplates").add(template);
                    templates.add(objectMapper.writeValueAsString(wrapper));
                }
            }
        } catch (Exception e) {
            logger.error("Error parsing feedback templates: {}", e.getMessage());
            templates.add(createDefaultTemplate());
        }

        return templates.isEmpty() ? List.of(createDefaultTemplate()) : templates;
    }

    /**
     * Generates a summary of a resume from its full content
     *
     * @param resumeContent The full content of the resume
     * @return A concise summary of the resume highlighting key skills, experience, and qualifications
     */
    public String generateResumeSummary(String resumeContent) {
        if (resumeContent == null || resumeContent.trim().isEmpty()) {
            logger.warn("Empty resume content provided for summary generation");
            return "No resume content available to summarize.";
        }

        String apiRequest = buildGeminiRequestResumeSummary(resumeContent);

        try {
            String response = webClient.post()
                    .uri("/v1beta/models/gemini-1.5-flash:generateContent")
                    .header("Content-Type", "application/json")
                    .header("x-goog-api-key", geminiApiKey)
                    .bodyValue(apiRequest)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            logger.info("Gemini API response received for resume summary");
            return parseResumeSummary(response);
        } catch (Exception e) {
            logger.error("Error generating resume summary: {}", e.getMessage(), e);
            return "Failed to generate resume summary due to an error.";
        }
    }

    private String buildGeminiRequestResumeSummary(String resumeContent) {
        String escapedResumeContent = resumeContent.replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");

        return String.format("""
            {
                "contents": [{
                    "parts": [{
                        "text": "Create a concise and professional summary of this resume. Focus on highlighting key skills, experience, and qualifications in a format that would be useful for interviewers. Limit the summary to 200-300 words. Resume Content: %s"
                    }]
                }]
            }
            """, escapedResumeContent);
    }

    private String parseResumeSummary(String response) {
        try {
            // Parse the response
            JsonNode root = objectMapper.readTree(response);
            String summary = root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text")
                    .asText();

            return summary != null && !summary.trim().isEmpty()
                    ? summary.trim()
                    : "No summary could be generated from the resume.";
        } catch (Exception e) {
            logger.error("Error parsing resume summary response: {}", e.getMessage());
            return "An error occurred while processing the resume summary.";
        }
    }

    private String cleanResponse(String response) {
        if (response == null) return "{}";

        // Remove any markdown code block indicators
        response = response.replaceAll("```json", "")
                .replaceAll("```", "")
                .trim();

        return response;
    }

    private String cleanJsonContent(String content) {
        if (content == null) return "{}";

        // Remove code blocks, backticks, and invalid characters
        content = content.replaceAll("```json", "")
                .replaceAll("```", "")
                .replaceAll("`", "")
                .trim();

        // Remove any comments
        content = content.replaceAll("//.*\\n", "")
                .replaceAll("/\\*.*?\\*/", "")
                .trim();

        // If content starts with a newline or spaces, trim them
        while (content.startsWith("\\n") || content.startsWith("\n")) {
            content = content.substring(2).trim();
        }

        return content;
    }

    private String createDefaultTemplate() {
        return """
            {
                "feedbackTemplates": [
                    {
                        "id": "1",
                        "name": "General Feedback",
                        "fields": [
                            {
                                "name": "generalFeedback",
                                "label": "Overall Assessment",
                                "icon": "Feedback",
                                "type": "textarea",
                                "placeholder": "Provide your feedback here...",
                                "validation": {
                                    "minLength": 10,
                                    "message": "Feedback must be at least 10 characters."
                                }
                            }
                        ]
                    }
                ]
            }
            """;
    }


    // java
    public SwotAnalysisResponseDto analyzeCandidateMatch(String jobDescription, String resume) {
        if ((jobDescription == null || jobDescription.trim().isEmpty()) ||
                (resume == null || resume.trim().isEmpty())) {
            logger.warn("Empty job description or resume provided for candidate SWOT analysis");
            return SwotAnalysisResponseDto.builder()
                    .strengths(List.of("No candidate details provided."))
                    .weaknesses(List.of("No candidate details provided."))
                    .opportunities(List.of("No candidate details provided."))
                    .threats(List.of("No candidate details provided."))
                    .summary("Insufficient data to generate SWOT analysis.")
                    .build();
        }

        String apiRequest = buildGeminiRequestCandidateSwot(jobDescription, resume);
        try {
            String response = webClient.post()
                    .uri("/v1beta/models/gemini-1.5-flash:generateContent")
                    .header("Content-Type", "application/json")
                    .header("x-goog-api-key", geminiApiKey)
                    .bodyValue(apiRequest)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            logger.info("Gemini API response received for candidate SWOT analysis");
            return parseCandidateSwot(response);
        } catch (Exception e) {
            logger.error("Error generating candidate SWOT analysis: {}", e.getMessage(), e);
            return SwotAnalysisResponseDto.builder()
                    .strengths(List.of("Error processing SWOT analysis."))
                    .weaknesses(List.of("Error processing SWOT analysis."))
                    .opportunities(List.of("Error processing SWOT analysis."))
                    .threats(List.of("Error processing SWOT analysis."))
                    .summary("Error processing SWOT analysis.")
                    .build();
        }
    }

    private String buildGeminiRequestCandidateSwot(String jobDescription, String resume) {
        String escapedJobDescription = jobDescription.replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
        String escapedResume = resume.replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
        return String.format("""
        {
            \"contents\": [{
                \"parts\": [{
                    \"text\": \"Perform a detailed SWOT analysis comparing the candidate's resume to the job description. Return a JSON object with keys \\\"strengths\\\", \\\"weaknesses\\\", \\\"opportunities\\\", \\\"threats\\\", and \\\"summary\\\". Job Description: %s Resume: %s\"
                }]
            }]
        }
        """, escapedJobDescription, escapedResume);
    }

    private SwotAnalysisResponseDto parseCandidateSwot(String response) {
        try {
            // Clean the raw response to remove unwanted characters such as backticks.
            String cleanedResponse = cleanResponse(response);
            // Read the Gemini JSON response.
            JsonNode root = objectMapper.readTree(cleanedResponse);
            JsonNode contentNode = root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text");
            // Clean the inner JSON content.
            String jsonContent = cleanJsonContent(contentNode.asText().trim());
            JsonNode parsed = objectMapper.readTree(jsonContent);

            List<String> strengths = new ArrayList<>();
            List<String> weaknesses = new ArrayList<>();
            List<String> opportunities = new ArrayList<>();
            List<String> threats = new ArrayList<>();
            String summary = "";

            if (parsed.has("strengths") && parsed.path("strengths").isArray()) {
                parsed.path("strengths").forEach(node -> strengths.add(node.asText()));
            }

            if (parsed.has("weaknesses") && parsed.path("weaknesses").isArray()) {
                parsed.path("weaknesses").forEach(node -> weaknesses.add(node.asText()));
            }

            if (parsed.has("opportunities") && parsed.path("opportunities").isArray()) {
                parsed.path("opportunities").forEach(node -> opportunities.add(node.asText()));
            }

            if (parsed.has("threats") && parsed.path("threats").isArray()) {
                parsed.path("threats").forEach(node -> threats.add(node.asText()));
            }

            if (parsed.has("summary")) {
                summary = parsed.path("summary").asText().trim();
            }

            return SwotAnalysisResponseDto.builder()
                    .strengths(!strengths.isEmpty() ? strengths : List.of("No strengths identified."))
                    .weaknesses(!weaknesses.isEmpty() ? weaknesses : List.of("No weaknesses identified."))
                    .opportunities(!opportunities.isEmpty() ? opportunities : List.of("No opportunities identified."))
                    .threats(!threats.isEmpty() ? threats : List.of("No threats identified."))
                    .summary(!summary.isEmpty() ? summary : "No summary available.")
                    .build();
        } catch (Exception e) {
            logger.error("Error parsing candidate SWOT response: {}", e.getMessage());
            return SwotAnalysisResponseDto.builder()
                    .strengths(List.of("Error processing SWOT analysis."))
                    .weaknesses(List.of("Error processing SWOT analysis."))
                    .opportunities(List.of("Error processing SWOT analysis."))
                    .threats(List.of("Error processing SWOT analysis."))
                    .summary("Error processing SWOT analysis.")
                    .build();
        }
    }

    private String buildGeminiRequestCandidateAnalysis(String jobDescription, String resume, String feedbackData) {
        // Validate and sanitize inputs
        jobDescription = sanitizeInput(jobDescription, "Job Description");
        resume = sanitizeInput(resume, "Resume");
        feedbackData = sanitizeInput(feedbackData, "Feedback Data");

        // Ensure proper JSON escaping
        String safeJobDescription = escapeJson(jobDescription);
        String safeResume = escapeJson(resume);
        String safeFeedbackData = escapeJson(feedbackData);

        // Construct the request with careful JSON formatting
        String jsonPayload = String.format("""
    {
      "contents": [
        {
          "parts": [
            {
              "text": "Generate a detailed candidate analysis. Analyze the candidate's fit for the job position.\\n\\nJob Description: %s\\n\\nResume: %s\\n\\nInterview Feedback: %s\\n\\nProvide a comprehensive JSON response with the following structure:\\n- overallSummary: string\\n- strengthsWeaknesses: {keyStrengths: [{area: string, details: string}], keyWeaknesses: [{area: string, details: string}]}\\n- fitAssessment: {cultureFit: integer between 1-100, technicalFit: integer between 1-100, growthPotential: integer between 1-100}\\n- recommendedAction: string\\n- confidenceScore: number in 1-100 based on profile"
            }
          ]
        }
      ]
    }
    """, safeJobDescription, safeResume, safeFeedbackData);

        // Validate JSON formatting
        try {
            // This will throw an exception if the JSON is invalid
            objectMapper.readTree(jsonPayload);
            logger.debug("JSON payload validated successfully");
        } catch (Exception e) {
            logger.error("Invalid JSON payload construction", e);
            throw new IllegalArgumentException("Failed to construct valid JSON payload", e);
        }

        return jsonPayload;
    }

    // Helper method to sanitize input
    private String sanitizeInput(String input, String fieldName) {
        if (input == null || input.trim().isEmpty()) {
            logger.warn("{} is null or empty. Using placeholder.", fieldName);
            return fieldName + " not provided";
        }

        // Truncate very long inputs
        int MAX_LENGTH = 5000;
        if (input.length() > MAX_LENGTH) {
            logger.warn("{} truncated to {} characters", fieldName, MAX_LENGTH);
            input = input.substring(0, MAX_LENGTH);
        }

        return input;
    }

    // Enhanced JSON escaping method
    private String escapeJson(String input) {
        if (input == null) return "";

        return input
                .replace("\\", "\\\\")  // Escape backslashes first
                .replace("\"", "\\\"")  // Escape double quotes
                .replace("\n", "\\n")   // Escape newlines
                .replace("\r", "\\r")   // Escape carriage returns
                .replace("\t", "\\t")   // Escape tabs
                .replaceAll("[\\p{Cntrl}]", "")  // Remove control characters
                .trim();
    }

    // Add a method to log the exact JSON payload before sending
    private void logSafeJsonPayload(String payload) {
        // Log a masked version of the payload to prevent sensitive data exposure
        if (payload != null && payload.length() > 100) {
            logger.debug("JSON Payload (first 100 chars): {}", payload.substring(0, 100) + "...");
        } else {
            logger.debug("JSON Payload: {}", payload);
        }
    }

    public AIAnalysisResponseDto generateCandidateAnalysis(String jobDescription, String resume, List<FeedbackResponseDto> feedbacks) {
        // Start of method logging
        logger.info("Starting generateCandidateAnalysis method");

        // Validate input parameters with detailed logging
        if (jobDescription == null || resume == null || feedbacks == null) {
            logger.warn("Candidate analysis failed - Missing critical data");
            logger.debug("Input validation details: " +
                            "Job Description Null: {}, " +
                            "Resume Null: {}, " +
                            "Feedbacks Null: {}",
                    jobDescription == null,
                    resume == null,
                    feedbacks == null);
            return createDefaultAnalysis();
        }

        // Log input data lengths for context (without exposing full content)
        logger.debug("Candidate Analysis Inputs - " +
                        "Job Description Length: {}, " +
                        "Resume Length: {}, " +
                        "Feedback Count: {}",
                jobDescription.length(),
                resume.length(),
                feedbacks.size());

        // Convert feedback data to a condensed string format
        StringBuilder feedbackSummary = new StringBuilder();
        try {
            // Log feedback processing start
            logger.trace("Starting feedback data processing");

            for (FeedbackResponseDto feedback : feedbacks) {
                try {
                    // Log each feedback being processed
                    logger.debug("Processing Feedback for Interviewer ID: {}", feedback.getInterviewerId());

                    // Safely serialize feedback, protecting against serialization errors
                    String serializedFeedback;
                    try {
                        serializedFeedback = objectMapper.writeValueAsString(feedback.getFeedbackData());
                        logger.trace("Successfully serialized feedback data for Interviewer ID: {}", feedback.getInterviewerId());
                    } catch (JsonProcessingException serializationEx) {
                        logger.warn("Failed to serialize feedback data for Interviewer ID: {}. Using fallback.",
                                feedback.getInterviewerId(), serializationEx);
                        serializedFeedback = "Serialization failed";
                    }

                    feedbackSummary.append("Interviewer ").append(feedback.getInterviewerId())
                            .append(" Recommendation: ").append(feedback.getRecommendation())
                            .append(" Feedback: ").append(serializedFeedback)
                            .append("\n");

                    // Log each processed feedback
                    logger.debug("Processed Feedback - Interviewer: {}, Recommendation: {}",
                            feedback.getInterviewerId(),
                            feedback.getRecommendation());
                } catch (Exception innerE) {
                    // Log individual feedback processing errors
                    logger.error("Error processing feedback for Interviewer ID: {}",
                            feedback.getInterviewerId(), innerE);
                }
            }

            // Log the final feedback summary
            logger.debug("Feedback Summary Generated - Length: {}", feedbackSummary.length());
        } catch (Exception e) {
            // Comprehensive error logging for feedback processing
            logger.error("Comprehensive error in feedback data processing", e);
            feedbackSummary.append("Error processing feedback data");
        }

        // Prepare API request with logging
        String apiRequest;
        try {
            logger.info("Attempting to build Gemini API request");

            apiRequest = buildGeminiRequestCandidateAnalysis(
                    jobDescription,
                    resume,
                    feedbackSummary.toString()
            );

            // Log request details (without full sensitive content)
            logger.debug("Gemini API Request Prepared - " +
                            "Job Description Chars: {}, " +
                            "Resume Chars: {}, " +
                            "Feedback Summary Chars: {}",
                    jobDescription.length(),
                    resume.length(),
                    feedbackSummary.length());

            // Optional: Log a masked version of the request
            logger.trace("Gemini API Request (masked): {}",
                    apiRequest);
        } catch (Exception e) {
            logger.error("Failed to build Gemini API request", e);
            return createDefaultAnalysis();
        }

        try {
            logger.info("Sending request to Gemini API");

            String response = webClient.post()
                    .uri("/v1beta/models/gemini-1.5-flash:generateContent")
                    .header("Content-Type", "application/json")
                    .header("x-goog-api-key", geminiApiKey)
                    .bodyValue(apiRequest)
                    .retrieve()
                    .onStatus(
                            httpStatus -> httpStatus.is4xxClientError() || httpStatus.is5xxServerError(),
                            clientResponse -> {
                                // Log detailed error response
                                return clientResponse.bodyToMono(String.class)
                                        .flatMap(errorBody -> {
                                            logger.error("Gemini API Error Response - Status: {}, Body: {}",
                                                    clientResponse.statusCode(), errorBody);
                                            return Mono.error(new RuntimeException("API Error: " + errorBody));
                                        });
                            }
                    )
                    .bodyToMono(String.class)
                    .block();

            logger.info("Gemini API response received successfully");
            logger.debug("Response Length: {} characters",
                    response != null ? response.length() : 0);

            return parseCandidateAnalysis(response);
        } catch (Exception e) {
            logger.error("Comprehensive error in Gemini API call", e);

            // If it's a WebClientResponseException, log more details
            if (e instanceof WebClientResponseException) {
                WebClientResponseException wcre = (WebClientResponseException) e;
                logger.error("WebClient Error Details - Status: {}, Body: {}",
                        wcre.getStatusCode(), wcre.getResponseBodyAsString());
            }

            return createDefaultAnalysis();
        }
    }

    private String escapeAndTruncate(String input) {
        if (input == null) return "";

        // Truncate to a reasonable length
        int MAX_LENGTH = 5000; // Adjust as needed
        input = input.length() > MAX_LENGTH ? input.substring(0, MAX_LENGTH) : input;

        return input.replace("\"", "\\\"")
                .replace("\n", " ")
                .replace("\r", " ")
                .replace("\t", " ")
                .trim();
    }

    private AIAnalysisResponseDto parseCandidateAnalysis(String response) {
        try {
            // Clean the response
            String cleanedResponse = cleanResponse(response);

            // Parse the Gemini response
            JsonNode root = objectMapper.readTree(cleanedResponse);
            String jsonContent = root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text")
                    .asText();

            // Clean the JSON content
            jsonContent = cleanJsonContent(jsonContent);

            // Parse the actual analysis JSON
            JsonNode analysisJson = objectMapper.readTree(jsonContent);

            // Build strength and weakness lists
            List<AIAnalysisResponseDto.AreaDetail> keyStrengths = new ArrayList<>();
            if (analysisJson.has("strengthsWeaknesses") &&
                    analysisJson.path("strengthsWeaknesses").has("keyStrengths")) {

                JsonNode strengthsNode = analysisJson.path("strengthsWeaknesses").path("keyStrengths");
                for (JsonNode strength : strengthsNode) {
                    keyStrengths.add(AIAnalysisResponseDto.AreaDetail.builder()
                            .area(strength.path("area").asText())
                            .details(strength.path("details").asText())
                            .build());
                }
            }

            List<AIAnalysisResponseDto.AreaDetail> keyWeaknesses = new ArrayList<>();
            if (analysisJson.has("strengthsWeaknesses") &&
                    analysisJson.path("strengthsWeaknesses").has("keyWeaknesses")) {

                JsonNode weaknessesNode = analysisJson.path("strengthsWeaknesses").path("keyWeaknesses");
                for (JsonNode weakness : weaknessesNode) {
                    keyWeaknesses.add(AIAnalysisResponseDto.AreaDetail.builder()
                            .area(weakness.path("area").asText())
                            .details(weakness.path("details").asText())
                            .build());
                }
            }

            // Build fit assessment
            int cultureFit = 75;
            int technicalFit = 80;
            int growthPotential = 75;

            if (analysisJson.has("fitAssessment")) {
                JsonNode fitNode = analysisJson.path("fitAssessment");
                cultureFit = fitNode.path("cultureFit").asInt(cultureFit);
                technicalFit = fitNode.path("technicalFit").asInt(technicalFit);
                growthPotential = fitNode.path("growthPotential").asInt(growthPotential);
            }

            return AIAnalysisResponseDto.builder()
                    .overallSummary(analysisJson.path("overallSummary").asText("No summary available."))
                    .strengthsWeaknesses(AIAnalysisResponseDto.StrengthsWeaknesses.builder()
                            .keyStrengths(keyStrengths)
                            .keyWeaknesses(keyWeaknesses)
                            .build())
                    .fitAssessment(AIAnalysisResponseDto.FitAssessment.builder()
                            .cultureFit(cultureFit)
                            .technicalFit(technicalFit)
                            .growthPotential(growthPotential)
                            .build())
                    .recommendedAction(analysisJson.path("recommendedAction").asText("No recommended action."))
                    .confidenceScore(analysisJson.path("confidenceScore").asInt(85))
                    .build();
        } catch (Exception e) {
            logger.error("Error parsing candidate analysis response: {}", e.getMessage());
            return createDefaultAnalysis();
        }
    }

    private AIAnalysisResponseDto createDefaultAnalysis() {
        return AIAnalysisResponseDto.builder()
                .overallSummary("Unable to generate analysis due to insufficient data or processing error.")
                .strengthsWeaknesses(AIAnalysisResponseDto.StrengthsWeaknesses.builder()
                        .keyStrengths(List.of(
                                AIAnalysisResponseDto.AreaDetail.builder()
                                        .area("Technical Skills")
                                        .details("Based on available data.")
                                        .build()
                        ))
                        .keyWeaknesses(List.of(
                                AIAnalysisResponseDto.AreaDetail.builder()
                                        .area("Areas for Improvement")
                                        .details("Based on available data.")
                                        .build()
                        ))
                        .build())
                .fitAssessment(AIAnalysisResponseDto.FitAssessment.builder()
                        .cultureFit(75)
                        .technicalFit(75)
                        .growthPotential(75)
                        .build())
                .recommendedAction("Review candidate data and conduct additional assessment if needed.")
                .confidenceScore(50)
                .build();
    }


    /**
     * Calculates a percentage score representing how well the resume matches the job description
     * @param jobDescription The job description text
     * @param resumeContent The resume content
     * @return A percentage score between 0 and 100
     */
    public double calculateResumeJobMatchPercentage(String jobDescription, String resumeContent) {
        if (jobDescription == null || jobDescription.trim().isEmpty() ||
                resumeContent == null || resumeContent.trim().isEmpty()) {
            logger.warn("Empty job description or resume provided for match percentage calculation");
            return 0.0;
        }

        String apiRequest = buildGeminiRequestMatchScore(jobDescription, resumeContent);

        try {
            String response = webClient.post()
                    .uri("/v1beta/models/gemini-1.5-flash:generateContent")
                    .header("Content-Type", "application/json")
                    .header("x-goog-api-key", geminiApiKey)
                    .bodyValue(apiRequest)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            logger.info("Gemini API response received for match percentage calculation");
            return parseMatchPercentage(response);
        } catch (Exception e) {
            logger.error("Error calculating match percentage: {}", e.getMessage(), e);
            return 0.0;
        }
    }

    private String buildGeminiRequestMatchScore(String jobDescription, String resumeContent) {
        String escapedJobDescription = escapeAndTruncate(jobDescription);
        String escapedResume = escapeAndTruncate(resumeContent);

        return String.format("""
        {
            "contents": [{
                "parts": [{
                    "text": "Calculate a percentage score representing how well this candidate's resume matches the job description. Return ONLY a number between 0-100 without any explanation, text or formatting. Job Description: %s Resume: %s"
                }]
            }]
        }
        """, escapedJobDescription, escapedResume);
    }

    private double parseMatchPercentage(String response) {
        try {
            // Parse the response
            JsonNode root = objectMapper.readTree(response);
            String scoreText = root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text")
                    .asText();

            // Clean and parse the score
            scoreText = scoreText.trim().replaceAll("[^0-9.]", "");
            if (scoreText.isEmpty()) {
                return 0.0;
            }

            double score = Double.parseDouble(scoreText);
            // Ensure score is between 0 and 100
            return Math.min(Math.max(score, 0.0), 100.0);
        } catch (Exception e) {
            logger.error("Error parsing match percentage: {}", e.getMessage());
            return 0.0;
        }
    }

    /**
     * Provides detailed feedback about the match between resume and job description
     * @param jobDescription The job description text
     * @param resumeContent The resume content
     * @return A map containing different aspects of the match assessment
     */
    public Map<String, String> getMatchDetails(String jobDescription, String resumeContent) {
        if (jobDescription == null || jobDescription.trim().isEmpty() ||
                resumeContent == null || resumeContent.trim().isEmpty()) {
            logger.warn("Empty job description or resume provided for match details");
            return Map.of("error", "Job description and resume content are required");
        }

        String apiRequest = buildGeminiRequestMatchDetails(jobDescription, resumeContent);

        try {
            String response = webClient.post()
                    .uri("/v1beta/models/gemini-1.5-flash:generateContent")
                    .header("Content-Type", "application/json")
                    .header("x-goog-api-key", geminiApiKey)
                    .bodyValue(apiRequest)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            logger.info("Gemini API response received for match details");
            return parseMatchDetails(response);
        } catch (Exception e) {
            logger.error("Error generating match details: {}", e.getMessage(), e);
            return Map.of("error", "Failed to generate match details: " + e.getMessage());
        }
    }

    private String buildGeminiRequestMatchDetails(String jobDescription, String resumeContent) {
        String escapedJobDescription = escapeAndTruncate(jobDescription);
        String escapedResume = escapeAndTruncate(resumeContent);

        return String.format("""
        {
            "contents": [{
                "parts": [{
                    "text": "Analyze how well this resume matches the job description. Return a JSON object with these keys: 'strongSkills' (skills the candidate has that match the job), 'missingSkills' (important skills from the job description that the candidate lacks), and 'suggestedImprovements' (how the candidate could better position themselves for this role). Keep each section concise. Job Description: %s Resume: %s"
                }]
            }]
        }
        """, escapedJobDescription, escapedResume);
    }

    private Map<String, String> parseMatchDetails(String response) {
        try {
            // Clean the response
            String cleanedResponse = cleanResponse(response);

            // Parse the cleaned response
            JsonNode root = objectMapper.readTree(cleanedResponse);
            String jsonContent = root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text")
                    .asText();

            // Further clean the JSON content
            jsonContent = cleanJsonContent(jsonContent);

            // Parse the content
            JsonNode detailsNode = objectMapper.readTree(jsonContent);

            Map<String, String> details = new HashMap<>();

            if (detailsNode.has("strongSkills")) {
                details.put("strongSkills", detailsNode.path("strongSkills").asText());
            }
            if (detailsNode.has("missingSkills")) {
                details.put("missingSkills", detailsNode.path("missingSkills").asText());
            }
            if (detailsNode.has("suggestedImprovements")) {
                details.put("suggestedImprovements", detailsNode.path("suggestedImprovements").asText());
            }

            return details;
        } catch (Exception e) {
            logger.error("Error parsing match details: {}", e.getMessage());
            return Map.of("error", "Error parsing match details: " + e.getMessage());
        }
    }

    /**
     * Generates a paragraph summarizing the candidate's fit for the job position
     * @param jobDescription The job description text
     * @param resumeContent The resume content
     * @param matchPercentage The calculated match percentage
     * @return A descriptive paragraph about the candidate's fit
     */
    public String generateCandidateFitSummary(String jobDescription, String resumeContent, double matchPercentage) {
        if (jobDescription == null || jobDescription.trim().isEmpty() ||
                resumeContent == null || resumeContent.trim().isEmpty()) {
            logger.warn("Empty job description or resume provided for fit summary generation");
            return "Unable to generate fit summary due to insufficient information.";
        }

        String apiRequest = buildGeminiRequestFitSummary(jobDescription, resumeContent, matchPercentage);

        try {
            String response = webClient.post()
                    .uri("/v1beta/models/gemini-1.5-flash:generateContent")
                    .header("Content-Type", "application/json")
                    .header("x-goog-api-key", geminiApiKey)
                    .bodyValue(apiRequest)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            logger.info("Gemini API response received for fit summary");
            return parseFitSummary(response);
        } catch (Exception e) {
            logger.error("Error generating fit summary: {}", e.getMessage(), e);
            return "Failed to generate fit summary due to an error.";
        }
    }

    private String buildGeminiRequestFitSummary(String jobDescription, String resumeContent, double matchPercentage) {
        String escapedJobDescription = escapeAndTruncate(jobDescription);
        String escapedResume = escapeAndTruncate(resumeContent);

        return String.format("""
        {
            "contents": [{
                "parts": [{
                    "text": "Write a professional sentence assessing this candidate's fit for the job position. The candidate's resume has a %.1f%% match with the job requirements. Focus on specific qualifications, experiences, and skills from the resume that make the candidate suitable or unsuitable for this role. Be objective and balanced. Job Description: %s Resume: %s"
                }]
            }]
        }
        """, matchPercentage, escapedJobDescription, escapedResume);
    }

    private String parseFitSummary(String response) {
        try {
            // Parse the response
            JsonNode root = objectMapper.readTree(response);
            String summary = root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text")
                    .asText();

            return summary != null && !summary.trim().isEmpty()
                    ? summary.trim()
                    : "Unable to generate a fit summary for this candidate.";
        } catch (Exception e) {
            logger.error("Error parsing fit summary: {}", e.getMessage());
            return "An error occurred while generating the candidate fit summary.";
        }
    }

    /**
     * Extracts and returns an array of skills that match between the job description and resume
     *
     * @param jobDescription The job description text
     * @param resumeContent The resume content
     * @return An array of matching skills found in both the job description and resume
     */
    public String[] getMatchedSkills(String jobDescription, String resumeContent) {
        if (jobDescription == null || jobDescription.trim().isEmpty() ||
                resumeContent == null || resumeContent.trim().isEmpty()) {
            logger.warn("Empty job description or resume provided for matched skills extraction");
            return new String[0];
        }

        String apiRequest = buildGeminiRequestMatchedSkills(jobDescription, resumeContent);

        try {
            String response = webClient.post()
                    .uri("/v1beta/models/gemini-1.5-flash:generateContent")
                    .header("Content-Type", "application/json")
                    .header("x-goog-api-key", geminiApiKey)
                    .bodyValue(apiRequest)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            logger.info("Gemini API response received for matched skills extraction");
            return parseMatchedSkills(response);
        } catch (Exception e) {
            logger.error("Error extracting matched skills: {}", e.getMessage(), e);
            return new String[0];
        }
    }

    private String buildGeminiRequestMatchedSkills(String jobDescription, String resumeContent) {
        String escapedJobDescription = escapeAndTruncate(jobDescription);
        String escapedResume = escapeAndTruncate(resumeContent);

        return String.format("""
        {
            "contents": [{
                "parts": [{
                    "text": "Extract a list of skills that are mentioned in both the job description and the candidate's resume. Return ONLY a JSON array of skill names, without any explanation or additional text. Each skill should be a single term or short phrase. Job Description: %s Resume: %s"
                }]
            }]
        }
        """, escapedJobDescription, escapedResume);
    }

    private String[] parseMatchedSkills(String response) {
        try {
            // Clean the response
            String cleanedResponse = cleanResponse(response);

            // Parse the cleaned response
            JsonNode root = objectMapper.readTree(cleanedResponse);
            String jsonContent = root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text")
                    .asText();

            // Further clean the JSON content
            jsonContent = cleanJsonContent(jsonContent);

            // Parse the content as a JSON array
            JsonNode skillsNode = objectMapper.readTree(jsonContent);
            if (skillsNode.isArray()) {
                List<String> skills = new ArrayList<>();
                for (JsonNode skillNode : skillsNode) {
                    skills.add(skillNode.asText());
                }
                return skills.toArray(new String[0]);
            } else {
                logger.warn("Skills response is not a JSON array, trying alternative parsing");

                // If response is not a proper JSON array, try to extract skills from text
                String[] skillsArray = jsonContent.split(",|\\n");
                List<String> cleanedSkills = new ArrayList<>();

                for (String skill : skillsArray) {
                    String cleanedSkill = skill.trim().replaceAll("\"", "").replaceAll("\\[|\\]", "");
                    if (!cleanedSkill.isEmpty()) {
                        cleanedSkills.add(cleanedSkill);
                    }
                }

                return cleanedSkills.toArray(new String[0]);
            }
        } catch (Exception e) {
            logger.error("Error parsing matched skills: {}", e.getMessage());
            return new String[0];
        }
    }

    /**
     * Extracts and returns the estimated years of experience from the resume
     *
     * @param jobDescription The job description text
     * @param resumeContent The resume content
     * @return The estimated years of experience as an integer
     */
    public int getYearsOfExperience(String jobDescription, String resumeContent) {
        if (resumeContent == null || resumeContent.trim().isEmpty()) {
            logger.warn("Empty resume provided for years of experience extraction");
            return 0;
        }

        String apiRequest = buildGeminiRequestYearsOfExperience(jobDescription, resumeContent);

        try {
            String response = webClient.post()
                    .uri("/v1beta/models/gemini-1.5-flash:generateContent")
                    .header("Content-Type", "application/json")
                    .header("x-goog-api-key", geminiApiKey)
                    .bodyValue(apiRequest)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            logger.info("Gemini API response received for years of experience extraction");
            return parseYearsOfExperience(response);
        } catch (Exception e) {
            logger.error("Error extracting years of experience: {}", e.getMessage(), e);
            return 0;
        }
    }

    private String buildGeminiRequestYearsOfExperience(String jobDescription, String resumeContent) {
        String escapedJobDescription = escapeAndTruncate(jobDescription);
        String escapedResume = escapeAndTruncate(resumeContent);

        return String.format("""
        {
            "contents": [{
                "parts": [{
                    "text": "Based on this resume, estimate the candidate's total years of professional experience that is relevant to the job description. Return ONLY an integer number without any text, explanation, or decimal points. If you cannot determine the experience, return 0. Job Description: %s Resume: %s"
                }]
            }]
        }
        """, escapedJobDescription, escapedResume);
    }

    private int parseYearsOfExperience(String response) {
        try {
            // Parse the response
            JsonNode root = objectMapper.readTree(response);
            String yearsText = root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text")
                    .asText();

            // Clean and parse the years
            yearsText = yearsText.trim().replaceAll("[^0-9]", "");
            if (yearsText.isEmpty()) {
                return 0;
            }

            return Integer.parseInt(yearsText);
        } catch (Exception e) {
            logger.error("Error parsing years of experience: {}", e.getMessage());
            return 0;
        }
    }
}