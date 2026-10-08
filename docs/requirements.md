# 📋 VendorHub — Software Requirements Specification (SRS)
## Vendor & Contract Management Platform

---

### 1. Executive Summary & Problem Statement
**VendorHub** is a production-grade enterprise platform designed to streamline vendor lifecycle management, commercial contract execution, milestone tracking, and AI-assisted contract intelligence. Built specifically to handle regional business compliance (such as Saudi Commercial Registrations and ZATCA VAT standards), the platform delivers role-based access control (RBAC), end-to-end traceability, pagination, and auditability.

---

### 2. User Roles & Permissions (RBAC)

| Role | Description | Permissions |
|---|---|---|
| **ADMIN** | System Administrator | Full access to users, roles, system audit logs, configurations, and overrides. |
| **PROCUREMENT_OFFICER** | Procurement Specialist | Create & manage vendors, initiate contracts, approve milestones, trigger AI contract analyses. |
| **MANAGER** | Procurement / Business Manager | Review and approve vendors, sign and approve contracts, view executive dashboards. |
| **VENDOR_REPRESENTATIVE** | External Vendor Representative | View vendor profile, upload compliance documents, view active contracts and payment milestones. |

---

### 3. Core Functional Requirements & Use Cases

#### Module 1: Authentication & Authorization
* **UC-AUTH-01:** User Login via Username/Email and Password. Returns JWT access token.
* **UC-AUTH-02:** Token Validation & Role Enforcement via Spring Security interceptors and Angular route guards.
* **UC-AUTH-03:** Password Hashing using BCrypt with salt rounds.

#### Module 2: Vendor Management
* **UC-VND-01: Vendor Registration:** Register vendor with bilingual names (Arabic & English), 10-digit Saudi CR, 15-digit ZATCA VAT ID, contact information, and national address.
* **UC-VND-02: Paginated List & Filtering:** Query vendors with server-side pagination (`page`, `size`), sorting (`sortBy`, `sortDir`), and multi-field filtering (`status`, `city`, `crNumber`, `search`).
* **UC-VND-03: Vendor Status Workflow:** Transition vendor across:
  `DRAFT` ➔ `SUBMITTED` ➔ `UNDER_REVIEW` ➔ `APPROVED` / `REJECTED` / `SUSPENDED`.
* **UC-VND-04: Compliance Check:** Automatic detection of expired Commercial Registrations (`crExpiryDate < CURRENT_DATE`).
* **UC-VND-05: Concurrency Safety:** Optimistic locking via `@Version` to prevent concurrent modification loss.

#### Module 3: Contract Management & Milestones
* **UC-CTR-01: Contract Creation:** Draft contracts linked to approved vendors, specifying contract type (`SUPPLY`, `SERVICES`, `CONSULTING`, `MAINTENANCE`, `IT_INFRASTRUCTURE`), total amount in SAR, and valid start/end dates.
* **UC-CTR-02: Chronological Integrity:** Automatic validation that `endDate >= startDate`.
* **UC-CTR-03: Milestone Tracking:** Break contract value into payment deliverables with due dates and statuses (`PENDING`, `IN_PROGRESS`, `DELIVERED`, `APPROVED`, `PAID`).
* **UC-CTR-04: Approval Workflow:** Transition contract through:
  `DRAFT` ➔ `PENDING_APPROVAL` ➔ `ACTIVE` ➔ `COMPLETED` / `EXPIRED` / `TERMINATED`.
* **UC-CTR-05: Financial Aggregation:** Automated rollup of active contract commitments per vendor.

#### Module 4: Document Repository & Audit Trail
* **UC-DOC-01: File Upload & Hashing:** Store documents (CR, Tax certificate, Signed Agreement) with SHA-256 checksums to guarantee file integrity.
* **UC-DOC-02: Audit Logging:** Log every state change, approval, and user action into `audit_logs` table with actor, timestamp, IP address, and details.

#### Module 5: AI Contract Intelligence (Isolated Microservice)
* **UC-AI-01: Contract Summarization:** Extract key commercial clauses, parties, start/end dates, total amount, and termination conditions.
* **UC-AI-02: Contract Q&A:** Allow procurement officers to ask natural language questions (e.g., *"What are the penalty clauses for late delivery?"*).
* **UC-AI-03: Graceful Fallback:** If the AI service is unavailable or slow, the core Spring Boot system operates uninterrupted with fallback responses.

---

### 4. Non-Functional Requirements (NFR)
1. **Security:** Stateless JWT authentication, CORS protection, SQL injection prevention via JPA parameterization, and input sanitization.
2. **Performance:** Sub-150ms response time on paginated queries backed by composite indexes.
3. **Observability:** Centralized logging with correlation IDs and RFC 7807 problem details for exceptions.
4. **Deployability:** Single command `docker compose up` executing backend, frontend, database, and AI service.
