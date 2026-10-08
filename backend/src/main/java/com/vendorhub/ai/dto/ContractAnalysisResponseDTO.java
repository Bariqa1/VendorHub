package com.vendorhub.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractAnalysisResponseDTO {
    private UUID contractPublicId;
    private String summary;
    private Map<String, String> parties;
    private Map<String, LocalDate> keyDates;
    private Map<String, Object> financialTerms;
    private List<Map<String, String>> clauses;
    private BigDecimal confidenceScore;
    private boolean processedByAiMicroservice;
}
