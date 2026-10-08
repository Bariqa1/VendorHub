package com.vendorhub.contract.service;

import com.vendorhub.audit.entity.AuditLog;
import com.vendorhub.audit.repository.AuditLogRepository;
import com.vendorhub.common.dto.PageResponse;
import com.vendorhub.common.exception.BusinessRuleException;
import com.vendorhub.common.exception.DuplicateResourceException;
import com.vendorhub.common.exception.ResourceNotFoundException;
import com.vendorhub.contract.dto.ContractCreateRequest;
import com.vendorhub.contract.dto.ContractResponseDTO;
import com.vendorhub.contract.dto.ContractStatusUpdateRequest;
import com.vendorhub.contract.entity.Contract;
import com.vendorhub.contract.enums.ContractStatus;
import com.vendorhub.contract.mapper.ContractMapper;
import com.vendorhub.contract.repository.ContractRepository;
import com.vendorhub.vendor.entity.Vendor;
import com.vendorhub.vendor.enums.VendorStatus;
import com.vendorhub.vendor.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContractService {

    private final ContractRepository contractRepository;
    private final VendorRepository vendorRepository;
    private final ContractMapper contractMapper;
    private final AuditLogRepository auditLogRepository;

    @Transactional
    public ContractResponseDTO createContract(ContractCreateRequest request) {
        Vendor vendor = vendorRepository.findByPublicId(request.getVendorPublicId())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", "publicId", request.getVendorPublicId()));

        if (vendor.getStatus() != VendorStatus.APPROVED) {
            throw new BusinessRuleException(
                    "Contracts can only be created for APPROVED vendors. Current vendor status is: " + vendor.getStatus()
            );
        }

        if (contractRepository.existsByContractNumber(request.getContractNumber())) {
            throw new DuplicateResourceException(
                    "Contract already exists with number: " + request.getContractNumber()
            );
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BusinessRuleException("Contract end date cannot be earlier than start date");
        }

        Contract contract = contractMapper.toEntity(request, vendor);
        Contract savedContract = contractRepository.save(contract);

        recordAuditLog("Contract", savedContract.getId(), "CREATE",
                "Drafted contract #" + savedContract.getContractNumber() + " with amount " + savedContract.getTotalAmount());

        log.info("Contract created successfully: {}", savedContract.getContractNumber());
        return contractMapper.toResponseDTO(savedContract);
    }

    @Transactional(readOnly = true)
    public ContractResponseDTO getContractByPublicId(UUID publicId) {
        Contract contract = contractRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract", "publicId", publicId));
        return contractMapper.toResponseDTO(contract);
    }

    @Transactional(readOnly = true)
    public PageResponse<ContractResponseDTO> getContracts(
            ContractStatus status, UUID vendorPublicId, String search, Pageable pageable) {
        Page<Contract> contractPage = contractRepository.searchContracts(status, vendorPublicId, search, pageable);
        return PageResponse.from(contractPage.map(contractMapper::toResponseDTO));
    }

    @Transactional
    public ContractResponseDTO updateContractStatus(UUID publicId, ContractStatusUpdateRequest request) {
        Contract contract = contractRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract", "publicId", publicId));

        ContractStatus oldStatus = contract.getStatus();
        contract.setStatus(request.getStatus());

        if (request.getStatus() == ContractStatus.ACTIVE && contract.getSignedAt() == null) {
            contract.setSignedAt(Instant.now());
        }

        Contract savedContract = contractRepository.save(contract);

        String details = String.format("Contract status changed from %s to %s. Remarks: %s",
                oldStatus, request.getStatus(), request.getRemarks() != null ? request.getRemarks() : "None");
        recordAuditLog("Contract", savedContract.getId(), "STATUS_CHANGE", details);

        log.info("Contract {} status updated to {}", contract.getContractNumber(), request.getStatus());
        return contractMapper.toResponseDTO(savedContract);
    }

    private void recordAuditLog(String entityName, Long entityId, String action, String details) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String actor = (auth != null && auth.isAuthenticated()) ? auth.getName() : "SYSTEM";

        AuditLog logEntry = AuditLog.builder()
                .entityName(entityName)
                .entityId(entityId)
                .action(action)
                .performedBy(actor)
                .details(details)
                .build();
        auditLogRepository.save(logEntry);
    }
}
