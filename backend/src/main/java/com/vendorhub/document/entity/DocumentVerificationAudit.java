package com.vendorhub.document.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import com.vendorhub.document.enums.AuditDecision;
import com.vendorhub.document.enums.VerificationMethod;
import com.vendorhub.user.entity.User;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

@Entity
@Table(
    name = "document_verification_audits",
    indexes = {
        @Index(name = "idx_doc_audits_doc_id", columnList = "document_id"),
        @Index(name = "idx_doc_audits_decision", columnList = "decision"),
        @Index(name = "idx_doc_audits_verified_at", columnList = "verified_at")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentVerificationAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @NotNull(message = "Verification method is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "verification_method", length = 30, nullable = false)
    private VerificationMethod verificationMethod;

    @DecimalMin("0.00")
    @DecimalMax("100.00")
    @Column(name = "confidence_score", precision = 5, scale = 2)
    private BigDecimal confidenceScore;

    @Column(name = "extracted_data_json", columnDefinition = "TEXT")
    private String extractedDataJson;

    @Column(name = "mismatch_flags", columnDefinition = "TEXT")
    private String mismatchFlags;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auditor_user_id")
    private User auditorUser;

    @NotNull(message = "Audit decision is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "decision", length = 30, nullable = false)
    private AuditDecision decision;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @NotNull
    @Column(name = "verified_at", nullable = false)
    @Builder.Default
    private Instant verifiedAt = Instant.now();

    @PrePersist
    public void ensureTimestamp() {
        if (this.verifiedAt == null) {
            this.verifiedAt = Instant.now();
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DocumentVerificationAudit that = (DocumentVerificationAudit) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
