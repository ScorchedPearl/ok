package com.screening.interviews.controller;

import com.screening.interviews.dto.*;
import com.screening.interviews.model.OfferLetter;
import com.screening.interviews.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final OfferTemplateService offerTemplateService;

    @PostMapping
    public ResponseEntity<OfferTemplateDTO> createTemplate(
            @RequestBody CreateTemplateRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        OfferTemplateDTO template = offerTemplateService.createTemplate(request, userId);
        return ResponseEntity.ok(template);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OfferTemplateDTO> getTemplate(@PathVariable Long id) {
        OfferTemplateDTO template = offerTemplateService.getTemplate(id);
        return ResponseEntity.ok(template);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OfferTemplateDTO> updateTemplate(
            @PathVariable Long id,
            @RequestBody CreateTemplateRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        OfferTemplateDTO template = offerTemplateService.updateTemplate(id, request, userId);
        return ResponseEntity.ok(template);
    }

    @GetMapping
    public ResponseEntity<List<OfferTemplateDTO>> getAllActiveTemplates() {
        List<OfferTemplateDTO> templates = offerTemplateService.getAllActiveTemplates();
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<OfferTemplateDTO>> getTemplatesByCategory(@PathVariable String category) {
        List<OfferTemplateDTO> templates = offerTemplateService.getTemplatesByCategory(category);
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/my-templates")
    public ResponseEntity<List<OfferTemplateDTO>> getMyTemplates(@RequestHeader("X-User-Id") Long userId) {
        List<OfferTemplateDTO> templates = offerTemplateService.getMyTemplates(userId);
        return ResponseEntity.ok(templates);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateTemplate(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        offerTemplateService.deactivateTemplate(id, userId);
        return ResponseEntity.ok().build();
    }
}
