package com.screening.interviews.controller;

import com.screening.interviews.dto.JobDescriptionEnhancementRequestDto;
import com.screening.interviews.dto.JobDescriptionEnhancementResponseDto;
import com.screening.interviews.service.JobDescriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobDescriptionController {

    private final JobDescriptionService jobDescriptionService;

    @PostMapping("/enhance-description")
    public ResponseEntity<JobDescriptionEnhancementResponseDto> enhanceJobDescription(
            @RequestBody JobDescriptionEnhancementRequestDto request,@RequestHeader("Authorization") String token) {
        log.info("Received request to enhance job description for position: {}", request.getTitle());

        JobDescriptionEnhancementResponseDto response = jobDescriptionService.enhanceJobDescription(request,token);

        return ResponseEntity.ok(response);
    }
}