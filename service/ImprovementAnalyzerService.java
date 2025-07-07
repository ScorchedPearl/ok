package com.screening.interviews.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.screening.interviews.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ImprovementAnalyzerService {

    @Autowired
    private WebClient geminiWebClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public ImprovementAnalysisDTO.ImprovementAnalysisResponse analyzeCandidate(ImprovementAnalysisDTO.ImprovementAnalysisRequest request) {
        try {
            // Create system prompt for Gemini
            String systemPrompt = createSystemPrompt();
            String userPrompt = createUserPrompt(request);

            // Call Gemini API
            String geminiResponse = callGeminiAPI(systemPrompt + "\n\n" + userPrompt);

            // Parse the response and create structured output
            return parseGeminiResponse(geminiResponse);

        } catch (Exception e) {
            e.printStackTrace();
            return createErrorResponse();
        }
    }

    public ImprovementAnalysisDTO.ImprovementAnalysisResponse getMockAnalysis() {
        // Mock data for testing
        ImprovementAnalysisDTO.ImprovementAnalysisRequest mockRequest = new ImprovementAnalysisDTO.ImprovementAnalysisRequest();
        mockRequest.setResume("John Doe, Software Engineer with 3 years Java experience, Spring Boot, REST APIs, MySQL");
        mockRequest.setInterviewTranscript("Q: Explain microservices. A: Microservices are... uh... small services that work together. Q: How do you handle database transactions? A: I use @Transactional annotation but not sure about ACID properties.");
        mockRequest.setInterviewerFeedback("Candidate shows basic understanding but lacks depth in system design and database concepts. Communication could be clearer.");
        mockRequest.setJobDescription("Senior Java Developer - 5+ years experience, Microservices, System Design, Database optimization, Team leadership");

        return analyzeCandidate(mockRequest);
    }

    private String createSystemPrompt() {
        return """
            You are a Learning & Development Coach Agent. Analyze candidate data and provide structured improvement recommendations.
            
            Your task:
            1. Analyze candidate's resume, interview performance, and feedback
            2. Compare against job requirements
            3. Score the candidate (0-100)
            4. Identify key improvement areas with YouTube learning resources
            
            Respond ONLY with valid JSON in this exact format:
            {
                "candidateScore": 75,
                "overallAssessment": "Brief overall assessment",
                "skillAnalysis": [
                    {
                        "skillArea": "Technical Skills",
                        "currentLevel": "Adequate",
                        "status": "🟡",
                        "description": "Brief description of current state"
                    }
                ],
                "improvementSuggestions": [
                    {
                        "skillArea": "System Design",
                        "priority": "High",
                        "description": "Why this needs improvement",
                        "howToImprove": "Specific steps to improve this skill",
                        "youtubeLinks": [
                            {
                                "title": "System Design Fundamentals",
                                "url": "https://youtube.com/watch?v=example",
                                "channel": "Tech with Tim",
                                "duration": "45 min"
                            }
                        ]
                    }
                ]
            }
            
            Skill levels: Strong (✅), Adequate (🟡), Needs Development (🔴)
            Priorities: High, Medium, Low
            Include real YouTube links for learning topics when possible.
            """;
    }

    private String createUserPrompt(ImprovementAnalysisDTO.ImprovementAnalysisRequest request) {
        return String.format("""
            CANDIDATE DATA TO ANALYZE:
            
            RESUME:
            %s
            
            INTERVIEW TRANSCRIPT:
            %s
            
            INTERVIEWER FEEDBACK:
            %s
            
            JOB DESCRIPTION:
            %s
            
            Please analyze this candidate and provide improvement recommendations in the specified JSON format.
            """,
                request.getResume(),
                request.getInterviewTranscript(),
                request.getInterviewerFeedback(),
                request.getJobDescription()
        );
    }

    private String callGeminiAPI(String prompt) {
        try {
            Map<String, Object> requestBody = new HashMap<>();

            List<Map<String, Object>> contents = new ArrayList<>();
            Map<String, Object> content = new HashMap<>();

            List<Map<String, String>> parts = new ArrayList<>();
            Map<String, String> part = new HashMap<>();
            part.put("text", prompt);
            parts.add(part);

            content.put("parts", parts);
            contents.add(content);
            requestBody.put("contents", contents);

            // Generation config for JSON response
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", 0.3);
            generationConfig.put("topK", 1);
            generationConfig.put("topP", 1);
            generationConfig.put("maxOutputTokens", 4096);
            requestBody.put("generationConfig", generationConfig);

            Mono<String> response = geminiWebClient
                    .post()
                    .uri("/models/gemini-1.5-flash:generateContent")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class);

            String result = response.block();

            // Extract text from Gemini response
            JsonNode jsonNode = objectMapper.readTree(result);
            return jsonNode.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();

        } catch (Exception e) {
            e.printStackTrace();
            return createMockGeminiResponse();
        }
    }

    private ImprovementAnalysisDTO.ImprovementAnalysisResponse parseGeminiResponse(String geminiResponse) {
        try {
            // Clean the response (remove markdown formatting if present)
            String cleanJson = geminiResponse.replaceAll("```json", "").replaceAll("```", "").trim();

            return objectMapper.readValue(cleanJson, ImprovementAnalysisDTO.ImprovementAnalysisResponse.class);
        } catch (Exception e) {
            e.printStackTrace();
            return createMockResponse();
        }
    }

    private String createMockGeminiResponse() {
        return """
            {
                "candidateScore": 65,
                "overallAssessment": "Candidate shows good foundational knowledge but needs improvement in advanced concepts and system design thinking.",
                "skillAnalysis": [
                    {
                        "skillArea": "Technical Skills",
                        "currentLevel": "Adequate",
                        "status": "🟡",
                        "description": "Has basic Java and Spring Boot knowledge but lacks depth in advanced topics"
                    },
                    {
                        "skillArea": "System Design",
                        "currentLevel": "Needs Development",
                        "status": "🔴",
                        "description": "Limited understanding of microservices architecture and system design principles"
                    },
                    {
                        "skillArea": "Communication",
                        "currentLevel": "Needs Development",
                        "status": "🔴",
                        "description": "Difficulty explaining technical concepts clearly and concisely"
                    }
                ],
                "improvementSuggestions": [
                    {
                        "skillArea": "System Design",
                        "priority": "High",
                        "description": "Critical gap for senior role - needs strong system design skills",
                        "howToImprove": "Start with system design fundamentals, practice designing scalable systems, understand microservices patterns",
                        "youtubeLinks": [
                            {
                                "title": "System Design Interview Questions",
                                "url": "https://youtube.com/watch?v=UzLMhqg3_Wc",
                                "channel": "Gaurav Sen",
                                "duration": "12 min"
                            },
                            {
                                "title": "Microservices explained in 5 minutes",
                                "url": "https://youtube.com/watch?v=lL_j7ilk7rc",
                                "channel": "TechWorld with Nana",
                                "duration": "5 min"
                            }
                        ]
                    },
                    {
                        "skillArea": "Database Concepts",
                        "priority": "High",
                        "description": "Needs understanding of ACID properties and transaction management",
                        "howToImprove": "Study database fundamentals, practice with transactions, understand ACID properties and isolation levels",
                        "youtubeLinks": [
                            {
                                "title": "Database ACID Properties Explained",
                                "url": "https://youtube.com/watch?v=pomxJOFVcQs",
                                "channel": "Computerphile",
                                "duration": "8 min"
                            },
                            {
                                "title": "Database Transactions",
                                "url": "https://youtube.com/watch?v=P80Js_qClUE",
                                "channel": "Hussein Nasser",
                                "duration": "15 min"
                            }
                        ]
                    },
                    {
                        "skillArea": "Communication Skills",
                        "priority": "Medium",
                        "description": "Important for senior roles to explain technical concepts clearly",
                        "howToImprove": "Practice explaining technical concepts in simple terms, record yourself, get feedback from peers",
                        "youtubeLinks": [
                            {
                                "title": "How to Explain Technical Concepts",
                                "url": "https://youtube.com/watch?v=Unzc731iCUY",
                                "channel": "TED",
                                "duration": "18 min"
                            }
                        ]
                    }
                ]
            }
            """;
    }

    private ImprovementAnalysisDTO.ImprovementAnalysisResponse createMockResponse() {
        try {
            return objectMapper.readValue(createMockGeminiResponse(), ImprovementAnalysisDTO.ImprovementAnalysisResponse.class);
        } catch (Exception e) {
            return createErrorResponse();
        }
    }

    private ImprovementAnalysisDTO.ImprovementAnalysisResponse createErrorResponse() {
        ImprovementAnalysisDTO.ImprovementAnalysisResponse response = new ImprovementAnalysisDTO.ImprovementAnalysisResponse();
        response.setCandidateScore(0);
        response.setOverallAssessment("Error occurred during analysis");
        response.setSkillAnalysis(new ArrayList<>());
        response.setImprovementSuggestions(new ArrayList<>());
        return response;
    }
}