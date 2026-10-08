package com.vendorhub.document;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import com.vendorhub.audit.entity.AuditLog;
import com.vendorhub.audit.repository.AuditLogRepository;
import com.vendorhub.config.JpaAuditingConfig;
import com.vendorhub.document.entity.Document;
import com.vendorhub.document.entity.DocumentVerificationAudit;
import com.vendorhub.document.enums.AuditDecision;
import com.vendorhub.document.enums.DocumentStatus;
import com.vendorhub.document.enums.DocumentType;
import com.vendorhub.document.enums.VerificationMethod;
import com.vendorhub.document.repository.DocumentRepository;
import com.vendorhub.document.repository.DocumentVerificationAuditRepository;
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
class DocumentAndAuditTest {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private DocumentVerificationAuditRepository auditRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    private Vendor createTestVendor() {
        return vendorRepository.saveAndFlush(Vendor.builder()
                .companyNameAr("شركة الأنظمة المتطورة")
                .companyNameEn("Advanced Systems Co")
                .crNumber("1010334455")
                .crExpiryDate(LocalDate.now().plusYears(1))
                .taxNumber("300554433221003")
                .city("الرياض")
                .contactEmail("legal@advsys.sa")
                .contactPhone("+966503344556")
                .status(VendorStatus.UNDER_REVIEW)
                .build());
    }

    @Test
    @DisplayName("Should persist Document and AI verification audit result successfully")
    void shouldPersistDocumentAndAiAudit() {
        Vendor vendor = createTestVendor();

        // 1. Upload document (Commercial Registration)
        Document document = Document.builder()
                .vendor(vendor)
                .documentType(DocumentType.COMMERCIAL_REGISTRATION)
                .fileName("cr_1010334455.pdf")
                .filePath("/storage/documents/vendors/1010334455/cr.pdf")
                .fileSize(1048576L) // 1 MB
                .contentType("application/pdf")
                .checksumSha256("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
                .status(DocumentStatus.AI_ANALYZING)
                .expiryDate(LocalDate.now().plusYears(1))
                .build();

        // 2. Attach AI Verification Audit
        DocumentVerificationAudit aiAudit = DocumentVerificationAudit.builder()
                .verificationMethod(VerificationMethod.AI_AUTOMATED)
                .confidenceScore(new BigDecimal("98.75"))
                .extractedDataJson("{\"cr_number\":\"1010334455\",\"company_name\":\"شركة الأنظمة المتطورة\",\"status\":\"ACTIVE\"}")
                .decision(AuditDecision.PASSED)
                .remarks("تم استخراج بيانات السجل ومطابقتها آلياً بنسبة ثقة 98.75%")
                .build();

        document.addVerificationAudit(aiAudit);
        document.setStatus(DocumentStatus.AI_VERIFIED);

        Document savedDoc = documentRepository.saveAndFlush(document);

        assertThat(savedDoc.getId()).isNotNull();
        assertThat(savedDoc.getPublicId()).isNotNull();
        assertThat(savedDoc.getStatus()).isEqualTo(DocumentStatus.AI_VERIFIED);
        assertThat(savedDoc.getVerificationAudits()).hasSize(1);

        // 3. Verify audit query
        List<DocumentVerificationAudit> audits = auditRepository.findByDocumentId(savedDoc.getId());
        assertThat(audits).hasSize(1);
        assertThat(audits.get(0).getConfidenceScore()).isEqualByComparingTo(new BigDecimal("98.75"));
        assertThat(audits.get(0).getDecision()).isEqualTo(AuditDecision.PASSED);

        // 4. Record system Audit Log (Enterprise Audit Trail)
        AuditLog auditLog = AuditLog.builder()
                .entityName("Document")
                .entityId(savedDoc.getId())
                .action("AI_VERIFIED")
                .performedBy("AI_AGENT_EXTRACTOR")
                .ipAddress("10.0.0.15")
                .details("Automated OCR and validation passed with 98.75% score")
                .build();

        AuditLog savedLog = auditLogRepository.saveAndFlush(auditLog);
        assertThat(savedLog.getId()).isNotNull();

        List<AuditLog> logHistory = auditLogRepository.findByEntityNameAndEntityIdOrderByTimestampDesc("Document", savedDoc.getId());
        assertThat(logHistory).hasSize(1);
        assertThat(logHistory.get(0).getAction()).isEqualTo("AI_VERIFIED");
    }

    @Test
    @DisplayName("Should reject Document if not associated with either vendor or contract")
    void shouldRejectOrphanDocument() {
        Document orphanDoc = Document.builder()
                .documentType(DocumentType.OTHER)
                .fileName("orphan.pdf")
                .filePath("/tmp/orphan.pdf")
                .fileSize(500L)
                .contentType("application/pdf")
                .checksumSha256("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
                .build();

        org.assertj.core.api.Assertions.assertThatThrownBy(() -> {
            documentRepository.saveAndFlush(orphanDoc);
        }).hasRootCauseInstanceOf(IllegalStateException.class)
          .hasRootCauseMessage("Document must be associated with either a vendor or a contract");
    }
}
