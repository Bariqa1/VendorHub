package com.vendorhub.vendor.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import com.vendorhub.common.entity.AuditableBaseEntity;
import com.vendorhub.contract.entity.Contract;
import com.vendorhub.document.entity.Document;
import com.vendorhub.user.entity.User;
import com.vendorhub.vendor.enums.VendorStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(
    name = "vendors",
    indexes = {
        @Index(name = "idx_vendors_cr_number", columnList = "cr_number", unique = true),
        @Index(name = "idx_vendors_tax_number", columnList = "tax_number", unique = true),
        @Index(name = "idx_vendors_status", columnList = "status"),
        @Index(name = "idx_vendors_public_id", columnList = "public_id", unique = true)
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vendor extends AuditableBaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "public_id", nullable = false, unique = true, updatable = false)
    @Builder.Default
    private UUID publicId = UUID.randomUUID();

    @NotBlank(message = "Arabic company name is required")
    @Size(max = 200)
    @Column(name = "company_name_ar", length = 200, nullable = false)
    private String companyNameAr;

    @NotBlank(message = "English company name is required")
    @Size(max = 200)
    @Column(name = "company_name_en", length = 200, nullable = false)
    private String companyNameEn;

    @NotBlank(message = "Commercial Registration (CR) number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "CR number must be exactly 10 digits")
    @Column(name = "cr_number", length = 10, nullable = false, unique = true)
    private String crNumber;

    @NotNull(message = "CR expiry date is required")
    @Column(name = "cr_expiry_date", nullable = false)
    private LocalDate crExpiryDate;

    @NotBlank(message = "Tax / VAT number is required")
    @Pattern(regexp = "^3[0-9]{13}3$", message = "Saudi VAT number must be 15 digits starting and ending with 3")
    @Column(name = "tax_number", length = 15, nullable = false, unique = true)
    private String taxNumber;

    @Size(max = 255)
    @Column(name = "national_address", length = 255)
    private String nationalAddress;

    @NotBlank(message = "City is required")
    @Size(max = 100)
    @Column(name = "city", length = 100, nullable = false)
    private String city;

    @NotBlank(message = "Contact email is required")
    @Email(message = "Contact email must be valid")
    @Size(max = 100)
    @Column(name = "contact_email", length = 100, nullable = false)
    private String contactEmail;

    @NotBlank(message = "Contact phone is required")
    @Size(max = 20)
    @Column(name = "contact_phone", length = 20, nullable = false)
    private String contactPhone;

    @Size(max = 255)
    @Column(name = "website_url", length = 255)
    private String websiteUrl;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30, nullable = false)
    @Builder.Default
    private VendorStatus status = VendorStatus.DRAFT;

    @DecimalMin("0.00")
    @DecimalMax("100.00")
    @Column(name = "compliance_score", precision = 5, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal complianceScore = BigDecimal.ZERO;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @OneToMany(mappedBy = "vendor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Contract> contracts = new ArrayList<>();

    @OneToMany(mappedBy = "vendor", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Document> documents = new ArrayList<>();

    @PrePersist
    public void ensurePublicId() {
        if (this.publicId == null) {
            this.publicId = UUID.randomUUID();
        }
        if (this.complianceScore == null) {
            this.complianceScore = BigDecimal.ZERO;
        }
    }

    public void addContract(Contract contract) {
        contracts.add(contract);
        contract.setVendor(this);
    }

    public void addDocument(Document document) {
        documents.add(document);
        document.setVendor(this);
    }

    public boolean isCrExpired() {
        return crExpiryDate != null && crExpiryDate.isBefore(LocalDate.now());
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Vendor vendor = (Vendor) o;
        return Objects.equals(crNumber, vendor.crNumber);
    }

    @Override
    public int hashCode() {
        return Objects.hash(crNumber);
    }
}
