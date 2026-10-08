package com.vendorhub.ai.controller;

import com.vendorhub.ai.dto.ContractAnalysisResponseDTO;
import com.vendorhub.ai.dto.ContractQuestionRequest;
import com.vendorhub.ai.dto.ContractQuestionResponseDTO;
import com.vendorhub.ai.service.AiContractService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ai/contracts")
@RequiredArgsConstructor
@Tag(name = "AI Contract Intelligence", description = "AI microservice integration for automated contract analysis and conversational Q&A")
public class AiContractController {

    private final AiContractService aiContractService;

    @PostMapping("/{publicId}/analyze")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER', 'MANAGER')")
    @Operation(summary = "Analyze contract with AI", description = "Invokes AI microservice to summarize contract, extract parties, key dates, financial terms, and clauses")
    public ResponseEntity<ContractAnalysisResponseDTO> analyzeContract(@PathVariable UUID publicId) {
        ContractAnalysisResponseDTO response = aiContractService.analyzeContract(publicId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{publicId}/ask")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER', 'MANAGER')")
    @Operation(summary = "Ask question about contract", description = "Natural language question-answering over contract terms and legal clauses")
    public ResponseEntity<ContractQuestionResponseDTO> askQuestion(
            @PathVariable UUID publicId,
            @Valid @RequestBody ContractQuestionRequest request) {
        ContractQuestionResponseDTO response = aiContractService.askQuestion(publicId, request);
        return ResponseEntity.ok(response);
    }
}
