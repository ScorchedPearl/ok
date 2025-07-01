package com.screening.billing.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
@Slf4j
public class HealthCheck {
    @GetMapping("/tenant")
    public String getTenant() {
        return "Tenant accessed successfully";
    }

    @GetMapping("/candidate")
    public String getCandidate() {
        return "Candidate accessed successfully";
    }
}
