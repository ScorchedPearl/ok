package com.screening.interviews.health;

import com.screening.interviews.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.dao.DataAccessException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

//@Component("databaseHealth")
@RequiredArgsConstructor
@Slf4j
public class DatabaseHealthIndicator implements HealthIndicator {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public Health health() {
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);

            Map<String, Object> details = new HashMap<>();
            details.put("database", "PostgreSQL");
            details.put("status", "Connected");
            details.put("timestamp", LocalDateTime.now().toString());

            Integer candidateCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM candidates", Integer.class);
            Integer jobCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM jobs", Integer.class);
            Integer interviewCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM interviews", Integer.class);
            Integer callCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM calls", Integer.class);

            details.put("candidateCount", candidateCount);
            details.put("jobCount", jobCount);
            details.put("interviewCount", interviewCount);
            details.put("callCount", callCount);

            return Health.up().withDetails(details).build();
        } catch (DataAccessException e) {
            log.error("Database health check failed", e);
            return Health.down()
                    .withDetail("error", e.getMessage())
                    .withDetail("timestamp", LocalDateTime.now().toString())
                    .build();
        }
    }
}