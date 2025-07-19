package com.screening.interviews.dto;
import com.screening.interviews.model.Signature;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.screening.interviews.dto.OfferLetterDTO;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignatureDTO {
    private Long id;
    private Long offerId;
    private Long candidateId;
    private Signature.OfferSignatureType offerSignatureType;
    private String signatureData;
    private String consentText;
    private LocalDateTime signedAt;
    private String signerIp;
    private String signerUserAgent;
    private String docHash;
}
