package com.vendorhub.contract.controller;

import com.vendorhub.common.dto.PageResponse;
import com.vendorhub.contract.dto.ContractCreateRequest;
import com.vendorhub.contract.dto.ContractResponseDTO;
import com.vendorhub.contract.dto.ContractStatusUpdateRequest;
import com.vendorhub.contract.enums.ContractStatus;
import com.vendorhub.contract.service.ContractService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/contracts")
@RequiredArgsConstructor
@Tag(name = "Contracts", description = "Commercial contract drafting, lifecycle management, and milestone tracking")
public class ContractController {

    private final ContractService contractService;

    @GetMapping
    @Operation(summary = "Get paginated contracts", description = "Query contracts with pagination, status filtering, and vendor filtering")
    public ResponseEntity<PageResponse<ContractResponseDTO>> getContracts(
            @RequestParam(required = false) ContractStatus status,
            @RequestParam(required = false) UUID vendorPublicId,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<ContractResponseDTO> response = contractService.getContracts(status, vendorPublicId, search, pageable);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    @Operation(summary = "Create contract draft", description = "Creates a contract agreement with deliverable milestones linked to an approved vendor")
    public ResponseEntity<ContractResponseDTO> createContract(@Valid @RequestBody ContractCreateRequest request) {
        ContractResponseDTO created = contractService.createContract(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{publicId}")
    @Operation(summary = "Get contract details", description = "Retrieves contract details and milestones by public UUID")
    public ResponseEntity<ContractResponseDTO> getContractByPublicId(@PathVariable UUID publicId) {
        ContractResponseDTO contract = contractService.getContractByPublicId(publicId);
        return ResponseEntity.ok(contract);
    }

    @PatchMapping("/{publicId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update contract status", description = "Transitions contract lifecycle (e.g. approve, activate, terminate)")
    public ResponseEntity<ContractResponseDTO> updateContractStatus(
            @PathVariable UUID publicId,
            @Valid @RequestBody ContractStatusUpdateRequest request) {
        ContractResponseDTO updated = contractService.updateContractStatus(publicId, request);
        return ResponseEntity.ok(updated);
    }
}
