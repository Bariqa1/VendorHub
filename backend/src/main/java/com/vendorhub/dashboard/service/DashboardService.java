package com.vendorhub.dashboard.service;

import com.vendorhub.contract.enums.ContractStatus;
import com.vendorhub.contract.repository.ContractRepository;
import com.vendorhub.dashboard.dto.DashboardMetricsDTO;
import com.vendorhub.vendor.enums.VendorStatus;
import com.vendorhub.vendor.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final VendorRepository vendorRepository;
    private final ContractRepository contractRepository;

    @Transactional(readOnly = true)
    public DashboardMetricsDTO getMetrics() {
        LocalDate today = LocalDate.now();
        LocalDate in30Days = today.plusDays(30);

        long totalVendors = vendorRepository.count();
        long activeVendors = vendorRepository.countByStatus(VendorStatus.APPROVED);
        long activeContracts = contractRepository.countByStatus(ContractStatus.ACTIVE);
        long contractsExpiringSoon = contractRepository.countExpiringSoon(today, in30Days);
        long pendingVendorApprovals = vendorRepository.countByStatus(VendorStatus.UNDER_REVIEW)
                + vendorRepository.countByStatus(VendorStatus.SUBMITTED);
        long pendingContractApprovals = contractRepository.countByStatus(ContractStatus.PENDING_APPROVAL);

        BigDecimal totalCommittedSAR = contractRepository.sumTotalAmountByStatus(ContractStatus.ACTIVE);

        return DashboardMetricsDTO.builder()
                .totalVendors(totalVendors)
                .activeVendors(activeVendors)
                .activeContracts(activeContracts)
                .contractsExpiringSoon(contractsExpiringSoon)
                .pendingApprovals(pendingVendorApprovals + pendingContractApprovals)
                .totalCommittedValueSAR(totalCommittedSAR != null ? totalCommittedSAR : BigDecimal.ZERO)
                .build();
    }
}
