package com.vendorhub.config;

import com.vendorhub.contract.entity.Contract;
import com.vendorhub.contract.entity.ContractMilestone;
import com.vendorhub.contract.enums.ContractStatus;
import com.vendorhub.contract.enums.ContractType;
import com.vendorhub.contract.enums.MilestoneStatus;
import com.vendorhub.contract.repository.ContractRepository;
import com.vendorhub.user.entity.Role;
import com.vendorhub.user.entity.User;
import com.vendorhub.user.enums.RoleType;
import com.vendorhub.user.repository.RoleRepository;
import com.vendorhub.user.repository.UserRepository;
import com.vendorhub.vendor.entity.Vendor;
import com.vendorhub.vendor.enums.VendorStatus;
import com.vendorhub.vendor.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final VendorRepository vendorRepository;
    private final ContractRepository contractRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded with administrative users, skipping seed data.");
            return;
        }

        log.info("Seeding rich enterprise dataset (Roles, Users, Vendors, Contracts, Milestones)...");

        // 1. Roles
        Role adminRole = roleRepository.save(Role.builder()
                .name(RoleType.ROLE_ADMIN)
                .description("Administrator with full executive and approval privileges")
                .build());

        Role procurementRole = roleRepository.save(Role.builder()
                .name(RoleType.ROLE_PROCUREMENT_OFFICER)
                .description("Procurement officer managing vendors and contracts")
                .build());

        Role managerRole = roleRepository.save(Role.builder()
                .name(RoleType.ROLE_COMPLIANCE_OFFICER)
                .description("Compliance manager with contract approval authority")
                .build());

        // 2. Users (Admin & Procurement)
        User adminUser = User.builder()
                .username("admin")
                .email("admin@vendorhub.sa")
                .passwordHash(passwordEncoder.encode("Admin@2026"))
                .fullName("سارة بنت خالد المطيري")
                .phoneNumber("+966501112233")
                .roles(Set.of(adminRole, managerRole))
                .build();
        userRepository.save(adminUser);

        User procurementUser = User.builder()
                .username("procurement")
                .email("procurement@vendorhub.sa")
                .passwordHash(passwordEncoder.encode("Procure@2026"))
                .fullName("عبدالله بن محمد العتيبي")
                .phoneNumber("+966502223344")
                .roles(Set.of(procurementRole))
                .build();
        userRepository.save(procurementUser);

        // 3. Realistic Saudi Vendors
        Vendor vendor1 = vendorRepository.save(Vendor.builder()
                .companyNameAr("شركة الحلول السحابية الرقمية المتقدمة")
                .companyNameEn("Advanced Digital Cloud Solutions Co.")
                .crNumber("1010123456")
                .crExpiryDate(LocalDate.now().plusYears(2))
                .taxNumber("300123456789003")
                .nationalAddress("الرياض، حي السليمانية، طريق مكة المكرمة")
                .city("الرياض")
                .contactEmail("contact@cloudsolutions.sa")
                .contactPhone("+966551122334")
                .websiteUrl("https://cloudsolutions.sa")
                .status(VendorStatus.APPROVED)
                .complianceScore(new BigDecimal("98.50"))
                .build());

        Vendor vendor2 = vendorRepository.save(Vendor.builder()
                .companyNameAr("شركة سلاسل التوريد والخدمات اللوجستية الوطنية")
                .companyNameEn("National Supply Chain & Logistics Co.")
                .crNumber("1010654321")
                .crExpiryDate(LocalDate.now().plusMonths(8))
                .taxNumber("300987654321003")
                .nationalAddress("الدمام، المدينة الصناعية الأولى، شارع الملك فهد")
                .city("الدمام")
                .contactEmail("procurement@nationallogistics.sa")
                .contactPhone("+966552233445")
                .websiteUrl("https://nationallogistics.sa")
                .status(VendorStatus.APPROVED)
                .complianceScore(new BigDecimal("94.00"))
                .build());

        Vendor vendor3 = vendorRepository.save(Vendor.builder()
                .companyNameAr("مؤسسة القصيم للحلول التقنية والأنظمة الذكية")
                .companyNameEn("Al Qasim Smart Systems & Tech Est.")
                .crNumber("1010987654")
                .crExpiryDate(LocalDate.now().plusYears(1))
                .taxNumber("300554433221003")
                .nationalAddress("بريدة، حي الصفراء، طريق الملك عبدالعزيز")
                .city("بريدة")
                .contactEmail("info@alqasim-tech.sa")
                .contactPhone("+966553344556")
                .websiteUrl("https://alqasim-tech.sa")
                .status(VendorStatus.APPROVED)
                .complianceScore(new BigDecimal("88.00"))
                .build());

        Vendor vendor4 = vendorRepository.save(Vendor.builder()
                .companyNameAr("شركة التميز للأمن السيبراني والبنية التحتية")
                .companyNameEn("Excellence Cyber Security & Infrastructure")
                .crNumber("1010887766")
                .crExpiryDate(LocalDate.now().plusMonths(18))
                .taxNumber("300776655443003")
                .nationalAddress("جدة، حي الشاطئ، طريق الكورنيش")
                .city("جدة")
                .contactEmail("support@excellence-sec.sa")
                .contactPhone("+966554455667")
                .status(VendorStatus.UNDER_REVIEW)
                .complianceScore(new BigDecimal("78.50"))
                .build());

        Vendor vendor5 = vendorRepository.save(Vendor.builder()
                .companyNameAr("مجموعة التطوير والاستشارات الإدارية")
                .companyNameEn("Management Development & Consulting Group")
                .crNumber("1010332211")
                .crExpiryDate(LocalDate.now().minusDays(15)) // Expired CR for compliance demonstration
                .taxNumber("300223344556003")
                .nationalAddress("الرياض، حي العليا، برج الفيصلية")
                .city("الرياض")
                .contactEmail("legal@consulting-group.sa")
                .contactPhone("+966555566778")
                .status(VendorStatus.DRAFT)
                .complianceScore(new BigDecimal("55.00"))
                .build());

        Vendor vendor6 = vendorRepository.save(Vendor.builder()
                .companyNameAr("شركة المسار السريع للصيانة والتشغيل")
                .companyNameEn("Fast Track Operations & Maintenance Co.")
                .crNumber("1010445566")
                .crExpiryDate(LocalDate.now().plusMonths(3))
                .taxNumber("300445566778003")
                .nationalAddress("الخبر، حي الحزام الذهبي")
                .city("الخبر")
                .contactEmail("ops@fasttrack.sa")
                .contactPhone("+966556677889")
                .status(VendorStatus.APPROVED)
                .complianceScore(new BigDecimal("91.20"))
                .build());

        // 4. Realistic Enterprise Contracts & Deliverable Milestones
        // Contract 1: IT Cloud & Infrastructure (Active)
        Contract c1 = Contract.builder()
                .contractNumber("VHB-2026-0001")
                .title("عقد توريد وتشغيل المنظومة السحابية والمخدمات الآمنة")
                .description("توريد وإدارة منصة الحوسبة السحابية المؤسسية وتقديم الدعم الهندسي على مدار الساعة.")
                .vendor(vendor1)
                .contractType(ContractType.IT_INFRASTRUCTURE)
                .status(ContractStatus.ACTIVE)
                .totalAmount(new BigDecimal("1450000.00"))
                .currency("SAR")
                .startDate(LocalDate.now().minusMonths(2))
                .endDate(LocalDate.now().plusMonths(10))
                .autoRenew(true)
                .paymentTerms("الدفع خلال 30 يوم من تاريخ استلام واعتماد الفاتورة الضريبية.")
                .build();

        c1.addMilestone(ContractMilestone.builder()
                .title("المرحلة الأولى: تسليم التراخيص وتهيئة البنية التحتية السحابية")
                .amount(new BigDecimal("550000.00"))
                .dueDate(LocalDate.now().minusMonths(1))
                .status(MilestoneStatus.PAID)
                .completedAt(java.time.Instant.now().minus(30, java.time.temporal.ChronoUnit.DAYS))
                .build());

        c1.addMilestone(ContractMilestone.builder()
                .title("المرحلة الثانية: ترحيل قواعد البيانات واختبارات الجاهزية الأمنية")
                .amount(new BigDecimal("450000.00"))
                .dueDate(LocalDate.now().plusMonths(2))
                .status(MilestoneStatus.IN_PROGRESS)
                .build());

        c1.addMilestone(ContractMilestone.builder()
                .title("المرحلة الثالثة: الدعم الفني المستمر ونقل المعرفة المؤسسية")
                .amount(new BigDecimal("450000.00"))
                .dueDate(LocalDate.now().plusMonths(10))
                .status(MilestoneStatus.PENDING)
                .build());
        contractRepository.save(c1);

        // Contract 2: Logistics & Transportation (Active)
        Contract c2 = Contract.builder()
                .contractNumber("VHB-2026-0002")
                .title("اتفاقية الخدمات اللوجستية والنقل المبرد بين الفروع")
                .description("تقديم خدمات النقل والتوزيع اللوجستي المعتمد لجميع مراكز العمليات في المملكة.")
                .vendor(vendor2)
                .contractType(ContractType.SUPPLY)
                .status(ContractStatus.ACTIVE)
                .totalAmount(new BigDecimal("780000.00"))
                .currency("SAR")
                .startDate(LocalDate.now().minusMonths(1))
                .endDate(LocalDate.now().plusMonths(5))
                .autoRenew(false)
                .paymentTerms("دفعات ربع سنوية مرتبطة بتقارير مؤشرات الأداء (KPIs).")
                .build();

        c2.addMilestone(ContractMilestone.builder()
                .title("الدفعة التشغيلية الأولى: تدشين أسطول النقل والمستودعات")
                .amount(new BigDecimal("390000.00"))
                .dueDate(LocalDate.now().plusMonths(1))
                .status(MilestoneStatus.APPROVED)
                .build());

        c2.addMilestone(ContractMilestone.builder()
                .title("الدفعة التشغيلية الثانية: التقرير النهائي وإغلاق الدورة اللوجستية")
                .amount(new BigDecimal("390000.00"))
                .dueDate(LocalDate.now().plusMonths(5))
                .status(MilestoneStatus.PENDING)
                .build());
        contractRepository.save(c2);

        // Contract 3: Smart Systems (Pending Approval)
        Contract c3 = Contract.builder()
                .contractNumber("VHB-2026-0003")
                .title("مشروع أتمتة الأنظمة وإدارة المستودعات الذكية")
                .description("تطوير وتفعيل نظام التتبع الآلي للمخزون وربطه مع بوابات التوريد الحكومية.")
                .vendor(vendor3)
                .contractType(ContractType.SERVICES)
                .status(ContractStatus.PENDING_APPROVAL)
                .totalAmount(new BigDecimal("520000.00"))
                .currency("SAR")
                .startDate(LocalDate.now().plusDays(10))
                .endDate(LocalDate.now().plusMonths(8))
                .autoRenew(false)
                .paymentTerms("دفعة مقدمة 20% عند التوقيع و 80% عند الاعتماد النهائي.")
                .build();

        c3.addMilestone(ContractMilestone.builder()
                .title("الدفعة المقدمة: اعتماد وثيقة المتطلبات الفنية (SRS)")
                .amount(new BigDecimal("104000.00"))
                .dueDate(LocalDate.now().plusDays(30))
                .status(MilestoneStatus.PENDING)
                .build());

        c3.addMilestone(ContractMilestone.builder()
                .title("الدفعة الختامية: الاختبارات الشاملة (UAT) وتدريب الكوادر")
                .amount(new BigDecimal("416000.00"))
                .dueDate(LocalDate.now().plusMonths(8))
                .status(MilestoneStatus.PENDING)
                .build());
        contractRepository.save(c3);

        // Contract 4: Operations & Maintenance (Active, Expiring Soon for Dashboard alert)
        Contract c4 = Contract.builder()
                .contractNumber("VHB-2026-0004")
                .title("عقد الصيانة الوقائية والتشغيل لمرافق المقر الرئيسي")
                .description("خدمات الصيانة الدورية للأجهزة الكهروميكانيكية وأنظمة التكييف والإنذار.")
                .vendor(vendor6)
                .contractType(ContractType.MAINTENANCE)
                .status(ContractStatus.ACTIVE)
                .totalAmount(new BigDecimal("360000.00"))
                .currency("SAR")
                .startDate(LocalDate.now().minusMonths(11))
                .endDate(LocalDate.now().plusDays(20)) // Expiring within 30 days!
                .autoRenew(true)
                .paymentTerms("شهريًا بناءً على شهادات الإنجاز الفني.")
                .build();

        c4.addMilestone(ContractMilestone.builder()
                .title("المرحلة الختامية: الفحص السنوي الشامل وتجديد شهادات السلامة")
                .amount(new BigDecimal("90000.00"))
                .dueDate(LocalDate.now().plusDays(15))
                .status(MilestoneStatus.IN_PROGRESS)
                .build());
        contractRepository.save(c4);

        log.info("Rich enterprise seed data successfully loaded into VendorHub!");
    }
}
