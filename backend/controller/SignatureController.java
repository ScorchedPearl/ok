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
@RequestMapping("/api/signatures")
@RequiredArgsConstructor
public class SignatureController {

    private final SignatureService signatureService;
    private final PdfService pdfService;
    private final OfferLetterService offerLetterService;

    @PostMapping("/offers/{offerId}/sign")
    public ResponseEntity<SignatureDTO> signOffer(
            @PathVariable Long offerId,
            @RequestBody SignOfferRequest request,
            HttpServletRequest httpRequest) {

        String signerIp = getClientIpAddress(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        SignatureDTO signature = signatureService.signOffer(offerId, request, signerIp, userAgent);
        return ResponseEntity.ok(signature);
    }

    @GetMapping("/offers/{offerId}")
    public ResponseEntity<SignatureDTO> getSignature(@PathVariable Long offerId) {
        SignatureDTO signature = signatureService.getSignature(offerId);
        return ResponseEntity.ok(signature);
    }

    @GetMapping("/offers/{offerId}/signed-pdf")
    public ResponseEntity<byte[]> downloadSignedPdf(@PathVariable Long offerId) {
        try {
            OfferLetterDTO offer = offerLetterService.getOffer(offerId);

            if (offer.getSignedPdfUrl() == null) {
                throw new RuntimeException("No signed PDF available for this offer");
            }

            byte[] pdfBytes = pdfService.getSignedPdfBytes(offer.getSignedPdfUrl());

            return ResponseEntity.ok()
                    .header("Content-Type", "application/pdf")
                    .header("Content-Disposition", "attachment; filename=signed_offer_" + offerId + ".pdf")
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedForHeader = request.getHeader("X-Forwarded-For");
        if (xForwardedForHeader == null) {
            return request.getRemoteAddr();
        } else {
            return xForwardedForHeader.split(",")[0];
        }
    }
}
