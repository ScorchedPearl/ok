package com.screening.interviews.dto;

import com.screening.interviews.enums.CallStatus;

public class CallStatusUpdateDto {
    private CallStatus status;

    // Getters and setters
    public CallStatus getStatus() {
        return status;
    }

    public void setStatus(CallStatus status) {
        this.status = status;
    }
}