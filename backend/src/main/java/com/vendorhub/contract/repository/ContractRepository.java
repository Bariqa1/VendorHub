package com.vendorhub.contract.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.vendorhub.contract.entity.Contract;
import com.vendorhub.contract.enums.ContractStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"vendor", "milestones"})
    Optional<Contract> findByPublicId(UUID publicId);

    Optional<Contract> findByContractNumber(String contractNumber);

    boolean existsByContractNumber(String contractNumber);

    Page<Contract> findByVendorId(Long vendorId, Pageable pageable);

    Page<Contract> findByStatus(ContractStatus status, Pageable pageable);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"vendor"})
    @Query("SELECT c FROM Contract c WHERE " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:vendorPublicId IS NULL OR c.vendor.publicId = :vendorPublicId) AND " +
           "(:search IS NULL OR LOWER(c.contractNumber) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Contract> searchContracts(
            @Param("status") ContractStatus status,
            @Param("vendorPublicId") UUID vendorPublicId,
            @Param("search") String search,
            Pageable pageable
    );

    long countByStatus(ContractStatus status);

    @Query("SELECT COUNT(c) FROM Contract c WHERE c.status = 'ACTIVE' AND c.endDate BETWEEN :now AND :upcomingDate")
    long countExpiringSoon(@Param("now") java.time.LocalDate now, @Param("upcomingDate") java.time.LocalDate upcomingDate);

    @Query("SELECT COALESCE(SUM(c.totalAmount), 0) FROM Contract c WHERE c.status = :status")
    BigDecimal sumTotalAmountByStatus(@Param("status") ContractStatus status);

    @Query("SELECT COALESCE(SUM(c.totalAmount), 0) FROM Contract c WHERE c.vendor.id = :vendorId AND c.status = :status")
    BigDecimal sumTotalAmountByVendorAndStatus(
            @Param("vendorId") Long vendorId,
            @Param("status") ContractStatus status
    );

    @Query("SELECT c FROM Contract c WHERE c.vendor.id = :vendorId ORDER BY c.startDate DESC")
    List<Contract> findTopContractsByVendor(@Param("vendorId") Long vendorId);
}
