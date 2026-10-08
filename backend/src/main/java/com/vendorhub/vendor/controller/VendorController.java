package com.vendorhub.vendor.controller;

import com.vendorhub.common.dto.PageResponse;
import com.vendorhub.vendor.dto.VendorCreateRequest;
import com.vendorhub.vendor.dto.VendorResponseDTO;
import com.vendorhub.vendor.dto.VendorStatusUpdateRequest;
import com.vendorhub.vendor.dto.VendorUpdateRequest;
import com.vendorhub.vendor.enums.VendorStatus;
import com.vendorhub.vendor.service.VendorService;
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
@RequestMapping("/api/v1/vendors")
@RequiredArgsConstructor
@Tag(name = "Vendors", description = "Vendor registration, lifecycle management, and querying endpoints")
public class VendorController {

    private final VendorService vendorService;

    @GetMapping
    @Operation(summary = "Get paginated vendors", description = "Query vendors with server-side pagination, sorting, status filtering, and keyword search")
    public ResponseEntity<PageResponse<VendorResponseDTO>> getVendors(
            @RequestParam(required = false) VendorStatus status,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<VendorResponseDTO> response = vendorService.getVendors(status, search, pageable);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    @Operation(summary = "Register new vendor", description = "Creates a new vendor profile with Saudi CR, Tax ID, and contact details")
    public ResponseEntity<VendorResponseDTO> createVendor(@Valid @RequestBody VendorCreateRequest request) {
        VendorResponseDTO created = vendorService.createVendor(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{publicId}")
    @Operation(summary = "Get vendor details", description = "Retrieves vendor details by unique public UUID")
    public ResponseEntity<VendorResponseDTO> getVendorByPublicId(@PathVariable UUID publicId) {
        VendorResponseDTO vendor = vendorService.getVendorByPublicId(publicId);
        return ResponseEntity.ok(vendor);
    }

    @PutMapping("/{publicId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    @Operation(summary = "Update vendor", description = "Updates editable contact and profile fields of a vendor")
    public ResponseEntity<VendorResponseDTO> updateVendor(
            @PathVariable UUID publicId,
            @Valid @RequestBody VendorUpdateRequest request) {
        VendorResponseDTO updated = vendorService.updateVendor(publicId, request);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{publicId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER')")
    @Operation(summary = "Update vendor approval status", description = "Transitions vendor status between DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, SUSPENDED")
    public ResponseEntity<VendorResponseDTO> updateVendorStatus(
            @PathVariable UUID publicId,
            @Valid @RequestBody VendorStatusUpdateRequest request) {
        VendorResponseDTO updated = vendorService.updateVendorStatus(publicId, request);
        return ResponseEntity.ok(updated);
    }
}
