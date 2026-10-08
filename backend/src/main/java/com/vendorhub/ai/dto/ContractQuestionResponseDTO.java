package com.vendorhub.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractQuestionResponseDTO {
    private UUID contractPublicId;
    private String question;
    private String answer;
    private String relevantClause;
    private BigDecimal confidenceScore;
    private List<String> citations;
    private Boolean grounded;
    private Boolean guardrailsPassed;
    private String guardrailType;
}
