package com.vendorhub.vendor.dto;

import com.vendorhub.vendor.enums.VendorStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorStatusUpdateRequest {

    @NotNull(message = "Vendor status is required")
    private VendorStatus status;

    private String remarks;
}
