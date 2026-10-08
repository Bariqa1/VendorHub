package com.vendorhub.contract.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MilestoneCreateRequest {

    @NotBlank(message = "Milestone title is required")
    private String title;

    @NotNull(message = "Milestone amount is required")
    @DecimalMin(value = "0.00", message = "Milestone amount must be non-negative")
    private BigDecimal amount;

    @NotNull(message = "Milestone due date is required")
    private LocalDate dueDate;
}
