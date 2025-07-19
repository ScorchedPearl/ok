package com.screening.interviews.service;

import com.screening.interviews.dto.*;
import com.screening.interviews.model.*;
import com.screening.interviews.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
@Transactional
public class OfferTemplateService {

    private final OfferTemplateRepository offerTemplateRepository;

    public OfferTemplateDTO createTemplate(CreateTemplateRequest request, Long createdById) {
        OfferTemplate template = new OfferTemplate();
        template.setName(request.getName());
        template.setDescription(request.getDescription());
        template.setTemplateContent(request.getTemplateContent());
        template.setCategory(request.getCategory());
        template.setCreatedBy(createdById);
        template.setIsActive(true);

        template = offerTemplateRepository.save(template);
        return convertToDTO(template);
    }

    public OfferTemplateDTO updateTemplate(Long templateId, CreateTemplateRequest request, Long updatedById) {
        OfferTemplate template = offerTemplateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        // Only allow creator to update
        if (!template.getCreatedBy().equals(updatedById)) {
            throw new RuntimeException("Only template creator can update the template");
        }

        template.setName(request.getName());
        template.setDescription(request.getDescription());
        template.setTemplateContent(request.getTemplateContent());
        template.setCategory(request.getCategory());

        template = offerTemplateRepository.save(template);
        return convertToDTO(template);
    }

    public OfferTemplateDTO getTemplate(Long templateId) {
        OfferTemplate template = offerTemplateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));
        return convertToDTO(template);
    }

    public List<OfferTemplateDTO> getAllActiveTemplates() {
        return offerTemplateRepository.findByIsActiveTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<OfferTemplateDTO> getTemplatesByCategory(String category) {
        return offerTemplateRepository.findByCategoryAndIsActiveTrue(category).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<OfferTemplateDTO> getMyTemplates(Long createdById) {
        return offerTemplateRepository.findByCreatedByAndIsActiveTrue(createdById).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public void deactivateTemplate(Long templateId, Long userId) {
        OfferTemplate template = offerTemplateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        // Only allow creator to deactivate
        if (!template.getCreatedBy().equals(userId)) {
            throw new RuntimeException("Only template creator can deactivate the template");
        }

        template.setIsActive(false);
        offerTemplateRepository.save(template);
    }

    public String processTemplateWithCustomizations(Long templateId, String customizations) {
        OfferTemplate template = offerTemplateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        String processedContent = template.getTemplateContent();

        // Process customizations if provided
        if (customizations != null && !customizations.isEmpty()) {
            // Parse JSON customizations and replace placeholders
            // Implementation would parse JSON and replace {{placeholder}} with actual values
            // For now, returning template content as-is
        }

        return processedContent;
    }

    private OfferTemplateDTO convertToDTO(OfferTemplate template) {
        OfferTemplateDTO dto = new OfferTemplateDTO();
        dto.setId(template.getId());
        dto.setName(template.getName());
        dto.setDescription(template.getDescription());
        dto.setTemplateContent(template.getTemplateContent());
        dto.setCategory(template.getCategory());
        dto.setCreatedBy(template.getCreatedBy());
        dto.setIsActive(template.getIsActive());
        dto.setCreatedAt(template.getCreatedAt());
        dto.setUpdatedAt(template.getUpdatedAt());
        return dto;
    }
}