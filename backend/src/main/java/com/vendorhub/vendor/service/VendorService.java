package com.vendorhub.vendor.service;

import com.vendorhub.audit.entity.AuditLog;
import com.vendorhub.audit.repository.AuditLogRepository;
import com.vendorhub.common.dto.PageResponse;
import com.vendorhub.common.exception.DuplicateResourceException;
import com.vendorhub.common.exception.ResourceNotFoundException;
import com.vendorhub.vendor.dto.VendorCreateRequest;
import com.vendorhub.vendor.dto.VendorResponseDTO;
import com.vendorhub.vendor.dto.VendorStatusUpdateRequest;
import com.vendorhub.vendor.dto.VendorUpdateRequest;
import com.vendorhub.vendor.entity.Vendor;
import com.vendorhub.vendor.enums.VendorStatus;
import com.vendorhub.vendor.mapper.VendorMapper;
import com.vendorhub.vendor.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class VendorService {

    private final VendorRepository vendorRepository;
    private final VendorMapper vendorMapper;
    private final AuditLogRepository auditLogRepository;

    @Transactional
    public VendorResponseDTO createVendor(VendorCreateRequest request) {
        if (vendorRepository.existsByCrNumber(request.getCrNumber())) {
            throw new DuplicateResourceException("Vendor already exists with CR number: " + request.getCrNumber());
        }

        if (vendorRepository.existsByTaxNumber(request.getTaxNumber())) {
            throw new DuplicateResourceException("Vendor already exists with VAT/Tax number: " + request.getTaxNumber());
        }

        Vendor vendor = vendorMapper.toEntity(request);
        Vendor savedVendor = vendorRepository.save(vendor);

        recordAuditLog("Vendor", savedVendor.getId(), "CREATE",
                "Vendor registered with CR: " + savedVendor.getCrNumber());

        log.info("Vendor created successfully with public ID: {}", savedVendor.getPublicId());
        return vendorMapper.toResponseDTO(savedVendor);
    }

    @Transactional(readOnly = true)
    public VendorResponseDTO getVendorByPublicId(UUID publicId) {
        Vendor vendor = vendorRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", "publicId", publicId));
        return vendorMapper.toResponseDTO(vendor);
    }

    @Transactional(readOnly = true)
    public PageResponse<VendorResponseDTO> getVendors(VendorStatus status, String search, Pageable pageable) {
        Page<Vendor> vendorPage = vendorRepository.searchVendors(status, search, pageable);
        return PageResponse.from(vendorPage.map(vendorMapper::toResponseDTO));
    }

    @Transactional
    public VendorResponseDTO updateVendor(UUID publicId, VendorUpdateRequest request) {
        Vendor vendor = vendorRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", "publicId", publicId));

        vendorMapper.updateEntityFromDTO(vendor, request);
        Vendor updatedVendor = vendorRepository.save(vendor);

        recordAuditLog("Vendor", updatedVendor.getId(), "UPDATE",
                "Vendor details updated for: " + updatedVendor.getCompanyNameEn());

        return vendorMapper.toResponseDTO(updatedVendor);
    }

    @Transactional
    public VendorResponseDTO updateVendorStatus(UUID publicId, VendorStatusUpdateRequest request) {
        Vendor vendor = vendorRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", "publicId", publicId));

        VendorStatus oldStatus = vendor.getStatus();
        vendor.setStatus(request.getStatus());
        Vendor savedVendor = vendorRepository.save(vendor);

        String details = String.format("Status changed from %s to %s. Remarks: %s",
                oldStatus, request.getStatus(), request.getRemarks() != null ? request.getRemarks() : "None");
        recordAuditLog("Vendor", savedVendor.getId(), "STATUS_CHANGE", details);

        log.info("Vendor {} status updated from {} to {}", publicId, oldStatus, request.getStatus());
        return vendorMapper.toResponseDTO(savedVendor);
    }

    private void recordAuditLog(String entityName, Long entityId, String action, String details) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String actor = (auth != null && auth.isAuthenticated()) ? auth.getName() : "SYSTEM";

        AuditLog logEntry = AuditLog.builder()
                .entityName(entityName)
                .entityId(entityId)
                .action(action)
                .performedBy(actor)
                .details(details)
                .build();
        auditLogRepository.save(logEntry);
    }
}
