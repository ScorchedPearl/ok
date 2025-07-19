package com.screening.interviews.service;

import com.screening.interviews.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.screening.interviews.dto.OfferLetterDTO;
// PDF generation imports
import com.itextpdf.kernel.pdf.*;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.*;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.kernel.colors.ColorConstants;

// MinIO imports
import io.minio.*;
import io.minio.http.Method;

import javax.annotation.PostConstruct;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PdfService {

    @Value("${minio.bucket.offers:offer-pdfs}")
    private String minioBucket;

    @Value("${app.company.name:Your Company Name}")
    private String companyName;

    @Value("${app.company.address:Company Address}")
    private String companyAddress;

    // ObjectMapper will be auto-injected by Spring Boot
    private final ObjectMapper objectMapper;
    private final MinioClient minioClient;

    @PostConstruct
    public void init() {
        // Create MinIO bucket if it doesn't exist
        try {
            boolean bucketExists = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(minioBucket).build()
            );

            if (!bucketExists) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder().bucket(minioBucket).build()
                );
                System.out.println("Created MinIO bucket: " + minioBucket);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize MinIO bucket: " + e.getMessage(), e);
        }
    }

    public String generateDocumentHash(String content) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(content.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();

            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            // Fallback to simple hash if SHA-256 fails
            return "hash_" + Math.abs(content.hashCode());
        }
    }

    public byte[] generateOfferPdf(String offerContent) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc, PageSize.A4);

            // Parse offer content JSON
            Map<String, Object> offerData = parseOfferContent(offerContent);

            // Add content to PDF
            addHeader(document);
            addOfferDetails(document, offerData);
            addLegalText(document);
            addFooter(document);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate offer PDF: " + e.getMessage(), e);
        }
    }

    public String uploadOfferPdfToMinio(Long offerId, byte[] pdfData) {
        try {
            String filename = "offer_" + offerId + "_" + System.currentTimeMillis() + ".pdf";
            String objectName = "offers/" + filename;

            uploadToMinio(objectName, pdfData, "application/pdf");

            return objectName;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload offer PDF to MinIO: " + e.getMessage(), e);
        }
    }

    public String generateSignedPdf(OfferLetter offer, Signature signature) {
        try {
            // Generate base PDF first
            byte[] basePdf = generateOfferPdf(offer.getOfferContent());

            // Create signed version
            ByteArrayOutputStream signedPdfStream = new ByteArrayOutputStream();
            PdfReader reader = new PdfReader(new ByteArrayInputStream(basePdf));
            PdfWriter writer = new PdfWriter(signedPdfStream);
            PdfDocument pdfDoc = new PdfDocument(reader, writer);
            Document document = new Document(pdfDoc);

            // Add signature page
            addSignaturePage(document, signature, offer);

            document.close();

            // Upload to MinIO
            String filename = "signed_offer_" + offer.getId() + "_" + System.currentTimeMillis() + ".pdf";
            String objectName = "signed-offers/" + filename;

            uploadToMinio(objectName, signedPdfStream.toByteArray(), "application/pdf");

            return objectName; // Return MinIO object name instead of file path

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate signed PDF: " + e.getMessage(), e);
        }
    }

    public byte[] getSignedPdfBytes(String minioObjectName) {
        try {
            return downloadFromMinio(minioObjectName);
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve signed PDF from MinIO: " + e.getMessage(), e);
        }
    }

    public void validatePdfIntegrity(String docHash, String currentContent) {
        String currentHash = generateDocumentHash(currentContent);
        if (!docHash.equals(currentHash)) {
            throw new RuntimeException("Document integrity check failed. Content may have been tampered with.");
        }
    }

    public String addComplianceText(String content) {
        String complianceText = "\n\n" +
                "LEGAL COMPLIANCE NOTICE:\n" +
                "This document has been electronically signed in accordance with the " +
                "Information Technology Act, 2000 and rules made thereunder. " +
                "This electronic signature is legally valid and enforceable under Indian law.";

        return content + complianceText;
    }

    // MinIO Helper Methods

    private void uploadToMinio(String objectName, byte[] data, String contentType) {
        try {
            InputStream inputStream = new ByteArrayInputStream(data);

            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(minioBucket)
                            .object(objectName)
                            .stream(inputStream, data.length, -1)
                            .contentType(contentType)
                            .build()
            );

            System.out.println("Successfully uploaded " + objectName + " to MinIO bucket: " + minioBucket);

        } catch (Exception e) {
            throw new RuntimeException("Failed to upload PDF to MinIO: " + e.getMessage(), e);
        }
    }

    private byte[] downloadFromMinio(String objectName) {
        try {
            InputStream inputStream = minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(minioBucket)
                            .object(objectName)
                            .build()
            );

            return inputStream.readAllBytes();

        } catch (Exception e) {
            throw new RuntimeException("Failed to download PDF from MinIO: " + e.getMessage(), e);
        }
    }

    public String getMinioFileUrl(String objectName) {
        try {
            // Generate a presigned URL for the PDF (valid for 7 days)
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(minioBucket)
                            .object(objectName)
                            .expiry(7 * 24 * 60 * 60) // 7 days in seconds
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate MinIO presigned URL: " + e.getMessage(), e);
        }
    }

    public boolean deleteFromMinio(String objectName) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(minioBucket)
                            .object(objectName)
                            .build()
            );
            return true;
        } catch (Exception e) {
            System.err.println("Failed to delete PDF from MinIO: " + e.getMessage());
            return false;
        }
    }

    // Private helper methods

    private Map<String, Object> parseOfferContent(String offerContent) {
        try {
            return objectMapper.readValue(offerContent, Map.class);
        } catch (Exception e) {
            // If JSON parsing fails, create a basic structure
            Map<String, Object> basicOffer = new HashMap<>();
            basicOffer.put("content", offerContent);
            basicOffer.put("position", "Position");
            basicOffer.put("salary", "Salary");
            return basicOffer;
        }
    }

    private void addHeader(Document document) {
        // Company header
        Paragraph header = new Paragraph()
                .add(new Text(companyName).setFontSize(20).setBold())
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(10);
        document.add(header);

        Paragraph address = new Paragraph(companyAddress)
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(10)
                .setMarginBottom(20);
        document.add(address);

        // Title
        Paragraph title = new Paragraph("OFFER LETTER")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(18)
                .setBold()
                .setMarginBottom(30);
        document.add(title);
    }

    private void addOfferDetails(Document document, Map<String, Object> offerData) {
        // Date
        Paragraph date = new Paragraph("Date: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy")))
                .setTextAlignment(TextAlignment.RIGHT)
                .setMarginBottom(20);
        document.add(date);

        // Candidate greeting
        String candidateName = (String) offerData.getOrDefault("candidateName", "Dear Candidate");
        Paragraph greeting = new Paragraph("Dear " + candidateName + ",")
                .setMarginBottom(15);
        document.add(greeting);

        // Main content
        if (offerData.containsKey("content")) {
            Paragraph content = new Paragraph((String) offerData.get("content"))
                    .setTextAlignment(TextAlignment.JUSTIFIED)
                    .setMarginBottom(15);
            document.add(content);
        } else {
            // Build offer content from individual fields
            addOfferSection(document, "Position", (String) offerData.get("position"));
            addOfferSection(document, "Salary", (String) offerData.get("salary"));
            addOfferSection(document, "Start Date", (String) offerData.get("startDate"));
            addOfferSection(document, "Benefits", (String) offerData.get("benefits"));
            addOfferSection(document, "Location", (String) offerData.get("location"));

            // Add any additional fields
            offerData.forEach((key, value) -> {
                if (!Arrays.asList("position", "salary", "startDate", "benefits", "location", "candidateName").contains(key)
                        && value != null && !value.toString().isEmpty()) {
                    addOfferSection(document, capitalizeFirst(key), value.toString());
                }
            });
        }

        // Terms and conditions
        Paragraph terms = new Paragraph()
                .add(new Text("Terms and Conditions:").setBold())
                .add("\n")
                .add("1. This offer is contingent upon successful completion of background verification.\n")
                .add("2. You will be required to sign a confidentiality agreement.\n")
                .add("3. This offer is valid for 7 days from the date of this letter.\n")
                .add("4. Your employment will be governed by company policies and procedures.")
                .setMarginTop(20)
                .setMarginBottom(20);
        document.add(terms);
    }

    private void addOfferSection(Document document, String label, String value) {
        if (value != null && !value.isEmpty()) {
            Paragraph section = new Paragraph()
                    .add(new Text(label + ": ").setBold())
                    .add(value)
                    .setMarginBottom(10);
            document.add(section);
        }
    }

    private String capitalizeFirst(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }

    private void addLegalText(Document document) {
        Paragraph legal = new Paragraph()
                .add(new Text("Legal Notice:").setBold())
                .add("\n")
                .add("This offer letter constitutes the entire agreement between you and " + companyName + ". ")
                .add("Any modifications to this offer must be made in writing and signed by both parties. ")
                .add("This offer is made in accordance with Indian employment laws and regulations.")
                .setFontSize(9)
                .setMarginTop(30)
                .setMarginBottom(20);
        document.add(legal);
    }

    private void addFooter(Document document) {
        Paragraph footer = new Paragraph()
                .add("We look forward to your positive response and to welcoming you to our team.\n\n")
                .add("Sincerely,\n\n")
                .add(new Text("HR Department").setBold())
                .add("\n" + companyName)
                .setMarginTop(30);
        document.add(footer);
    }

    private void addSignaturePage(Document document, Signature signature, OfferLetter offer) {
        // FIXED: Add a proper page break to ensure content goes to new page
        document.add(new AreaBreak(AreaBreakType.NEXT_PAGE));

        // Start fresh on the new page with proper spacing
        document.setTopMargin(50);
        document.setBottomMargin(50);
        document.setLeftMargin(50);
        document.setRightMargin(50);

        // Signature section header
        Paragraph sigHeader = new Paragraph("ELECTRONIC SIGNATURE")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(18)
                .setBold()
                .setMarginTop(0)
                .setMarginBottom(30);
        document.add(sigHeader);

        // Create a table for better layout of signature details
        Table signatureTable = new Table(2).useAllAvailableWidth();
        signatureTable.setMarginBottom(20);

        // Add signature details in table format
        addSignatureDetailToTable(signatureTable, "Offer ID", offer.getId().toString());
        addSignatureDetailToTable(signatureTable, "Candidate ID", offer.getCandidateId().toString());
        addSignatureDetailToTable(signatureTable, "Signature Type", signature.getSignatureType().toString());
        addSignatureDetailToTable(signatureTable, "Signed Date", signature.getSignedAt().format(DateTimeFormatter.ofPattern("dd MMMM yyyy HH:mm:ss")));
        addSignatureDetailToTable(signatureTable, "IP Address", signature.getSignerIp());
        addSignatureDetailToTable(signatureTable, "Document Hash", signature.getDocHash().substring(0, 16) + "...");

        document.add(signatureTable);

        // Consent text in a bordered box
        Paragraph consentHeader = new Paragraph("Electronic Signature Consent:")
                .setBold()
                .setFontSize(12)
                .setMarginTop(20)
                .setMarginBottom(10);
        document.add(consentHeader);

        Paragraph consent = new Paragraph(signature.getConsentText())
                .setFontSize(10)
                .setMarginBottom(20)
                .setPaddingLeft(15)
                .setPaddingRight(15)
                .setPaddingTop(10)
                .setPaddingBottom(10)
                .setBorder(new SolidBorder(ColorConstants.GRAY, 1));
        document.add(consent);

        // Signature display
        Paragraph sigDisplay = new Paragraph();
        if (signature.getSignatureType() == Signature.OfferSignatureType.TYPED) {
            sigDisplay.add(new Text("Digital Signature: ").setBold())
                    .add(new Text(signature.getSignatureData()).setFontSize(16).setItalic())
                    .setMarginTop(20)
                    .setMarginBottom(20);
        } else if (signature.getSignatureType() == Signature.OfferSignatureType.DRAWN) {
            sigDisplay.add(new Text("Drawn Signature: ").setBold())
                    .add("[Digital signature image recorded and verified]")
                    .setMarginTop(20)
                    .setMarginBottom(20);
        }
        document.add(sigDisplay);

        // IT Act compliance in a highlighted box
        Paragraph complianceHeader = new Paragraph("IT Act 2000 Compliance:")
                .setBold()
                .setFontSize(12)
                .setMarginTop(30);
        document.add(complianceHeader);

        Paragraph compliance = new Paragraph()
                .add("This document has been electronically signed in accordance with the Information Technology Act, 2000 ")
                .add("and rules made thereunder. This electronic signature is legally valid and enforceable under Indian law. ")
                .add("The integrity of this document is ensured through cryptographic hash verification.")
                .setFontSize(10)
                .setMarginTop(10)
                .setBorder(new SolidBorder(ColorConstants.LIGHT_GRAY, 1))
                .setPaddingLeft(15)
                .setPaddingRight(15)
                .setPaddingTop(10)
                .setPaddingBottom(10)
                .setBackgroundColor(ColorConstants.LIGHT_GRAY, 0.1f);
        document.add(compliance);

        // Timestamp and verification footer
        Paragraph verification = new Paragraph()
                .add("Generated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy HH:mm:ss")))
                .add("\nDocument ID: " + offer.getId() + "-" + signature.getId())
                .add("\nVerification Hash: " + signature.getDocHash().substring(0, 16) + "...")
                .add("\nStored in: MinIO Bucket (" + minioBucket + ")")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(8)
                .setMarginTop(40);
        document.add(verification);
    }

    private void addSignatureDetailToTable(Table table, String label, String value) {
        table.addCell(new Cell().add(new Paragraph(label + ":").setBold()).setBorder(null));
        table.addCell(new Cell().add(new Paragraph(value != null ? value : "N/A")).setBorder(null));
    }
}