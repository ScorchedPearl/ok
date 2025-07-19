package com.screening.interviews.model;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "offer_templates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OfferTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @Column(columnDefinition = "text", nullable = false)
    private String templateContent; // JSON structure for the template

    @Column(nullable = false)
    private String category; // e.g., "TECHNICAL", "SALES", "EXECUTIVE", "INTERN"

    @Column(nullable = false)
    private Long createdBy; // User ID from auth service

    @Column(nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
