package com.vendorhub.document.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;
import com.vendorhub.common.entity.AuditableBaseEntity;
import com.vendorhub.contract.entity.Contract;
import com.vendorhub.document.enums.DocumentStatus;
import com.vendorhub.document.enums.DocumentType;
import com.vendorhub.vendor.entity.Vendor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(
    name = "documents",
    indexes = {
        @Index(name = "idx_documents_vendor_id", columnList = "vendor_id"),
        @Index(name = "idx_documents_contract_id", columnList = "contract_id"),
        @Index(name = "idx_documents_status", columnList = "status"),
        @Index(name = "idx_documents_type", columnList = "document_type"),
        @Index(name = "idx_documents_public_id", columnList = "public_id", unique = true)
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document extends AuditableBaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "public_id", nullable = false, unique = true, updatable = false)
    @Builder.Default
    private UUID publicId = UUID.randomUUID();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id")
    private Contract contract;

    @NotNull(message = "Document type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", length = 50, nullable = false)
    private DocumentType documentType;

    @NotBlank(message = "File name is required")
    @Size(max = 255)
    @Column(name = "file_name", length = 255, nullable = false)
    private String fileName;

    @NotBlank(message = "File path is required")
    @Size(max = 500)
    @Column(name = "file_path", length = 500, nullable = false)
    private String filePath;

    @NotNull(message = "File size is required")
    @Positive
    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @NotBlank(message = "Content type is required")
    @Size(max = 100)
    @Column(name = "content_type", length = 100, nullable = false)
    private String contentType;

    @NotBlank(message = "SHA-256 Checksum is required for integrity")
    @Size(min = 64, max = 64)
    @Column(name = "checksum_sha256", length = 64, nullable = false)
    private String checksumSha256;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30, nullable = false)
    @Builder.Default
    private DocumentStatus status = DocumentStatus.UPLOADED;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<DocumentVerificationAudit> verificationAudits = new ArrayList<>();

    @PrePersist
    public void ensureIntegrity() {
        if (this.publicId == null) {
            this.publicId = UUID.randomUUID();
        }
        if (vendor == null && contract == null) {
            throw new IllegalStateException("Document must be associated with either a vendor or a contract");
        }
    }

    public void addVerificationAudit(DocumentVerificationAudit audit) {
        verificationAudits.add(audit);
        audit.setDocument(this);
    }

    public boolean isExpired() {
        return expiryDate != null && expiryDate.isBefore(LocalDate.now());
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Document document = (Document) o;
        return Objects.equals(publicId, document.publicId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(publicId);
    }
}
