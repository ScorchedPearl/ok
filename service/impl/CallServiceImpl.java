package com.screening.interviews.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.screening.interviews.dto.CallRequestDto;
import com.screening.interviews.dto.CallResponseDto;
import com.screening.interviews.dto.CallStatusUpdateDto;
import com.screening.interviews.dto.CallUpdateRequest;
import com.screening.interviews.dto.callAnalysis.CallAnalysisResponseDTO;
import com.screening.interviews.dto.callAnalysis.CallDetailsDTO;
import com.screening.interviews.dto.callAnalysis.CandidateDetailsDTO;
import com.screening.interviews.dto.callAnalysis.ConversationDTO;
import com.screening.interviews.enums.CallStatus;
import com.screening.interviews.exception.ResourceNotFoundException;
import com.screening.interviews.model.*;
import com.screening.interviews.repo.*;
import com.screening.interviews.service.CallService;
import com.screening.interviews.service.GeminiService;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.security.Principal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.stream.Collectors;

import java.util.*;

@Service
public class CallServiceImpl implements CallService {

//    @Value("${ai.calling.service}")
    private String aiCallingService="https://api.screenera.ai/scheduler";

    private final WebClient webClient;
    private final CallRepository callRepository;
    private final CallQuestionMappingRepository callQuestionMappingRepository;
    private static final Logger logger = LoggerFactory.getLogger(CallServiceImpl.class);
    private final TranscriptRepository transcriptRepository;
    private final GeminiService geminiService;
    private final JobRepository jobRepository;
    private final CandidateRepository  candidateRepository;

    @Autowired
    public CallServiceImpl(
            WebClient.Builder webClientBuilder,
            CallRepository callRepository,
            CallQuestionMappingRepository callQuestionMappingRepository, TranscriptRepository transcriptRepository, GeminiService geminiService, JobRepository jobRepository, CandidateRepository candidateRepository) {
        this.webClient = webClientBuilder.baseUrl(aiCallingService).build();
        this.callRepository = callRepository;
        this.callQuestionMappingRepository = callQuestionMappingRepository;
        this.transcriptRepository = transcriptRepository;
        this.geminiService= geminiService;
        this.jobRepository= jobRepository;
        this.candidateRepository=candidateRepository;
    }

