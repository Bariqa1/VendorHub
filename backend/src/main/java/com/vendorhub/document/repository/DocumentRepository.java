package com.vendorhub.document.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.vendorhub.document.entity.Document;
import com.vendorhub.document.enums.DocumentStatus;
import com.vendorhub.document.enums.DocumentType;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    Optional<Document> findByPublicId(UUID publicId);

    List<Document> findByVendorId(Long vendorId);

    List<Document> findByContractId(Long contractId);

    List<Document> findByStatus(DocumentStatus status);

    Optional<Document> findByChecksumSha256(String checksumSha256);

    Optional<Document> findByVendorIdAndDocumentType(Long vendorId, DocumentType documentType);
}
