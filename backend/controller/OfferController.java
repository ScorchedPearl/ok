package com.screening.interviews.controller;

import com.screening.interviews.dto.*;
import com.screening.interviews.model.OfferLetter;
import com.screening.interviews.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
public class OfferController {

    private final OfferLetterService offerLetterService;
    private final PdfService pdfService;
    private final AIEnhancementService aiEnhancementService;

    @PostMapping
    public ResponseEntity<OfferLetterDTO> createOffer(
            @RequestBody CreateOfferRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        OfferLetterDTO offer = offerLetterService.createOffer(request, userId);
        return ResponseEntity.ok(offer);
    }

    @RequestMapping(value = "/create-from-template", method = RequestMethod.POST)
    public ResponseEntity<OfferLetterDTO> createOfferFromTemplate(
            @RequestBody CreateOfferFromTemplateRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        OfferLetterDTO offer = offerLetterService.createOfferFromTemplate(request, userId);
        return ResponseEntity.ok(offer);
    }

    @RequestMapping(value = "/enhance", method = RequestMethod.POST)
    public ResponseEntity<EnhanceOfferResponse> enhanceOffer(
            @RequestBody EnhanceOfferRequest request) {
        EnhanceOfferResponse response = aiEnhancementService.enhanceOffer(request);
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/improve-tone", method = RequestMethod.POST)
    public ResponseEntity<String> improveOfferTone(
            @RequestParam String offerContent,
            @RequestParam String desiredTone) {
        String improvedContent = aiEnhancementService.improveOfferTone(offerContent, desiredTone);
        return ResponseEntity.ok(improvedContent);
    }

    @RequestMapping(value = "/suggestions", method = RequestMethod.GET)
    public ResponseEntity<List<String>> getOfferSuggestions(
            @RequestParam String role,
            @RequestParam String experience,
            @RequestParam(required = false, defaultValue = "Company") String company) {
        List<String> suggestions = aiEnhancementService.generateOfferSuggestions(role, experience, company);
        return ResponseEntity.ok(suggestions);
    }

    @RequestMapping(value = "/status/{status}", method = RequestMethod.GET)
    public ResponseEntity<List<OfferSummaryDTO>> getOffersByStatus(@PathVariable OfferLetter.OfferStatus status) {
        List<OfferSummaryDTO> offers = offerLetterService.getOffersByStatus(status);
        return ResponseEntity.ok(offers);
    }

    @RequestMapping(value = "/my-offers", method = RequestMethod.GET)
    public ResponseEntity<List<OfferSummaryDTO>> getMyOffers(@RequestHeader("X-User-Id") Long userId) {
        List<OfferSummaryDTO> offers = offerLetterService.getOffersByCreator(userId);
        return ResponseEntity.ok(offers);
    }

    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<List<OfferSummaryDTO>> getAllOffers() {
        List<OfferSummaryDTO> offers = offerLetterService.getAllOffers();
        return ResponseEntity.ok(offers);
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<OfferLetterDTO> submitForApproval(
            @PathVariable Long id,
            @RequestBody(required = false) ApprovalWorkflowRequest workflowRequest,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String userRole) {
        OfferLetterDTO offer = offerLetterService.submitForApproval(id, userId, userRole, workflowRequest);
        return ResponseEntity.ok(offer);
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadOfferPdf(@PathVariable Long id) {
        OfferLetterDTO offer = offerLetterService.getOffer(id);
        byte[] pdfBytes = pdfService.generateOfferPdf(offer.getOfferContent());

        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=offer_" + id + ".pdf")
                .body(pdfBytes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OfferLetterDTO> getOffer(@PathVariable Long id) {
        OfferLetterDTO offer = offerLetterService.getOffer(id);
        return ResponseEntity.ok(offer);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OfferLetterDTO> updateOffer(
            @PathVariable Long id,
            @RequestBody CreateOfferRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        OfferLetterDTO offer = offerLetterService.updateOffer(id, request, userId);
        return ResponseEntity.ok(offer);
    }
}
