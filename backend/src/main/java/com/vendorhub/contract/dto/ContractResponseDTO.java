package com.vendorhub.contract.dto;

import com.vendorhub.contract.enums.ContractStatus;
import com.vendorhub.contract.enums.ContractType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractResponseDTO {
    private UUID publicId;
    private String contractNumber;
    private String title;
    private String description;
    private UUID vendorPublicId;
    private String vendorCompanyNameAr;
    private String vendorCompanyNameEn;
    private ContractType contractType;
    private ContractStatus status;
    private BigDecimal totalAmount;
    private String currency;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean autoRenew;
    private String paymentTerms;
    private Instant signedAt;
    private String signedByUserName;
    private boolean active;
    @Builder.Default
    private List<MilestoneResponseDTO> milestones = new ArrayList<>();
    private Instant createdAt;
    private Instant updatedAt;
}
