package com.screening.interviews.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
public class GeminiService {
    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final String modelName;

    @Autowired
    public GeminiService(WebClient geminiWebClient,
                         @Value("${gemini.model.name}") String modelName) {
        this.webClient = geminiWebClient;
        this.objectMapper = new ObjectMapper();
        this.modelName = modelName;
    }

    /**
     * Analyzes text using the Gemini model
     * @param prompt The prompt to send to Gemini API
     * @return A response containing the analysis results
     */
    public Map<String, Object> analyzeText(String prompt,String token) {
        try {
            ObjectNode requestBody = objectMapper.createObjectNode();
            ObjectNode contents = objectMapper.createObjectNode();

            contents.put("role", "user");
            contents.put("parts", objectMapper.createArrayNode().add(
                    objectMapper.createObjectNode().put("text", prompt)
            ));

            ArrayNode contentsArray = objectMapper.createArrayNode().add(contents);
            requestBody.set("contents", contentsArray);
            requestBody.put("generationConfig",
                    objectMapper.createObjectNode()
                            .put("temperature", 0.2)
                            .put("maxOutputTokens", 1024)
            );

            String endpoint = "/models/" + modelName + ":generateContent";

            log.debug("Sending request to Gemini API: {}", endpoint);

            JsonNode response = webClient.post()
                    .uri(endpoint)
                    .header("Authorization","Bearer "+token)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            log.debug("Received response from Gemini API");

            // Extract the text from the response
            String generatedText = extractTextFromResponse(response);

            // Return a map with the summary
            Map<String, Object> result = Map.of(
                    "summary", generatedText
            );

            return result;
        } catch (Exception e) {
            log.error("Error while calling Gemini API", e);
            throw new RuntimeException("Failed to analyze text with Gemini: " + e.getMessage(), e);
        }
    }

    private String extractTextFromResponse(JsonNode response) {
        try {
            return response.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text")
                    .asText();
        } catch (Exception e) {
            log.error("Failed to extract text from Gemini response", e);
            throw new RuntimeException("Failed to parse Gemini response: " + e.getMessage(), e);
        }
    }
}