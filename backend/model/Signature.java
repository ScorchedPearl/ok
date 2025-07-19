package com.screening.interviews.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "signatures")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Signature {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offer_id", nullable = false)
    private OfferLetter offer;

    @Column(nullable = false)
    private Long candidateId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OfferSignatureType signatureType;

    @Column(columnDefinition = "text")
    private String signatureData; // base64 for drawn, text for typed

    @Column(columnDefinition = "text")
    private String consentText;

    private LocalDateTime signedAt;

    private String signerIp;

    private String signerUserAgent;

    private String docHash;

    public enum OfferSignatureType {
        DRAWN, TYPED
    }
}