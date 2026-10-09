package com.vendorhub.vendor;

import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;
import com.vendorhub.config.JpaAuditingConfig;
import com.vendorhub.vendor.entity.Vendor;
import com.vendorhub.vendor.enums.VendorStatus;
import com.vendorhub.vendor.repository.VendorRepository;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DataJpaTest
@Import(JpaAuditingConfig.class)
@ActiveProfiles("test")
class VendorEntityTest {

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    @DisplayName("Should successfully persist a valid Saudi vendor with CR and VAT")
    void shouldPersistValidVendor() {
        Vendor vendor = Vendor.builder()
                .companyNameAr("شركة رواسي التقنية المتقدمة")
                .companyNameEn("Rawasi Advanced Tech Co")
                .crNumber("1010998877")
                .crExpiryDate(LocalDate.now().plusYears(1))
                .taxNumber("300123456789003")
                .nationalAddress("الرياض، طريق الملك فهد، مبنى 402")
                .city("الرياض")
                .contactEmail("contact@rawasi-tech.sa")
                .contactPhone("+966501234567")
                .status(VendorStatus.SUBMITTED)
                .complianceScore(new BigDecimal("95.50"))
                .build();

        Vendor saved = vendorRepository.saveAndFlush(vendor);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getPublicId()).isNotNull();
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
        assertThat(saved.getCreatedBy()).isEqualTo("SYSTEM_AUTOMATION");
        assertThat(saved.getVersion()).isEqualTo(0L);
        assertThat(saved.isCrExpired()).isFalse();
    }

    @Test
    @DisplayName("Should throw validation exception when CR is not 10 digits")
    void shouldFailWhenCrNumberIsInvalid() {
        Vendor vendor = Vendor.builder()
                .companyNameAr("شركة النور")
                .companyNameEn("Al Noor Co")
                .crNumber("12345") // Invalid: only 5 digits
                .crExpiryDate(LocalDate.now().plusYears(1))
                .taxNumber("300123456789003")
                .city("بريدة")
                .contactEmail("info@alnoor.sa")
                .contactPhone("+966551122334")
                .build();

        assertThrows(ConstraintViolationException.class, () -> {
            vendorRepository.saveAndFlush(vendor);
        });
    }

    @Test
    @DisplayName("Should throw validation exception when Saudi VAT number does not start/end with 3 or length != 15")
    void shouldFailWhenTaxNumberIsInvalid() {
        Vendor vendor = Vendor.builder()
                .companyNameAr("شركة الأفق")
                .companyNameEn("Al Ofoq Co")
                .crNumber("1010123456")
                .crExpiryDate(LocalDate.now().plusYears(1))
                .taxNumber("100123456789001") // Invalid: does not start and end with 3
                .city("عنيزة")
                .contactEmail("info@alofoq.sa")
                .contactPhone("+966559988776")
                .build();

        assertThrows(ConstraintViolationException.class, () -> {
            vendorRepository.saveAndFlush(vendor);
        });
    }

    @Test
    @DisplayName("Should enforce uniqueness constraint on CR number")
    void shouldEnforceUniqueCrNumber() {
        Vendor vendor1 = Vendor.builder()
                .companyNameAr("شركة الرواد")
                .companyNameEn("Al Rowad Co")
                .crNumber("1010555555")
                .crExpiryDate(LocalDate.now().plusYears(1))
                .taxNumber("300111111111003")
                .city("الرياض")
                .contactEmail("info@rowada.sa")
                .contactPhone("+966500000001")
                .build();
        vendorRepository.saveAndFlush(vendor1);

        Vendor vendor2 = Vendor.builder()
                .companyNameAr("شركة رائدة أخرى")
                .companyNameEn("Another Rowad Co")
                .crNumber("1010555555") // Duplicate CR
                .crExpiryDate(LocalDate.now().plusYears(1))
                .taxNumber("300222222222003")
                .city("الدمام")
                .contactEmail("info@rowadb.sa")
                .contactPhone("+966500000002")
                .build();

        assertThrows(DataIntegrityViolationException.class, () -> {
            vendorRepository.saveAndFlush(vendor2);
        });
    }

    @Test
    @DisplayName("Should detect expired CR correctly via query")
    void shouldFindVendorsWithExpiredCr() {
        Vendor active = Vendor.builder()
                .companyNameAr("شركة نشطة")
                .companyNameEn("Active Co")
                .crNumber("1010888881")
                .crExpiryDate(LocalDate.now().plusMonths(6))
                .taxNumber("300333333333003")
                .city("الرياض")
                .contactEmail("active@test.sa")
                .contactPhone("+966501111111")
                .status(VendorStatus.APPROVED)
                .build();

        Vendor expired = Vendor.builder()
                .companyNameAr("شركة منتهية السجل")
                .companyNameEn("Expired Co")
                .crNumber("1010888882")
                .crExpiryDate(LocalDate.now().minusDays(10))
                .taxNumber("300444444444003")
                .city("بريدة")
                .contactEmail("expired@test.sa")
                .contactPhone("+966502222222")
                .status(VendorStatus.APPROVED)
                .build();

        vendorRepository.saveAndFlush(active);
        vendorRepository.saveAndFlush(expired);

        var expiredVendors = vendorRepository.findVendorsWithExpiredCr(LocalDate.now(), VendorStatus.APPROVED);
        assertThat(expiredVendors).hasSize(1);
        assertThat(expiredVendors.get(0).getCrNumber()).isEqualTo("1010888882");
    }

    @Test
    @DisplayName("Should increment version on entity update (Optimistic Locking)")
    void shouldIncrementVersionOnUpdate() {
        Vendor vendor = Vendor.builder()
                .companyNameAr("شركة التقنية الحديثة")
                .companyNameEn("Modern Tech Co")
                .crNumber("1010777777")
                .crExpiryDate(LocalDate.now().plusYears(1))
                .taxNumber("300666666666003")
                .city("الرياض")
                .contactEmail("opt@test.sa")
                .contactPhone("+966507777777")
                .build();
        Vendor saved = vendorRepository.saveAndFlush(vendor);
        assertThat(saved.getVersion()).isEqualTo(0L);

        saved.setComplianceScore(new BigDecimal("99.00"));
        Vendor updated = vendorRepository.saveAndFlush(saved);
        assertThat(updated.getVersion()).isEqualTo(1L);
    }
}
