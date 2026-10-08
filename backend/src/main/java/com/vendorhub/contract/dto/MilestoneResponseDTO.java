package com.vendorhub.contract.dto;

import com.vendorhub.contract.enums.MilestoneStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MilestoneResponseDTO {
    private Long id;
    private String title;
    private BigDecimal amount;
    private LocalDate dueDate;
    private MilestoneStatus status;
    private Instant completedAt;
}
