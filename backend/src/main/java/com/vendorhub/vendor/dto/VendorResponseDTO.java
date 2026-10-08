package com.vendorhub.vendor.dto;

import com.vendorhub.vendor.enums.VendorStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorResponseDTO {
    private UUID publicId;
    private String companyNameAr;
    private String companyNameEn;
    private String crNumber;
    private LocalDate crExpiryDate;
    private String taxNumber;
    private String nationalAddress;
    private String city;
    private String contactEmail;
    private String contactPhone;
    private String websiteUrl;
    private VendorStatus status;
    private BigDecimal complianceScore;
    private boolean crExpired;
    private Instant createdAt;
    private Instant updatedAt;
}
