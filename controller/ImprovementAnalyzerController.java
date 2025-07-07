package com.screening.interviews.controller;

import com.screening.interviews.dto.ImprovementAnalysisDTO.ImprovementAnalysisRequest;
import com.screening.interviews.dto.ImprovementAnalysisDTO.ImprovementAnalysisResponse;
import com.screening.interviews.service.ImprovementAnalyzerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/improvement")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ImprovementAnalyzerController {

    private final ImprovementAnalyzerService improvementAnalyzerService;

    @PostMapping("/analyze")
    public ResponseEntity<ImprovementAnalysisResponse> analyzeCandidate(
            @RequestBody ImprovementAnalysisRequest request) {
        try {
            ImprovementAnalysisResponse response = improvementAnalyzerService.analyzeCandidate(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/mock-analysis")
    public ResponseEntity<ImprovementAnalysisResponse> getMockAnalysis() {
        try {
            ImprovementAnalysisResponse response = improvementAnalyzerService.getMockAnalysis();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/quick-analyze")
    public ResponseEntity<ImprovementAnalysisResponse> quickAnalyze(
            @RequestParam String resume,
            @RequestParam String interviewFeedback,
            @RequestParam String jobRole) {
        try {
            ImprovementAnalysisRequest request = new ImprovementAnalysisRequest();
            request.setResume(resume);
            request.setInterviewerFeedback(interviewFeedback);
            request.setJobDescription("Role: " + jobRole);
            request.setInterviewTranscript("No transcript available");

            ImprovementAnalysisResponse response = improvementAnalyzerService.analyzeCandidate(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}