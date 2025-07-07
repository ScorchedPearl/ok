package com.screening.interviews.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class CallUpdateRequest {
    private UUID callId;
    private String status;
    private List<TranscriptData> transcript;

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TranscriptData {
        private String callId;  // Added this field
        private String speaker;
        private String content;
        private String timestamp;  // Added this field
        
        // You might want to add a helper method to convert timestamp string to LocalDateTime
        public LocalDateTime getTimestampAsDateTime() {
            if (timestamp != null) {
                return LocalDateTime.parse(timestamp.replace("Z", ""));
            }
            return null;
        }
    }
}
