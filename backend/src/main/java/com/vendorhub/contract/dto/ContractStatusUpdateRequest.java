package com.vendorhub.contract.dto;

import com.vendorhub.contract.enums.ContractStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractStatusUpdateRequest {

    @NotNull(message = "Contract status is required")
    private ContractStatus status;

    private String remarks;
}
