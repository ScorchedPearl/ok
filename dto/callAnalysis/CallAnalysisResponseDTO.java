package com.screening.interviews.dto.callAnalysis;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CallAnalysisResponseDTO {
    private CandidateDetailsDTO candidate;
    private List<ConversationDTO> conversation;
    private String summary;
    private CallDetailsDTO callDetails;
}





