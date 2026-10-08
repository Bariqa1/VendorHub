# 🏢 VendorHub — Vendor & Contract Management Platform

[![Java 21](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-17%2B-red.svg)](https://angular.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![Build Status](https://img.shields.io/badge/Tests-22%2F22%20Passed-success.svg)]()

> **VendorHub** is an enterprise-grade full-stack platform designed for managing vendor lifecycles, commercial contract workflows, deliverables, and automated AI contract analysis. Built with **Spring Boot 3 (Java 21)**, **Angular**, and **PostgreSQL**, with compliance tailored for Saudi Arabian business regulations (Commercial Registration & ZATCA VAT standards).

---

## 🏛️ System Architecture

```text
                    Angular Frontend (SPA)
                           |
                           | HTTPS / REST (JWT)
                           ↓
                 Spring Boot 3 Backend Server
                           |
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
   PostgreSQL       Spring Security       AI Service (Python)
    Database            + JWT                 |
                                              ↓
                                         LLM / Contract Q&A
```

* **Core Business Backend:** Implemented with Spring Boot 3 utilizing layered Clean Architecture (Controllers ➔ Services ➔ Repositories ➔ Entities/DTOs).
* **Decoupled AI Microservice:** Isolated Python/FastAPI service for document analysis and contract Q&A to ensure zero impact on core transactions.
* **Modern Frontend:** Angular application with Standalone Components, Reactive Forms, Route Guards, and HTTP Interceptors.

---

## ✨ Key Features

### 1. 🛡️ Role-Based Access Control (RBAC) & Security
* Stateless **Signed JWT (HMAC-SHA256 / JWS)** authentication with BCrypt password hashing.
* Distinct personas: `ADMIN`, `PROCUREMENT_OFFICER`, `MANAGER`, and `VENDOR_REPRESENTATIVE`.
* Automatic auditing (`@CreatedBy`, `@CreatedDate`, `@LastModifiedDate`) across all records.

### 2. 🏢 Vendor Management & Regional Compliance
* Comprehensive vendor onboarding with bilingual support (Arabic & English).
* Validation of Saudi Commercial Registrations (10 digits) and ZATCA VAT IDs (15 digits).
* Automated expiry tracking for commercial registrations.
* Server-side pagination, multi-field filtering, and sorting (optimized with `@EntityGraph` to prevent N+1 queries).
* Optimistic locking (`@Version`) to prevent race conditions during updates.

### 3. 📄 Contract Lifecycle & Payment Milestones
* Full contract lifecycle: `DRAFT` ➔ `PENDING_APPROVAL` ➔ `ACTIVE` ➔ `COMPLETED` / `TERMINATED`.
* Strict date consistency validation (`endDate >= startDate`).
* Financial tracking with breakdown into deliverable milestones.
* Real-time financial aggregation per vendor in Saudi Riyals (SAR).

### 4. 🤖 AI Contract Assistant (Isolated Microservice)
* Automated contract summarization (parties, key terms, duration, financial commitments).
* Natural language Q&A for commercial clauses and termination policies.
* Graceful fallback when AI services are offline.

---

## 📂 Monorepo Structure

```text
vendorhub/
├── backend/              # Spring Boot 3 & Java 21 REST API
├── frontend/             # Angular 17+ Client App
├── ai-service/           # FastAPI Contract Intelligence Microservice
├── docs/                 # Software Requirements, ERD, and API Specifications
│   ├── requirements.md
│   ├── api-specification.md
│   └── architecture.md
├── docker-compose.yml    # Full-stack container orchestration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
* Java 21 LTS
* Apache Maven 3.9+
* Node.js 20+ & npm
* Docker & Docker Compose (optional)

### Running Backend Tests
```bash
cd backend
mvn clean test
```

### Running with Docker Compose
```bash
docker compose up --build -d
```
* **Frontend:** `http://localhost:4200`
* **Backend API:** `http://localhost:8080/api/v1`
* **Swagger Documentation:** `http://localhost:8080/swagger-ui.html`
* **AI Service:** `http://localhost:8000/docs`

---

## 🧪 Testing & Verification
The backend includes a comprehensive suite of unit and integration tests using **JUnit 5**, **Mockito**, and **AssertJ**:
* ✅ `VendorEntityTest`: Validates CR and VAT formats, optimistic locking, and expired record queries.
* ✅ `ContractEntityTest`: Tests milestone cascading, chronological integrity, and financial aggregations.
* ✅ `DocumentAndAuditTest`: Verifies SHA-256 document hashing, AI result tracking, and audit logging.
* ✅ `UserRoleSecurityTest`: Tests multi-role assignments and unique constraints.