    //    @Override
    @Transactional
    public CallResponseDto scheduleCall(CallRequestDto callRequestDto, Long tenantId, String token) {
        logger.info("Starting scheduleCall for tenantId: {}, callRequestDto: {}", tenantId, callRequestDto);

        // Validate input
        if (callRequestDto == null) {
            logger.error("CallRequestDto is null for tenantId: {}", tenantId);
            throw new IllegalArgumentException("CallRequestDto cannot be null");
        }

        logger.info("Scheduled time: {}", callRequestDto.getScheduledAt());

// Before setting the scheduledAt value, ensure it's in ISO format
// Add validation for scheduledAt format


        // Create and save call
        logger.debug("Creating new Call entity");

        logger.info("scheduled itme", callRequestDto.getScheduledAt());


        Call call = new Call();
        call.setRemark(callRequestDto.getRemark());
        call.setScheduledAt(callRequestDto.getScheduledAt());
        call.setDurationMinutes(callRequestDto.getDurationMinutes());
        call.setStatus(CallStatus.PENDING);
        call.setJobId(callRequestDto.getJobId());
        call.setCandidateId(callRequestDto.getCandidateId());
        call.setTenantId(tenantId);
        call.setCreatedBy(callRequestDto.getCreatedBy());
        call.setMobileNumber(callRequestDto.getMobileNumber());
        logger.debug("Call entity prepared: {}", call);

        logger.info("Saving Call entity to repository");
        Call savedCall;
        try {
            savedCall = callRepository.save(call);
            logger.info("Call saved successfully, callId: {}", savedCall.getCallId());
        } catch (Exception e) {
            logger.error("Failed to save Call entity for tenantId: {}", tenantId, e);
            throw new RuntimeException("Failed to save call to database", e);
        }

        // Extract question IDs and text from the questions DTO list
        List<UUID> questionIds = new ArrayList<>();
        List<String> questionTexts = new ArrayList<>();
        if (callRequestDto.getQuestions() != null && !callRequestDto.getQuestions().isEmpty()) {
            logger.debug("Processing {} questions from CallRequestDto", callRequestDto.getQuestions().size());
            questionIds = callRequestDto.getQuestions().stream()
                    .map(questionDto -> {
                        if (questionDto.getQuestionId() == null) {
                            logger.warn("Null questionId found in questionDto: {}", questionDto);
                        }
                        return questionDto.getQuestionId();
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            logger.debug("Extracted questionIds: {}", questionIds);

            questionTexts = callRequestDto.getQuestions().stream()
                    .map(questionDto -> {
                        String text = questionDto.getQuestionText();
                        if (text == null) {
                            logger.warn("Null questionText found in questionDto: {}", questionDto);
                            return "";
                        }
                        return text;
                    })
                    .collect(Collectors.toList());
            logger.debug("Extracted questionTexts: {}", questionTexts);

            // Create and save question mappings
            logger.info("Creating {} question mappings for callId: {}", questionIds.size(), savedCall.getCallId());
            List<CallQuestionMapping> questionMappings = new ArrayList<>();
            for (int i = 0; i < questionIds.size(); i++) {
                CallQuestionMapping mapping = new CallQuestionMapping();
                mapping.setCallId(savedCall.getCallId());
                mapping.setQuestionId(questionIds.get(i));
                mapping.setSequenceOrder(i + 1);
                mapping.setCreatedBy(callRequestDto.getCreatedBy());
                questionMappings.add(mapping);
            }
            logger.debug("Question mappings prepared: {}", questionMappings);

            try {
                callQuestionMappingRepository.saveAll(questionMappings);
                logger.info("Saved {} question mappings for callId: {}", questionMappings.size(), savedCall.getCallId());
            } catch (Exception e) {
                logger.error("Failed to save question mappings for callId: {}", savedCall.getCallId(), e);
                throw new RuntimeException("Failed to save question mappings", e);
            }
        } else {
            logger.info("No questions provided in CallRequestDto for callId: {}", savedCall.getCallId());
        }

        // Create API request body
        logger.debug("Building API request body for callId: {}", savedCall.getCallId());
        Map<String, Object> apiRequestBody = new HashMap<>();
        apiRequestBody.put("callRefId", savedCall.getCallId().toString());
        apiRequestBody.put("phoneNumber", call.getMobileNumber());
//        apiRequestBody.put("callId", savedCall.getCallId().toString());
        apiRequestBody.put("scheduledTime", call.getScheduledAt().toString());
//        apiRequestBody.put("status", call.getStatus().name());
        apiRequestBody.put("prompt", buildPrompt(questionTexts));
        apiRequestBody.put("firstMessage", "Hello! This is Sarah from the hiring team. I'll be asking a series of questions about your experience and skills. Are you ready to begin?");

//        Map<String, Object> roleConfig = new HashMap<>();
//        roleConfig.put("voice", "Polly.Matthew");
//        roleConfig.put("language", "en-US");

//        Map<String, String> messages = new HashMap<>();
//        messages.put("no_input", "I didn't hear a response. Are you still there? Please let me know when you're ready to continue.");
//        messages.put("repeat_request", "I didn't quite catch that. Could you please repeat or clarify your answer?");
//        messages.put("goodbye", "Thank you so much for your time today. We'll review your responses and follow up with next steps soon. Have a great day!");
//        roleConfig.put("messages", messages);

//        apiRequestBody.put("role_config", roleConfig);
        logger.debug("API request body created: {}", apiRequestBody);

        try {
            ObjectMapper mapper = new ObjectMapper();
            String requestBodyJson = mapper.writeValueAsString(apiRequestBody);
            logger.info("Serialized API Request Body for callId: {}: {}", savedCall.getCallId(), requestBodyJson);
        } catch (Exception e) {
            logger.error("Failed to serialize API request body for callId: {}", savedCall.getCallId(), e);
            throw new RuntimeException("Failed to serialize request body", e);
        }

        // Make API call using WebClient
        logger.info("Making API call to schedule call for callId: {}", savedCall.getCallId());
            logger.info("The API reuqest endpoint is ", apiRequestBody);
            try {
                String response = webClient.post()
                        .uri("api/calls/schedule")
                        .header("Authorization",token)
                        .bodyValue(apiRequestBody)
                        .retrieve()
                        .bodyToMono(String.class)
                        .block();

                logger.info("API call successful for callId: {}, response: {}", savedCall.getCallId(), response);
        } catch (Exception e) {
            logger.error("Failed to schedule call with AI calling service for callId: {}", savedCall.getCallId(), e);
            throw new RuntimeException("Failed to schedule the call with the AI calling service", e);
        }

        logger.info("Converting saved call to response DTO for callId: {}", savedCall.getCallId());
        CallResponseDto responseDto = convertToResponseDto(savedCall, questionIds);
        logger.info("Schedule call completed successfully for callId: {}, response: {}", savedCall.getCallId(), responseDto);

        return responseDto;
    }


    private String buildPrompt(List<String> questionTexts) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("## Objective\n");
        prompt.append("You are a voice AI agent conducting a professional job interview over a phone call. Your goal is to engage the candidate in a human-like, structured conversation, asking a predefined set of questions to assess their qualifications, skills, and fit for the job role, while maintaining a friendly and professional demeanor.\n\n");
        prompt.append("## Questions\n");
        for (int i = 0; i < questionTexts.size(); i++) {
            prompt.append("- ").append(questionTexts.get(i)).append("\n");
        }
        prompt.append("\n[Full prompt as provided earlier]");
        return prompt.toString();
    }
//    @Transactional
//    public CallResponseDto scheduleCall(CallRequestDto callRequestDto, Long tenantId) {
//        // Create and save call
//        Call call = new Call();
//        call.setRemark(callRequestDto.getRemark());
//        call.setScheduledAt(callRequestDto.getScheduledAt());
//        call.setDurationMinutes(callRequestDto.getDurationMinutes());
//        call.setStatus(CallStatus.SCHEDULED);
//        call.setJobId(callRequestDto.getJobId());
//        call.setCandidateId(callRequestDto.getCandidateId());
//        call.setTenantId(tenantId);
//        call.setCreatedBy(callRequestDto.getCreatedBy());
//        call.setMobileNumber(callRequestDto.getMobileNumber());
//
//        Call savedCall = callRepository.save(call);
//
//        // Extract question IDs from the questions DTO list
//        List<UUID> questionIds = new ArrayList<>();
//        if (callRequestDto.getQuestions() != null && !callRequestDto.getQuestions().isEmpty()) {
//            questionIds = callRequestDto.getQuestions().stream()
//                    .map(questionDto -> questionDto.getQuestionId())
//                    .collect(Collectors.toList());
//
//            // Create and save question mappings
//            List<CallQuestionMapping> questionMappings = new ArrayList<>();
//            for (int i = 0; i < questionIds.size(); i++) {
//                CallQuestionMapping mapping = new CallQuestionMapping();
//                mapping.setCallId(savedCall.getCallId());
//                mapping.setQuestionId(questionIds.get(i));
//                mapping.setSequenceOrder(i + 1);
//                mapping.setCreatedBy(callRequestDto.getCreatedBy());
//                questionMappings.add(mapping);
//            }
//            callQuestionMappingRepository.saveAll(questionMappings);
//        }
//
//        return convertToResponseDto(savedCall, questionIds);
//    }

    @Override
    public CallResponseDto scheduleCall(CallRequestDto callRequestDto, Long tenantId) {
        return null;
    }

    @Override
    public CallResponseDto getCall(UUID callId, Long tenantId) {
        Call call = callRepository.findByCallIdAndTenantId(callId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Call not found with id: " + callId));

        List<UUID> questionIds = callQuestionMappingRepository.findByCallIdOrderBySequenceOrder(callId)
                .stream()
                .map(CallQuestionMapping::getQuestionId)
                .collect(Collectors.toList());

        return convertToResponseDto(call, questionIds);
    }

    @Override
    public Page<CallResponseDto> getAllCallsByCandidate(Long candidateId, Pageable pageable) {
        Page<Call> calls = callRepository.findAllByCandidateId(candidateId, pageable);
        return calls.map(call -> {
            List<UUID> questionIds = callQuestionMappingRepository.findByCallIdOrderBySequenceOrder(call.getCallId())
                    .stream()
                    .map(CallQuestionMapping::getQuestionId)
                    .collect(Collectors.toList());

            return convertToResponseDto(call, questionIds);
        });
    }

    @Override
    public Page<CallResponseDto> getAllCallsByJob(UUID jobId, Pageable pageable) {
        Page<Call> calls = callRepository.findAllByJobId(jobId, pageable);

        return calls.map(call -> {
            // Get question IDs for this call
            List<UUID> questionIds = callQuestionMappingRepository.findByCallIdOrderBySequenceOrder(call.getCallId())
                    .stream()
                    .map(CallQuestionMapping::getQuestionId)
                    .collect(Collectors.toList());

            // Get candidate information
            Candidate candidate = null;
            if (call.getCandidateId() != null) {
                candidate = candidateRepository.findById(call.getCandidateId())
                        .orElse(null);
            }

            // Convert to DTO with both call and candidate data
            return convertToResponseDto(call, questionIds, candidate);
        });
    }

    /**
     * Converts Call entity to CallResponseDto with question IDs and candidate information
     */
    private CallResponseDto convertToResponseDto(Call call, List<UUID> questionIds, Candidate candidate) {
        CallResponseDto dto = new CallResponseDto();

        // Set Call properties
        dto.setCallId(call.getCallId());
        dto.setRemark(call.getRemark());
        dto.setScheduledAt(call.getScheduledAt());
        dto.setDurationMinutes(call.getDurationMinutes());
        dto.setStatus(call.getStatus());
        dto.setJobId(call.getJobId());
        dto.setTenantId(call.getTenantId());
        dto.setCreatedBy(call.getCreatedBy());
        dto.setCreatedAt(call.getCreatedAt());
        dto.setCandidateId(call.getCandidateId());

        // Set question IDs
        dto.setQuestionIds(questionIds);

        // Set candidate properties if candidate exists
        if (candidate != null) {
            dto.setCandidateFullName(candidate.getFullName());
            dto.setCandidateEmail(candidate.getEmail());
        }

        return dto;
    }

    @Override
    public List<UUID> getQuestionsForCall(UUID callId, Long tenantId) {
        // Check if call exists for the tenant
        callRepository.findByCallIdAndTenantId(callId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Call not found with id: " + callId));

        return callQuestionMappingRepository.findByCallIdOrderBySequenceOrder(callId)
                .stream()
                .map(CallQuestionMapping::getQuestionId)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CallResponseDto updateCallStatus(UUID callId, CallStatusUpdateDto statusUpdateDto, Long tenantId) {
        Call call = callRepository.findByCallIdAndTenantId(callId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Call not found with id: " + callId));

        call.setStatus(statusUpdateDto.getStatus());
        Call updatedCall = callRepository.save(call);

        List<UUID> questionIds = callQuestionMappingRepository.findByCallIdOrderBySequenceOrder(callId)
                .stream()
                .map(CallQuestionMapping::getQuestionId)
                .collect(Collectors.toList());

        return convertToResponseDto(updatedCall, questionIds);
    }

    @Override
    public void updateCallAndAddTranscripts(CallUpdateRequest request) {

    }

    private CallResponseDto convertToResponseDto(Call call, List<UUID> questionIds) {
        CallResponseDto responseDto = new CallResponseDto();
        responseDto.setCallId(call.getCallId());
        responseDto.setRemark(call.getRemark());
        responseDto.setScheduledAt(call.getScheduledAt());
        responseDto.setDurationMinutes(call.getDurationMinutes());
        responseDto.setStatus(call.getStatus());
        responseDto.setJobId(call.getJobId());
        responseDto.setCandidateId(call.getCandidateId());
        responseDto.setTenantId(call.getTenantId());
        responseDto.setCreatedBy(call.getCreatedBy());
        responseDto.setCreatedAt(call.getCreatedAt());
        responseDto.setQuestionIds(questionIds);

        return responseDto;
    }

    @Transactional

public void updateCallAndAddTranscripts(CallUpdateRequest request,String token) {
    // Fetch the Call entity by callId
    logger.debug("Fetching call with ID: {}", request.getCallId());
    Call call = callRepository.findById(request.getCallId())
            .orElseThrow(() -> {
                logger.error("Call not found with ID: {}", request.getCallId());
                return new IllegalArgumentException("Call not found with ID: " + request.getCallId());
            });

    // Update the status of the Call
    logger.info("Updating call status from {} to {}", call.getStatus(), request.getStatus().toUpperCase());
    call.setStatus(CallStatus.valueOf(request.getStatus().toUpperCase()));
    callRepository.save(call);
    logger.debug("Call status updated successfully");

    // Map the transcript data and save it
    if (request.getTranscript() != null && !request.getTranscript().isEmpty()) {
        logger.info("Processing {} transcript entries for callId: {}", request.getTranscript().size(), request.getCallId());
        List<Transcript> transcripts = request.getTranscript().stream().map(data -> {
            logger.debug("Processing transcript entry - Speaker: {}, Content length: {}", 
                        data.getSpeaker(), data.getContent() != null ? data.getContent().length() : 0);
            
            Transcript transcript = new Transcript();
            transcript.setCall(call);
            transcript.setCallIdRef(data.getCallId());
            transcript.setSpeaker(data.getSpeaker());
            transcript.setContent(data.getContent());
            
            // Handle timestamp conversion
            if (data.getTimestamp() != null) {
                try {
                    LocalDateTime timestamp = LocalDateTime.parse(data.getTimestamp().replace("Z", ""));
                    transcript.setMessageTimestamp(timestamp);
                    logger.debug("Timestamp parsed successfully: {}", timestamp);
                } catch (Exception e) {
                    logger.warn("Failed to parse timestamp: {}. Using current time instead.", data.getTimestamp(), e);
                    transcript.setMessageTimestamp(LocalDateTime.now());
                }
            } else {
                logger.debug("No timestamp provided, using current time");
                transcript.setMessageTimestamp(LocalDateTime.now());
            }
            
            return transcript;
        }).collect(Collectors.toList());

        logger.info("Saving {} transcript entries to database", transcripts.size());
        transcriptRepository.saveAll(transcripts);
        logger.debug("Transcripts saved successfully");
    } else {
        logger.warn("No transcript data provided for callId: {}", request.getCallId());
    }

    try {

        logger.info("Starting transcript analysis for callId: {}", request.getCallId());
        analyzeTranscript(request.getCallId(),token);


        logger.info("Transcript analysis completed successfully");

    } catch (Exception e) {
        logger.error("Failed to analyze transcript for callId: {}. Error: {}", request.getCallId(), e.getMessage(), e);
        throw new RuntimeException("Failed to analyze transcript: " + e.getMessage(), e);
    }
    
    logger.info("Completed updateCallAndAddTranscripts for callId: {}", request.getCallId());
}

    @Transactional
    public void analyzeTranscript(UUID callId,String token) {

        // Retrieve the call and associated job information
        logger.debug("Fetching call details for ID: {}", callId);
        Call call = callRepository.findById(callId)
                .orElseThrow(() -> {
                    logger.error("Call not found with ID: {}", callId);
                    return new IllegalArgumentException("Call not found with ID: " + callId);
                });

        // Get the associated job for contextual information
        Job job = null;
        if (call.getJobId() != null) {
            logger.debug("Fetching job details for jobId: {}", call.getJobId());
            job = jobRepository.findById(call.getJobId())
                    .orElse(null);
            if (job == null) {
                logger.warn("No job found for jobId: {}", call.getJobId());
            } else {
                logger.debug("Job details found: Title={}, Company={}", job.getTitle(), job.getCompanyName());
            }
        } else {
            logger.warn("No jobId associated with call: {}", callId);
        }

        // Retrieve transcripts
        logger.debug("Fetching transcripts for callId: {}", callId);
        List<Transcript> transcripts = transcriptRepository.findByCall_CallId(callId);
        logger.info("Found {} transcript entries for analysis", transcripts.size());

        // Format transcript text
        logger.debug("Formatting transcript text for analysis");
        String transcriptText = transcripts.stream()
                .map(t -> t.getSpeaker() + ": " + t.getContent())
                .collect(Collectors.joining("\n"));
        logger.debug("Formatted transcript length: {} characters", transcriptText.length());

        // Build a comprehensive prompt with job context
        logger.debug("Building contextualized prompt for analysis");
        String prompt = buildJobContextualizedPrompt(job, transcriptText);
        logger.debug("Built prompt with length: {} characters", prompt.length());

        try {
            // Call Gemini API with our service
            Map<String, Object> response = geminiService.analyzeText(prompt,token);

            // Extract the summary from the response
            String candidateEvaluation = (String) response.get("summary");
            logger.debug("Extracted candidate evaluation with length: {} characters", 
                        candidateEvaluation != null ? candidateEvaluation.length() : 0);

            // Update the call with the summary
            logger.info("Updating call with analysis summary");
            call.setSummary(candidateEvaluation);
            callRepository.save(call);
            logger.info("Successfully saved analysis summary for callId: {}", callId);

        } catch (Exception e) {
            logger.error("Failed to analyze transcript for callId: {}. Error: {}", callId, e.getMessage(), e);
            throw new RuntimeException("Failed to analyze transcript: " + e.getMessage(), e);
        }

        logger.info("Completed transcript analysis for callId: {}", callId);
    }

    private String buildJobContextualizedPrompt(Job job, String transcriptText) {
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("You are an expert HR analyst evaluating a job interview. ");
        promptBuilder.append("Analyze this interview transcript and provide a concise yet comprehensive ");
        promptBuilder.append("evaluation (6-7 sentences maximum) of the candidate's suitability for the role.\n\n");

        // Add job context if available
        if (job != null) {
            promptBuilder.append("JOB DETAILS:\n");
            promptBuilder.append("- Title: ").append(job.getTitle()).append("\n");
            promptBuilder.append("- Company: ").append(job.getCompanyName()).append("\n");
            promptBuilder.append("- Department: ").append(job.getDepartment()).append("\n");
            promptBuilder.append("- Type: ").append(job.getEmploymentType()).append("\n");

            // Add job description if available
            if (job.getDescription() != null && !job.getDescription().isEmpty()) {
                promptBuilder.append("\nJOB DESCRIPTION:\n").append(job.getDescription()).append("\n\n");
            }
        }

        // Evaluation instructions
        promptBuilder.append("\nEVALUATION CRITERIA:\n");
        promptBuilder.append("1. Technical competency: Assess the correctness and depth of the candidate's answers\n");
        promptBuilder.append("2. Communication skills: Evaluate clarity, articulation, and listening ability\n");
        promptBuilder.append("3. Role fit: Determine how well the candidate's experience matches job requirements\n");
        promptBuilder.append("4. Problem-solving: Assess analytical thinking and approach to challenges\n");
        promptBuilder.append("5. Cultural fit: Evaluate alignment with company values and team dynamics\n");

        // Format instructions
        promptBuilder.append("\nINSTRUCTIONS:\n");
        promptBuilder.append("- Provide a concise executive summary (6-7 sentences maximum)\n");
        promptBuilder.append("- Begin with an overall assessment of candidate suitability (Excellent/Good/Average/Below Average)\n");
        promptBuilder.append("- Highlight 2-3 key strengths and 1-2 areas for improvement\n");
        promptBuilder.append("- Conclude with a clear hiring recommendation\n");
        promptBuilder.append("- Use professional, objective language\n");
        promptBuilder.append("- Focus only on job-relevant qualities\n");

        // Add plain text output instructions
        promptBuilder.append("- IMPORTANT: Provide your response in plain text only. DO NOT use any special characters, bold text, asterisks, or other formatting symbols\n\n");

        promptBuilder.append("INTERVIEW TRANSCRIPT:\n").append(transcriptText);

        return promptBuilder.toString();
    }

    @Transactional
    public CallAnalysisResponseDTO getCallAnalysis(UUID callId) {
        // Get call data
        Call call = callRepository.findByCallId(callId)
                .orElseThrow(() -> new RuntimeException("Call not found with ID: " + callId));

        // Get candidate data
        Candidate candidate = candidateRepository.findById(call.getCandidateId())
                .orElseThrow(() -> new RuntimeException("Candidate not found with ID: " + call.getCandidateId()));

        // Get conversation transcripts
        List<Transcript> transcripts = transcriptRepository.findByCallIdOrderById(callId);

        // Map to DTOs
        CandidateDetailsDTO candidateDTO = mapToCandidateDTO(candidate);
        List<ConversationDTO> conversationDTOs = mapToConversationDTOs(transcripts);
        CallDetailsDTO callDetailsDTO = mapToCallDetailsDTO(call);

        // Build and return response
        return CallAnalysisResponseDTO.builder()
                .candidate(candidateDTO)
                .conversation(conversationDTOs)
                .summary(call.getSummary())
                .callDetails(callDetailsDTO)
                .build();
    }
    // Mapping methods
    private CandidateDetailsDTO mapToCandidateDTO(Candidate candidate) {
        return CandidateDetailsDTO.builder()
                .id(candidate.getId())
                .fullName(candidate.getFullName())
                .email(candidate.getEmail())
                .phoneNumber(candidate.getPhoneNumber())
                .resumeFileUrl(candidate.getResumeFileUrl())
                .resumeSummary(candidate.getResumeSummary())
                .build();
    }

    private List<ConversationDTO> mapToConversationDTOs(List<Transcript> transcripts) {
        return transcripts.stream()
                .map(transcript -> ConversationDTO.builder()
                        .id(transcript.getId())
                        .speaker(transcript.getSpeaker())
                        .content(transcript.getContent())
                        .messageTimestamp(transcript.getMessageTimestamp())
                        .build())
                .collect(Collectors.toList());
    }

    private CallDetailsDTO mapToCallDetailsDTO(Call call) {
        return CallDetailsDTO.builder()
                .callId(call.getCallId())
                .scheduledAt(call.getScheduledAt())
                .durationMinutes(call.getDurationMinutes())
                .status(call.getStatus().toString())
                .jobId(call.getJobId())
                .createdBy(call.getCreatedBy())
                .createdAt(call.getCreatedAt())
                .build();
    }

}