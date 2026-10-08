package com.vendorhub.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardMetricsDTO {
    private long totalVendors;
    private long activeVendors;
    private long activeContracts;
    private long contractsExpiringSoon;
    private long pendingApprovals;
    private BigDecimal totalCommittedValueSAR;
}
