package com.screening.interviews.dto;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOfferRequest {
    private Long candidateId;
    private String offerContent; // JSON string with offer details
}
