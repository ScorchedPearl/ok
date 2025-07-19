
package com.screening.interviews.dto;
import com.screening.interviews.model.Signature;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignOfferRequest {
    private Signature.OfferSignatureType offerSignatureType;
    private String signatureData;
    private String consentText;
    private boolean agreedToElectronicSignature;
}