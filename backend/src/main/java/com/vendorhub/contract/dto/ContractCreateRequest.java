package com.vendorhub.contract.dto;

import com.vendorhub.contract.enums.ContractType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractCreateRequest {

    @NotNull(message = "Vendor public ID is required")
    private UUID vendorPublicId;

    @NotBlank(message = "Contract number is required")
    @Size(max = 50)
    private String contractNumber;

    @NotBlank(message = "Contract title is required")
    @Size(max = 255)
    private String title;

    private String description;

    @NotNull(message = "Contract type is required")
    private ContractType contractType;

    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "0.00", message = "Total amount must be non-negative")
    private BigDecimal totalAmount;

    @Size(min = 3, max = 3)
    @Builder.Default
    private String currency = "SAR";

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @Builder.Default
    private boolean autoRenew = false;

    private String paymentTerms;

    @Valid
    @Builder.Default
    private List<MilestoneCreateRequest> milestones = new ArrayList<>();
}
