# 🌐 VendorHub — REST API Specification
## Standard RESTful API Contract

Base URL: `/api/v1`

---

### 1. Authentication Endpoints (`/api/v1/auth`)

#### `POST /auth/login`
Authenticates a user and issues a JWT token.
* **Request:**
  ```json
  {
    "username": "procurement.lead",
    "password": "SecurePassword123!"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "user": {
      "publicId": "e5c1df24-82a1-424a-b5e0-3e288e44c21a",
      "username": "procurement.lead",
      "fullName": "سعود بن فهد السبيعي",
      "roles": ["ROLE_PROCUREMENT_OFFICER"]
    }
  }
  ```

---

### 2. Vendor Endpoints (`/api/v1/vendors`)

#### `GET /vendors`
Paginated search and filter for vendors.
* **Query Parameters:**
  * `page` (int, default: 0)
  * `size` (int, default: 10)
  * `sortBy` (string, default: "createdAt")
  * `sortDir` (string, "asc" | "desc", default: "desc")
  * `status` (string, optional: `DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `SUSPENDED`)
  * `search` (string, optional: search query matching company name, CR, or tax number)
* **Response (200 OK):**
  ```json
  {
    "content": [
      {
        "publicId": "7a9b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d",
        "companyNameAr": "شركة الموردين المتقدمة",
        "companyNameEn": "Advanced Vendors Co",
        "crNumber": "1010998877",
        "crExpiryDate": "2027-10-15",
        "taxNumber": "300123456789003",
        "city": "الرياض",
        "status": "APPROVED",
        "complianceScore": 96.50,
        "createdAt": "2026-10-08T19:00:00Z"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 48,
    "totalPages": 5,
    "last": false
  }
  ```

#### `POST /vendors`
Creates a new vendor profile.
* **Request:**
  ```json
  {
    "companyNameAr": "شركة الحلول الصناعية",
    "companyNameEn": "Industrial Solutions Co",
    "crNumber": "1010445566",
    "crExpiryDate": "2027-06-30",
    "taxNumber": "300998877665003",
    "nationalAddress": "الرياض، حي الملز، مبنى 104",
    "city": "الرياض",
    "contactEmail": "info@indus-solutions.sa",
    "contactPhone": "+966551122334"
  }
  ```
* **Response (201 Created):** Returns created VendorDTO.

#### `GET /vendors/{publicId}`
Retrieves details of a specific vendor.

#### `PATCH /vendors/{publicId}/status`
Updates vendor approval status.
* **Request:**
  ```json
  {
    "status": "APPROVED",
    "reason": "Commercial Registration and Tax Certificate verified"
  }
  ```

---

### 3. Contract Endpoints (`/api/v1/contracts`)

#### `GET /contracts`
Paginated search for contracts.
* **Query Parameters:** `page`, `size`, `sortBy`, `sortDir`, `status`, `vendorPublicId`.
* **Response (200 OK):** Page of ContractDTO.

#### `POST /contracts`
Creates a new contract draft with milestones.
* **Request:**
  ```json
  {
    "vendorPublicId": "7a9b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d",
    "contractNumber": "VHB-2026-0042",
    "title": "عقد توريد البرمجيات السحابية",
    "contractType": "IT_INFRASTRUCTURE",
    "totalAmount": 750000.00,
    "currency": "SAR",
    "startDate": "2026-11-01",
    "endDate": "2027-10-31",
    "paymentTerms": "الدفع عند تسليم كل مرحلة معتمدة",
    "milestones": [
      {
        "title": "المرحلة الأولى: توريد التراخيص",
        "amount": 375000.00,
        "dueDate": "2026-12-31"
      },
      {
        "title": "المرحلة الثانية: الدعم الفني والتشغيل",
        "amount": 375000.00,
        "dueDate": "2027-10-31"
      }
    ]
  }
  ```

#### `PATCH /contracts/{publicId}/status`
Transitions contract status (`PENDING_APPROVAL`, `ACTIVE`, `TERMINATED`).

---

### 4. AI Assistant Endpoints (`/api/v1/ai/contracts`)

#### `POST /ai/contracts/{publicId}/analyze`
Requests automated analysis and summarization of an attached contract.
* **Response (200 OK):**
  ```json
  {
    "contractPublicId": "c8e2a1b0-4f5a-6b7c-8d9e-0f1a2b3c4d5e",
    "summary": "عقد توريد بنية تحتية سحابية بقيمة 750,000 ريال سعودي على مرحلتين تسليم.",
    "parties": {
      "client": "VendorHub Enterprise",
      "vendor": "Advanced Vendors Co"
    },
    "keyDates": {
      "effectiveDate": "2026-11-01",
      "expirationDate": "2027-10-31"
    },
    "financialTerms": {
      "totalValue": 750000.00,
      "currency": "SAR"
    },
    "clauses": [
      { "type": "TERMINATION", "description": "يحق للطرف الأول إنهاء العقد بإشعار مسبق مدته 30 يوماً." }
    ]
  }
  ```

#### `POST /ai/contracts/{publicId}/ask`
Ask natural language questions about a specific contract.
* **Request:**
  ```json
  {
    "question": "ما هي شروط إنهاء هذا العقد في حال التأخير؟"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "answer": "وفقاً للمادة التاسعة من العقد، تطبق غرامة تأخير بواقع 1% لكل أسبوع بحد أقصى 10% من إجمالي قيمة العقد قبل اتخاذ إجراء الإنهاء."
  }
  ```

---

### 5. Dashboard Metrics (`/api/v1/dashboard/metrics`)

#### `GET /dashboard/metrics`
Provides summarized analytics for the Angular dashboard cards and charts:
* `totalVendors`: count
* `activeVendors`: count
* `activeContracts`: count
* `contractsExpiringSoon`: count (next 30 days)
* `pendingApprovals`: count
* `totalCommittedValueSAR`: sum of active contracts amount
