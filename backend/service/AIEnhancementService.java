package com.screening.interviews.service;


import com.screening.interviews.dto.*;
import com.screening.interviews.model.*;
import com.screening.interviews.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class AIEnhancementService {
    private final WebClient webClient;

    public EnhanceOfferResponse enhanceOffer(EnhanceOfferRequest request) {
        try {
            String prompt = buildEnhancementPrompt(request);
            System.out.println(prompt);
            String enhancedContent = callGeminiAPI(prompt);
            System.out.println(enhancedContent);

            return parseGeminiResponse(enhancedContent, request.getOfferContent());
        } catch (Exception e) {
            // Fallback to original content if AI enhancement fails
            EnhanceOfferResponse response = new EnhanceOfferResponse();
            response.setEnhancedContent(request.getOfferContent());
            response.setSuggestions("AI enhancement temporarily unavailable. Original content returned.");
            response.setImprovements(List.of("Please try again later"));
            return response;
        }
    }

    public List<String> generateOfferSuggestions(String role, String experience, String company) {
        try {
            String prompt = String.format(
                    "Generate 5 key suggestions for creating an attractive offer letter for a %s role " +
                            "with %s experience level at %s. Focus on compensation, benefits, and growth opportunities. " +
                            "Return as a JSON array of strings.",
                    role, experience, company
            );

            String response = callGeminiAPI(prompt);
            return parseJsonArray(response);
        } catch (Exception e) {
            return List.of(
                    "Include competitive base salary based on market standards",
                    "Highlight professional development opportunities",
                    "Mention company culture and work-life balance",
                    "Detail comprehensive benefits package",
                    "Specify clear growth path and career advancement"
            );
        }
    }

    public String improveOfferTone(String offerContent, String desiredTone) {
        try {
            String prompt = String.format(
                    "Rewrite the following offer letter content to have a %s tone while maintaining " +
                            "all important details and legal requirements. Make it more engaging and appealing:\n\n%s",
                    desiredTone, offerContent
            );

            return callGeminiAPI(prompt);
        } catch (Exception e) {
            return offerContent; // Return original if enhancement fails
        }
    }

    private String buildEnhancementPrompt(EnhanceOfferRequest request) {
        return String.format(
                "Please enhance the following offer letter content for a %s role with %s experience level. " +
                        "Make it more %s in tone while keeping all essential information. " +
                        "Improve clarity, engagement, and professional appeal. " +
                        "Also provide 3 specific improvement suggestions. " +
                        "Format the response as JSON with fields: 'enhancedContent', 'suggestions', 'improvements' (array).\n\n" +
                        "Original Content:\n%s",
                request.getRole(),
                request.getExperience(),
                request.getEnhancementType().toLowerCase(),
                request.getOfferContent()
        );
    }

    private String callGeminiAPI(String prompt) {
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                ),
                "generationConfig", Map.of(
                        "temperature", 0.7,
                        "maxOutputTokens", 2048
                )
        );
        System.out.println(requestBody);

        Map response = webClient.post()
                .uri("/v1beta/models/gemini-2.0-flash:generateContent")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
        System.out.println(response);

        List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
        if (candidates != null && !candidates.isEmpty()) {
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            if (parts != null && !parts.isEmpty()) {
                return (String) parts.get(0).get("text");
            }
        }
        System.out.println(candidates);
        throw new RuntimeException("Failed to get valid response from Gemini API");
    }

    private EnhanceOfferResponse parseGeminiResponse(String geminiResponse, String originalContent) {
        try {
            // Try to parse as JSON first
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(geminiResponse, EnhanceOfferResponse.class);
        } catch (Exception e) {
            // If JSON parsing fails, create response manually
            EnhanceOfferResponse response = new EnhanceOfferResponse();
            response.setEnhancedContent(geminiResponse);
            response.setSuggestions("AI-enhanced content generated successfully");
            response.setImprovements(List.of("Content improved for better engagement", "Professional tone enhanced"));
            return response;
        }
    }

    private List<String> parseJsonArray(String jsonResponse) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(jsonResponse, List.class);
        } catch (Exception e) {
            // Return default suggestions if parsing fails
            return List.of("Unable to generate specific suggestions at this time");
        }
    }
}