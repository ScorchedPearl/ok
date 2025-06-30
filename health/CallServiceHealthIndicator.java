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

@Component("callServiceHealth")
@RequiredArgsConstructor
@Slf4j
public class CallServiceHealthIndicator implements HealthIndicator {

    private final CallService callService;

    @Override
    public Health health() {
        try {
            Map<String, Object> details = new HashMap<>();
            details.put("service", "CallService");
            details.put("status", "Operational");
            details.put("timestamp", LocalDateTime.now().toString());
            return Health.up().withDetails(details).build();
        } catch (Exception e) {
            log.error("Call service health check failed", e);
            return Health.down()
                    .withDetail("service", "CallService")
                    .withDetail("error", e.getMessage())
                    .withDetail("timestamp", LocalDateTime.now().toString())
                    .build();
        }
    }
}