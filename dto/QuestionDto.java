package com.screening.interviews.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class QuestionDto {
    private UUID questionId;
    private String questionText;
}