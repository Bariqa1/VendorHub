package com.vendorhub.vendor.mapper;

import com.vendorhub.vendor.dto.VendorCreateRequest;
import com.vendorhub.vendor.dto.VendorResponseDTO;
import com.vendorhub.vendor.dto.VendorUpdateRequest;
import com.vendorhub.vendor.entity.Vendor;
import com.vendorhub.vendor.enums.VendorStatus;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class VendorMapper {

    public VendorResponseDTO toResponseDTO(Vendor vendor) {
        if (vendor == null) return null;

        return VendorResponseDTO.builder()
                .publicId(vendor.getPublicId())
                .companyNameAr(vendor.getCompanyNameAr())
                .companyNameEn(vendor.getCompanyNameEn())
                .crNumber(vendor.getCrNumber())
                .crExpiryDate(vendor.getCrExpiryDate())
                .taxNumber(vendor.getTaxNumber())
                .nationalAddress(vendor.getNationalAddress())
                .city(vendor.getCity())
                .contactEmail(vendor.getContactEmail())
                .contactPhone(vendor.getContactPhone())
                .websiteUrl(vendor.getWebsiteUrl())
                .status(vendor.getStatus())
                .complianceScore(vendor.getComplianceScore())
                .crExpired(vendor.isCrExpired())
                .createdAt(vendor.getCreatedAt())
                .updatedAt(vendor.getUpdatedAt())
                .build();
    }

    public Vendor toEntity(VendorCreateRequest request) {
        if (request == null) return null;

        return Vendor.builder()
                .companyNameAr(request.getCompanyNameAr())
                .companyNameEn(request.getCompanyNameEn())
                .crNumber(request.getCrNumber())
                .crExpiryDate(request.getCrExpiryDate())
                .taxNumber(request.getTaxNumber())
                .nationalAddress(request.getNationalAddress())
                .city(request.getCity())
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .websiteUrl(request.getWebsiteUrl())
                .status(VendorStatus.SUBMITTED)
                .complianceScore(new BigDecimal("100.00"))
                .build();
    }

    public void updateEntityFromDTO(Vendor vendor, VendorUpdateRequest request) {
        if (vendor == null || request == null) return;

        vendor.setCompanyNameAr(request.getCompanyNameAr());
        vendor.setCompanyNameEn(request.getCompanyNameEn());
        vendor.setNationalAddress(request.getNationalAddress());
        vendor.setCity(request.getCity());
        vendor.setContactEmail(request.getContactEmail());
        vendor.setContactPhone(request.getContactPhone());
        vendor.setWebsiteUrl(request.getWebsiteUrl());
    }
}
