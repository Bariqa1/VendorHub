package com.vendorhub.document.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.vendorhub.document.entity.DocumentVerificationAudit;
import com.vendorhub.document.enums.AuditDecision;

import java.util.List;

@Repository
public interface DocumentVerificationAuditRepository extends JpaRepository<DocumentVerificationAudit, Long> {

    List<DocumentVerificationAudit> findByDocumentId(Long documentId);

    List<DocumentVerificationAudit> findByDocumentIdOrderByVerifiedAtDesc(Long documentId);

    List<DocumentVerificationAudit> findByDecision(AuditDecision decision);
}
