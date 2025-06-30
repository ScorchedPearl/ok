package com.screening.interviews.health;

import com.screening.interviews.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;


//@Component("interviewServiceHealth")
@RequiredArgsConstructor
@Slf4j
public class InterviewServiceHealthIndicator implements HealthIndicator {

    private final InterviewService interviewService;

    @Override
    public Health health() {
        try {
            Map<String, Object> details = new HashMap<>();
            details.put("service", "InterviewService");
            details.put("status", "Operational");
            details.put("timestamp", LocalDateTime.now().toString());

            return Health.up().withDetails(details).build();
        } catch (Exception e) {
            log.error("Interview service health check failed", e);
            return Health.down()
                    .withDetail("service", "InterviewService")
                    .withDetail("error", e.getMessage())
                    .withDetail("timestamp", LocalDateTime.now().toString())
                    .build();
        }
    }
}