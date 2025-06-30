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

@Component("jobServiceHealth")
@RequiredArgsConstructor
@Slf4j
public class JobServiceHealthIndicator implements HealthIndicator {

    private final JobService jobService;

    @Override
    public Health health() {
        try {
            Map<String, Object> details = new HashMap<>();
            details.put("service", "JobService");
            details.put("status", "Operational");
            details.put("timestamp", LocalDateTime.now().toString());

            return Health.up().withDetails(details).build();
        } catch (Exception e) {
            log.error("Job service health check failed", e);
            return Health.down()
                    .withDetail("service", "JobService")
                    .withDetail("error", e.getMessage())
                    .withDetail("timestamp", LocalDateTime.now().toString())
                    .build();
        }
    }
}