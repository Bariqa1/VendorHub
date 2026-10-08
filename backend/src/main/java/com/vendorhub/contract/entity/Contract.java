package com.vendorhub.contract.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import com.vendorhub.common.entity.AuditableBaseEntity;
import com.vendorhub.contract.enums.ContractStatus;
import com.vendorhub.contract.enums.ContractType;
import com.vendorhub.document.entity.Document;
import com.vendorhub.user.entity.User;
import com.vendorhub.vendor.entity.Vendor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(
    name = "contracts",
    indexes = {
        @Index(name = "idx_contracts_number", columnList = "contract_number", unique = true),
        @Index(name = "idx_contracts_vendor_id", columnList = "vendor_id"),
        @Index(name = "idx_contracts_status", columnList = "status"),
        @Index(name = "idx_contracts_dates", columnList = "start_date, end_date"),
        @Index(name = "idx_contracts_public_id", columnList = "public_id", unique = true)
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contract extends AuditableBaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "public_id", nullable = false, unique = true, updatable = false)
    @Builder.Default
    private UUID publicId = UUID.randomUUID();

    @NotBlank(message = "Contract number is required")
    @Size(max = 50)
    @Column(name = "contract_number", length = 50, nullable = false, unique = true)
    private String contractNumber;

    @NotBlank(message = "Contract title is required")
    @Size(max = 255)
    @Column(name = "title", length = 255, nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @NotNull(message = "Contract type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "contract_type", length = 40, nullable = false)
    private ContractType contractType;

    @NotNull(message = "Contract status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30, nullable = false)
    @Builder.Default
    private ContractStatus status = ContractStatus.DRAFT;

    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "0.00", message = "Total amount must be non-negative")
    @Column(name = "total_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @NotBlank(message = "Currency is required")
    @Size(min = 3, max = 3)
    @Column(name = "currency", length = 3, nullable = false)
    @Builder.Default
    private String currency = "SAR";

    @NotNull(message = "Start date is required")
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "auto_renew", nullable = false)
    @Builder.Default
    private boolean autoRenew = false;

    @Size(max = 255)
    @Column(name = "payment_terms", length = 255)
    private String paymentTerms;

    @Column(name = "signed_at")
    private Instant signedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "signed_by_user_id")
    private User signedByUser;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ContractMilestone> milestones = new ArrayList<>();

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Document> documents = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.publicId == null) {
            this.publicId = UUID.randomUUID();
        }
        if (this.currency == null || this.currency.isBlank()) {
            this.currency = "SAR";
        }
        validateDates();
    }

    @PreUpdate
    public void preUpdate() {
        validateDates();
    }

    public void validateDates() {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new IllegalStateException("Contract end date cannot be earlier than start date");
        }
    }

    public void addMilestone(ContractMilestone milestone) {
        milestones.add(milestone);
        milestone.setContract(this);
    }

    public void removeMilestone(ContractMilestone milestone) {
        milestones.remove(milestone);
        milestone.setContract(null);
    }

    public void addDocument(Document document) {
        documents.add(document);
        document.setContract(this);
    }

    public boolean isActive() {
        return this.status == ContractStatus.ACTIVE &&
                !LocalDate.now().isBefore(startDate) &&
                !LocalDate.now().isAfter(endDate);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Contract contract = (Contract) o;
        return Objects.equals(contractNumber, contract.contractNumber);
    }

    @Override
    public int hashCode() {
        return Objects.hash(contractNumber);
    }
}
