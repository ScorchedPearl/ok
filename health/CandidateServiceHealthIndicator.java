package com.screening.interviews.health;

import com.screening.interviews.repo.CandidateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

//@Component("candidateServiceHealth")
@RequiredArgsConstructor
@Slf4j
public class CandidateServiceHealthIndicator implements HealthIndicator {

    private final CandidateRepository candidateRepository;

    @Override
    public Health health() {
        try {
            long candidateCount = candidateRepository.count();

            Map<String, Object> details = new HashMap<>();
            details.put("service", "CandidateService");
            details.put("totalCandidates", candidateCount);
            details.put("status", "Operational");
            details.put("timestamp", LocalDateTime.now().toString());

            return Health.up().withDetails(details).build();
        } catch (Exception e) {
            log.error("Candidate service health check failed", e);
            return Health.down()
                    .withDetail("service", "CandidateService")
                    .withDetail("error", e.getMessage())
                    .withDetail("timestamp", LocalDateTime.now().toString())
                    .build();
        }
    }
}

