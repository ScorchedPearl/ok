package com.screening.interviews.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.screening.interviews.dto.JobDescriptionEnhancementRequestDto;
import com.screening.interviews.dto.JobDescriptionEnhancementResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobDescriptionService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private String geminiApiKey = "AIzaSyCcTsDBMal4lRkGCjxy6dIwFcaWGRG4ntU";

    public JobDescriptionEnhancementResponseDto enhanceJobDescription(JobDescriptionEnhancementRequestDto request,String token) {
        try {
            log.info("Enhancing job description for position: {}", request.getTitle());

            // Build the Gemini API request
            String apiRequest = buildGeminiRequestJobDesc(request);

            // Call the Gemini API
            String response = webClient.post()
                    .uri("/v1beta/models/gemini-1.5-flash:generateContent")
                    .header("Content-Type", "application/json")
                    .header("x-goog-api-key", geminiApiKey)
                    .header("Authorization",token)
                    .bodyValue(apiRequest)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.info("Gemini API response received for job description enhancement");

            // Parse the response
            return parseJobDescriptionResponse(response);

        } catch (Exception e) {
            log.error("Error enhancing job description: {}", e.getMessage(), e);
            return createFallbackJobDescriptionResponse();
        }
    }

    private String buildGeminiRequestJobDesc(JobDescriptionEnhancementRequestDto request) {
    StringBuilder promptBuilder = new StringBuilder();
    
    // Create a simplified prompt focused on generating a great job description with plain text
    promptBuilder.append("You are an expert job description writer. ");
    promptBuilder.append("Enhance the following job description to make it more effective, engaging, and professional. ");
    promptBuilder.append("Use ONLY plain text without any markdown formatting, symbols, or special characters like asterisks, underscores, or hash symbols for formatting. ");
    
    // Add job details
    promptBuilder.append("Job details:\\n");
    promptBuilder.append("Title: ").append(escapeString(request.getTitle())).append("\\n");
    
    if (request.getDepartment() != null && !request.getDepartment().isEmpty()) {
        promptBuilder.append("Department: ").append(escapeString(request.getDepartment())).append("\\n");
    }
    
    if (request.getLocation() != null && !request.getLocation().isEmpty()) {
        promptBuilder.append("Location: ").append(escapeString(request.getLocation())).append("\\n");
    }
    
    if (request.getEmploymentType() != null && !request.getEmploymentType().isEmpty()) {
        promptBuilder.append("Employment Type: ").append(escapeString(request.getEmploymentType())).append("\\n");
    }
    
    promptBuilder.append("Current Description: ").append(escapeString(request.getDescription())).append("\\n");
    
    // Add instructions for the response format
    promptBuilder.append("\\n");
    promptBuilder.append("Return ONLY a valid JSON object with these exact keys: ");
    promptBuilder.append("'enhancedDescription' (string with the improved job description in plain text only, with no markdown or formatting characters), ");
    promptBuilder.append("'overallScore' (integer from 0 to 100), ");
    promptBuilder.append("'improvements' (array of strings with suggested improvements), ");
    promptBuilder.append("'strengths' (array of strings highlighting good aspects), ");
    promptBuilder.append("'missingElements' (array of strings listing important missing information), ");
    promptBuilder.append("'summary' (string with overall assessment).\\n");
    
    // Focus instructions on quality and plain text output
    promptBuilder.append("The enhanced description should be professional, engaging, inclusive, and clearly communicate job responsibilities and requirements. ");
    promptBuilder.append("Use natural language organization with paragraphs and line breaks, but avoid any special formatting characters or symbols.");

    return String.format("""
        {
            "contents": [{
                "parts": [{
                    "text": "%s"
                }]
            }]
        }
        """, promptBuilder.toString());
}

    private String escapeString(String input) {
        if (input == null) return "";
        return input.replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private JobDescriptionEnhancementResponseDto parseJobDescriptionResponse(String response) {
        try {
            // Parse the response
            JsonNode root = objectMapper.readTree(response);
            String jsonContent = root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text")
                    .asText();

            // Clean the content
            jsonContent = cleanJsonContent(jsonContent);

            // Try to parse the content as JSON
            JsonNode parsedContent = objectMapper.readTree(jsonContent);

            // Extract components
            String enhancedDescription = "";
            Integer overallScore = 0;
            List<String> improvements = new ArrayList<>();
            List<String> strengths = new ArrayList<>();
            List<String> missingElements = new ArrayList<>();
            String summary = "";

            if (parsedContent.has("enhancedDescription")) {
                enhancedDescription = parsedContent.get("enhancedDescription").asText();
            }

            if (parsedContent.has("overallScore")) {
                overallScore = parsedContent.get("overallScore").asInt();
            }

            if (parsedContent.has("improvements") && parsedContent.get("improvements").isArray()) {
                parsedContent.get("improvements").forEach(item -> improvements.add(item.asText()));
            }

            if (parsedContent.has("strengths") && parsedContent.get("strengths").isArray()) {
                parsedContent.get("strengths").forEach(item -> strengths.add(item.asText()));
            }

            if (parsedContent.has("missingElements") && parsedContent.get("missingElements").isArray()) {
                parsedContent.get("missingElements").forEach(item -> missingElements.add(item.asText()));
            }

            if (parsedContent.has("summary")) {
                summary = parsedContent.get("summary").asText();
            }

            return JobDescriptionEnhancementResponseDto.builder()
                    .enhancedDescription(enhancedDescription)
                    .overallScore(overallScore)
                    .improvements(improvements)
                    .strengths(strengths)
                    .missingElements(missingElements)
                    .summary(summary)
                    .build();

        } catch (Exception e) {
            log.error("Error parsing job description enhancement response: {}", e.getMessage(), e);
            return createFallbackJobDescriptionResponse();
        }
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

    private JobDescriptionEnhancementResponseDto createFallbackJobDescriptionResponse() {
        return JobDescriptionEnhancementResponseDto.builder()
                .enhancedDescription("We encountered an issue while enhancing your job description. Please try again.")
                .overallScore(0)
                .improvements(Arrays.asList("Could not analyze improvements"))
                .strengths(Arrays.asList("Could not analyze strengths"))
                .missingElements(Arrays.asList("Could not analyze missing elements"))
                .summary("Failed to generate job description enhancements. Please try again or contact support if the issue persists.")
                .build();
    }
}