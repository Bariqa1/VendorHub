package com.vendorhub.contract.mapper;

import com.vendorhub.contract.dto.ContractCreateRequest;
import com.vendorhub.contract.dto.ContractResponseDTO;
import com.vendorhub.contract.dto.MilestoneResponseDTO;
import com.vendorhub.contract.entity.Contract;
import com.vendorhub.contract.entity.ContractMilestone;
import com.vendorhub.contract.enums.ContractStatus;
import com.vendorhub.contract.enums.MilestoneStatus;
import com.vendorhub.vendor.entity.Vendor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ContractMapper {

    public ContractResponseDTO toResponseDTO(Contract contract) {
        if (contract == null) return null;

        List<MilestoneResponseDTO> milestoneDTOs = contract.getMilestones() == null ? List.of() :
                contract.getMilestones().stream()
                        .map(this::toMilestoneDTO)
                        .collect(Collectors.toList());

        return ContractResponseDTO.builder()
                .publicId(contract.getPublicId())
                .contractNumber(contract.getContractNumber())
                .title(contract.getTitle())
                .description(contract.getDescription())
                .vendorPublicId(contract.getVendor() != null ? contract.getVendor().getPublicId() : null)
                .vendorCompanyNameAr(contract.getVendor() != null ? contract.getVendor().getCompanyNameAr() : null)
                .vendorCompanyNameEn(contract.getVendor() != null ? contract.getVendor().getCompanyNameEn() : null)
                .contractType(contract.getContractType())
                .status(contract.getStatus())
                .totalAmount(contract.getTotalAmount())
                .currency(contract.getCurrency())
                .startDate(contract.getStartDate())
                .endDate(contract.getEndDate())
                .autoRenew(contract.isAutoRenew())
                .paymentTerms(contract.getPaymentTerms())
                .signedAt(contract.getSignedAt())
                .signedByUserName(contract.getSignedByUser() != null ? contract.getSignedByUser().getFullName() : null)
                .active(contract.isActive())
                .milestones(milestoneDTOs)
                .createdAt(contract.getCreatedAt())
                .updatedAt(contract.getUpdatedAt())
                .build();
    }

    public MilestoneResponseDTO toMilestoneDTO(ContractMilestone milestone) {
        if (milestone == null) return null;

        return MilestoneResponseDTO.builder()
                .id(milestone.getId())
                .title(milestone.getTitle())
                .amount(milestone.getAmount())
                .dueDate(milestone.getDueDate())
                .status(milestone.getStatus())
                .completedAt(milestone.getCompletedAt())
                .build();
    }

    public Contract toEntity(ContractCreateRequest request, Vendor vendor) {
        if (request == null) return null;

        Contract contract = Contract.builder()
                .contractNumber(request.getContractNumber())
                .title(request.getTitle())
                .description(request.getDescription())
                .vendor(vendor)
                .contractType(request.getContractType())
                .status(ContractStatus.DRAFT)
                .totalAmount(request.getTotalAmount())
                .currency(request.getCurrency() != null ? request.getCurrency() : "SAR")
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .autoRenew(request.isAutoRenew())
                .paymentTerms(request.getPaymentTerms())
                .build();

        if (request.getMilestones() != null) {
            for (var mReq : request.getMilestones()) {
                ContractMilestone milestone = ContractMilestone.builder()
                        .title(mReq.getTitle())
                        .amount(mReq.getAmount())
                        .dueDate(mReq.getDueDate())
                        .status(MilestoneStatus.PENDING)
                        .build();
                contract.addMilestone(milestone);
            }
        }

        return contract;
    }
}
