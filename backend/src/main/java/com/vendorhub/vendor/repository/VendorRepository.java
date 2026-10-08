package com.vendorhub.vendor.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.vendorhub.vendor.entity.Vendor;
import com.vendorhub.vendor.enums.VendorStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {

    Optional<Vendor> findByPublicId(UUID publicId);

    Optional<Vendor> findByCrNumber(String crNumber);

    Optional<Vendor> findByTaxNumber(String taxNumber);

    boolean existsByCrNumber(String crNumber);

    boolean existsByTaxNumber(String taxNumber);

    Page<Vendor> findByStatus(VendorStatus status, Pageable pageable);

    @Query("SELECT v FROM Vendor v WHERE " +
           "(:status IS NULL OR v.status = :status) AND " +
           "(:search IS NULL OR LOWER(v.companyNameAr) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(v.companyNameEn) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR v.crNumber LIKE CONCAT('%', :search, '%') " +
           "OR v.taxNumber LIKE CONCAT('%', :search, '%'))")
    Page<Vendor> searchVendors(
            @Param("status") VendorStatus status,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT v FROM Vendor v WHERE v.crExpiryDate < :currentDate AND v.status = :status")
    List<Vendor> findVendorsWithExpiredCr(
            @Param("currentDate") LocalDate currentDate,
            @Param("status") VendorStatus status
    );

    @Query("SELECT COUNT(v) FROM Vendor v WHERE v.status = :status")
    long countByStatus(@Param("status") VendorStatus status);
}
