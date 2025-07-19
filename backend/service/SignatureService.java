package com.screening.interviews.service;

import com.screening.interviews.dto.*;
import com.screening.interviews.model.*;
import com.screening.interviews.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SignatureService {

    private final SignatureRepository signatureRepository;
    private final OfferLetterRepository offerLetterRepository;
    private final OfferLetterService offerLetterService;
    private final NotificationService notificationService;
    private final PdfService pdfService;

    public SignatureDTO signOffer(Long offerId, SignOfferRequest request, String signerIp, String userAgent) {
        OfferLetter offer = offerLetterRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        if (offer.getStatus() != OfferLetter.OfferStatus.READY_FOR_SIGN) {
            throw new RuntimeException("Offer is not ready for signature");
        }

        if (!request.isAgreedToElectronicSignature()) {
            throw new RuntimeException("Electronic signature consent is required");
        }

        // Create signature record
        Signature signature = new Signature();
        signature.setOffer(offer);
        signature.setCandidateId(offer.getCandidateId());
        signature.setSignatureType(request.getOfferSignatureType());
        signature.setSignatureData(request.getSignatureData());
        signature.setConsentText(request.getConsentText());
        signature.setSignedAt(LocalDateTime.now());
        signature.setSignerIp(signerIp);
        signature.setSignerUserAgent(userAgent);

        // Generate document hash
        String docHash = pdfService.generateDocumentHash(offer.getOfferContent());
        signature.setDocHash(docHash);

        signature = signatureRepository.save(signature);

        // Generate signed PDF
        String signedPdfUrl = pdfService.generateSignedPdf(offer, signature);

        // Update offer status
        offerLetterService.markOfferSigned(offerId, signedPdfUrl);

        // Send notifications
        notificationService.sendSignedOfferNotification(offer);

        return convertToDTO(signature);
    }

    public SignatureDTO getSignature(Long offerId) {
        Signature signature = signatureRepository.findByOfferId(offerId)
                .orElseThrow(() -> new RuntimeException("Signature not found for offer"));
        return convertToDTO(signature);
    }

    private SignatureDTO convertToDTO(Signature signature) {
        SignatureDTO dto = new SignatureDTO();
        dto.setId(signature.getId());
        dto.setOfferId(signature.getOffer().getId());
        dto.setCandidateId(signature.getCandidateId());
        dto.setOfferSignatureType(signature.getSignatureType());
        dto.setSignatureData(signature.getSignatureData());
        dto.setConsentText(signature.getConsentText());
        dto.setSignedAt(signature.getSignedAt());
        dto.setSignerIp(signature.getSignerIp());
        dto.setSignerUserAgent(signature.getSignerUserAgent());
        dto.setDocHash(signature.getDocHash());
        return dto;
    }
}
