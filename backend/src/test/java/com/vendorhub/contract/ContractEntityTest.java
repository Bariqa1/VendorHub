package com.vendorhub.contract;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import com.vendorhub.config.JpaAuditingConfig;
import com.vendorhub.contract.entity.Contract;
import com.vendorhub.contract.entity.ContractMilestone;
import com.vendorhub.contract.enums.ContractStatus;
import com.vendorhub.contract.enums.ContractType;
import com.vendorhub.contract.enums.MilestoneStatus;
import com.vendorhub.contract.repository.ContractMilestoneRepository;
import com.vendorhub.contract.repository.ContractRepository;
import com.vendorhub.vendor.entity.Vendor;
import com.vendorhub.vendor.enums.VendorStatus;
import com.vendorhub.vendor.repository.VendorRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DataJpaTest
@Import(JpaAuditingConfig.class)
@ActiveProfiles("test")
class ContractEntityTest {

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private ContractMilestoneRepository milestoneRepository;

    @Autowired
    private VendorRepository vendorRepository;

    private Vendor createTestVendor() {
        return vendorRepository.saveAndFlush(Vendor.builder()
                .companyNameAr("شركة التوريدات الوطنية")
                .companyNameEn("National Supply Co")
                .crNumber("1010123987")
                .crExpiryDate(LocalDate.now().plusYears(2))
                .taxNumber("300765432100003")
                .city("الرياض")
                .contactEmail("procurement@national-supply.sa")
                .contactPhone("+966509876543")
                .status(VendorStatus.APPROVED)
                .build());
    }

    @Test
    @DisplayName("Should persist contract with milestones and calculate total sum")
    void shouldPersistContractWithMilestones() {
        Vendor vendor = createTestVendor();

        Contract contract = Contract.builder()
                .contractNumber("EMD-2026-0001")
                .title("عقد توريد خوادم ومعدات مركز البيانات")
                .description("توريد وتركيب أجهزة وخوادم لمشروع الحوسبة السحابية")
                .vendor(vendor)
                .contractType(ContractType.SUPPLY)
                .status(ContractStatus.ACTIVE)
                .totalAmount(new BigDecimal("1500000.00"))
                .currency("SAR")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusYears(1))
                .paymentTerms("الدفع بعد 30 يوماً من استلام كل مرحلة")
                .build();

        ContractMilestone milestone1 = ContractMilestone.builder()
                .title("المرحلة الأولى: توريد الخوادم")
                .amount(new BigDecimal("750000.00"))
                .dueDate(LocalDate.now().plusMonths(3))
                .status(MilestoneStatus.IN_PROGRESS)
                .build();

        ContractMilestone milestone2 = ContractMilestone.builder()
                .title("المرحلة الثانية: التركيب والتشغيل النهائي")
                .amount(new BigDecimal("750000.00"))
                .dueDate(LocalDate.now().plusMonths(6))
                .status(MilestoneStatus.PENDING)
                .build();

        contract.addMilestone(milestone1);
        contract.addMilestone(milestone2);

        Contract saved = contractRepository.saveAndFlush(contract);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getPublicId()).isNotNull();
        assertThat(saved.getMilestones()).hasSize(2);
        assertThat(saved.isActive()).isTrue();

        List<ContractMilestone> persistedMilestones = milestoneRepository.findByContractId(saved.getId());
        assertThat(persistedMilestones).hasSize(2);

        BigDecimal totalActiveSum = contractRepository.sumTotalAmountByVendorAndStatus(vendor.getId(), ContractStatus.ACTIVE);
        assertThat(totalActiveSum).isEqualByComparingTo(new BigDecimal("1500000.00"));
    }

    @Test
    @DisplayName("Should prevent contract where endDate is before startDate")
    void shouldPreventInvalidContractDates() {
        Vendor vendor = createTestVendor();

        Contract contract = Contract.builder()
                .contractNumber("EMD-2026-0002")
                .title("عقد استشارات تقنية")
                .vendor(vendor)
                .contractType(ContractType.CONSULTING)
                .status(ContractStatus.DRAFT)
                .totalAmount(new BigDecimal("50000.00"))
                .startDate(LocalDate.now().plusMonths(2))
                .endDate(LocalDate.now()) // Invalid: end is before start
                .build();

        org.assertj.core.api.Assertions.assertThatThrownBy(() -> {
            contractRepository.saveAndFlush(contract);
        }).hasRootCauseInstanceOf(IllegalStateException.class)
          .hasRootCauseMessage("Contract end date cannot be earlier than start date");
    }
}
