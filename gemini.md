# Golden Hour — Backend Implementation Specification

> **Stack:** MongoDB · Express.js · React (existing frontend) · Node.js — pure JavaScript throughout.
> **Audience:** Any developer who can pick this document up and implement the backend from scratch.

---

## 1. Project Overview

**Golden Hour** is a medical emergency web application that serves two distinct audiences:

| Audience | Entry point | Core need |
|---|---|---|
| Emergency responders (paramedics, doctors) | `/emergency/auth` | Instant, read-only access to a patient's critical record — blood group, allergies, medications, emergency contacts |
| Civilian patients | `/` · `/create-abha` | Self-service ABHA registration, viewing who accessed their health data, updating emergency contacts |
| Hospital facility staff | `/facility/auth` · `/discharge` | Authenticated post-care discharge entry — new allergies, prescription changes, PDF discharge summary |

The system integrates with India's **Abdm (Ayushman Bharat Digital Mission)** ecosystem, which means ABHA IDs, HPIDs, and HFR IDs are first-class identifiers throughout.

---

## 2. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Runtime | **Node.js** (LTS) | JavaScript everywhere, large ecosystem |
| Framework | **Express.js** | Minimal, flexible, widely understood |
| Database | **MongoDB** (via Mongoose ODM) | Schema-flexible for evolving health records; document model maps naturally to nested allergies/medications/contacts |
| Auth | **JWT** (jsonwebtoken) | Stateless tokens; one token shape per actor type |
| File storage | **GridFS** (MongoDB built-in) | Discharge PDFs stored directly in MongoDB; no external storage service needed |
| Notifications | **Nodemailer + Twilio SDK** | SMS alerts for family notification flow |
| Password hashing | **bcryptjs** | Industry standard for credential hashing |
| Validation | **express-validator** | Request body validation middleware |
| Environment | **dotenv** | Secrets management |
| CORS | **cors** package | Controls which origins can hit the API |

---

## 3. High-Level Architecture

```
┌─────────────────────────────────────────┐
│           React Frontend (Vite)         │
│  Port 8443 (dev) / CDN (prod)           │
└────────────────────┬────────────────────┘
                     │ HTTP/JSON  (JWT in Authorization header)
                     ▼
┌─────────────────────────────────────────┐
│         Express.js API Server           │
│  Port 5000                              │
│                                         │
│  /api/auth/**        Auth routes        │
│  /api/patient/**     Patient routes     │
│  /api/abha/**        ABHA registration  │
│  /api/emergency/**   Responder routes   │
│  /api/facility/**    Facility routes    │
│  /api/discharge/**   Discharge routes   │
│  /api/audit/**       Audit log routes   │
│  /api/files/**       PDF upload/serve   │
└────────────────────┬────────────────────┘
                     │ Mongoose
                     ▼
┌─────────────────────────────────────────┐
│              MongoDB Atlas              │
│  Database: golden_hour                  │
│                                         │
│  Collections:                           │
│   patients          allergies           │
│   medications       emergency_contacts  │
│   staff_credentials facility_credentials│
│   abha_registrations discharge_entries  │
│   audit_logs        physical_card_reqs  │
│   fs.files / fs.chunks  (GridFS PDFs)  │
└─────────────────────────────────────────┘
```

---

## 4. MongoDB Collections & Schemas

Every collection uses Mongoose. All documents automatically get `_id` (ObjectId) and Mongoose adds `createdAt` / `updatedAt` when `{ timestamps: true }` is set.

---

### 4.1 `patients`

The central health record for a registered individual.

```
Field               Type        Notes
─────────────────────────────────────────────────────────────────
_id                 ObjectId    Auto
abhaId              String      14-digit unique ABHA number, indexed, unique
                                Display format: "XXXX XXXX XXXX XX"
abhaAddress         String      e.g. "rahul.sharma@abdm", unique, indexed
name                String      Full legal name
dob                 Date        Date of birth (ISO 8601)
sex                 String      "Male" | "Female" | "Other"
weight_kg           Number      
height_cm           Number      
bloodGroup          String      "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
bloodDonor          Boolean     
bloodLastVerified   Date        When blood group was last clinically confirmed
mobileNumber        String      +91 format, 10 digits after country code
passwordHash        String      bcrypt hash — used for patient portal login
primaryContact      String      Phone number for emergency SMS/call
secondaryContact    String      Phone number for emergency SMS/call
consentGiven        Boolean     NHA data-sharing consent flag
consentTimestamp    Date        When consent was given
createdAt           Date        Auto (timestamps)
updatedAt           Date        Auto (timestamps)
```

**Indexes:** `abhaId` (unique), `abhaAddress` (unique), `mobileNumber`

---

### 4.2 `allergies`

One document per allergy per patient. Kept separate so allergies can be added by multiple facilities over time and individually versioned.

```
Field               Type        Notes
─────────────────────────────────────────────────────────────────
_id                 ObjectId    Auto
patientId           ObjectId    Ref → patients._id, indexed
allergen            String      e.g. "Penicillin"
severity            String      "Mild" | "Moderate" | "Severe" | "Life-threatening"
                                (Emergency view may map these to "Critical" / "High" labels)
reaction            String      e.g. "Anaphylaxis", "Facial swelling"
clinicianVerified   Boolean     True when a credentialed staff member confirmed it
verifiedBy          ObjectId    Ref → staff_credentials._id (nullable)
addedByFacility     ObjectId    Ref → facility_credentials._id
source              String      "discharge" | "registration" | "self-reported"
createdAt           Date        Auto
updatedAt           Date        Auto
```

**Indexes:** `patientId`

---

### 4.3 `medications`

Active medication list for a patient. Supports the Indian tri-dose schedule format used in the UI.

```
Field               Type        Notes
─────────────────────────────────────────────────────────────────
_id                 ObjectId    Auto
patientId           ObjectId    Ref → patients._id, indexed
name                String      Drug name + dose, e.g. "Metformin 500mg"
schedule            String      Indian M-A-N format, e.g. "1-0-1 · after meals"
condition           String      Indication, e.g. "Diabetes", "Hypertension"
action              String      "Started" | "Stopped" | "Dose changed"
                                (populated from discharge entries)
active              Boolean     False if the medication was stopped
addedByFacility     ObjectId    Ref → facility_credentials._id
createdAt           Date        Auto
updatedAt           Date        Auto
```

**Indexes:** `patientId`, compound `(patientId, active)`

---

### 4.4 `emergency_contacts`

Separate collection so contacts can be updated without touching the core patient record.

```
Field               Type        Notes
─────────────────────────────────────────────────────────────────
_id                 ObjectId    Auto
patientId           ObjectId    Ref → patients._id, indexed, unique
                                One document per patient (upsert pattern)
primary             Object
  name              String      e.g. "Priya Sharma"
  relationship      String      e.g. "Spouse"
  phone             String      +91 format
secondary           Object
  name              String      
  relationship      String      
  phone             String      
updatedAt           Date        Auto
```

**Indexes:** `patientId` (unique)

---

### 4.5 `staff_credentials`

Health professionals who authenticate via HPID + 6-digit PIN.

```
Field               Type        Notes
─────────────────────────────────────────────────────────────────
_id                 ObjectId    Auto
hpid                String      Format: "HPID-00-0000-0000-0000", unique, indexed
pinHash             String      bcrypt hash of 6-digit PIN
name                String      e.g. "Dr. A. Menon"
specialization      String      e.g. "Emergency Medicine"
active              Boolean     Soft-delete / suspension flag
lastLoginAt         Date        
createdAt           Date        Auto
updatedAt           Date        Auto
```

**Indexes:** `hpid` (unique)

---

### 4.6 `facility_credentials`

Hospital facilities that authenticate via HFR ID + Employee ID + password.

```
Field               Type        Notes
─────────────────────────────────────────────────────────────────
_id                 ObjectId    Auto
hfrId               String      Format: "IN-HFR-0000-0000", unique, indexed
staffEmployeeId     String      Format: "EMP-000000", indexed
passwordHash        String      bcrypt hash
facilityName        String      e.g. "City General Hospital"
city                String      
state               String      
active              Boolean     
lastLoginAt         Date        
createdAt           Date        Auto
updatedAt           Date        Auto
```

**Indexes:** `hfrId` (unique), compound `(hfrId, staffEmployeeId)` (unique)

---

### 4.7 `abha_registrations`

Tracks in-progress and completed ABHA registration attempts.

```
Field               Type        Notes
─────────────────────────────────────────────────────────────────
_id                 ObjectId    Auto
method              String      "aadhaar" | "dl"
idNumber            String      12-digit Aadhaar or DL number (store hashed, not plaintext)
mobileNumber        String      OTP delivery number
otpHash             String      bcrypt hash of the OTP sent (verified then cleared)
otpExpiresAt        Date        OTP TTL — typically 10 minutes
abhaAddress         String      Chosen handle, e.g. "rahul.sharma" (before @abdm)
consentGiven        Boolean     
consentTimestamp    Date        
status              String      "otp_pending" | "otp_verified" | "completed" | "failed"
patientId           ObjectId    Ref → patients._id (set after successful creation)
enrollmentNumber    String      For DL path: "ENR-YYYY-XXXXXX" format
createdAt           Date        Auto
updatedAt           Date        Auto
```

**Indexes:** `mobileNumber`, `status`

---

### 4.8 `discharge_entries`

One document per discharge event. Allergies and prescription changes are embedded arrays since they belong to this discharge snapshot.

```
Field                   Type        Notes
─────────────────────────────────────────────────────────────────
_id                     ObjectId    Auto
patientId               ObjectId    Ref → patients._id, indexed
facilityId              ObjectId    Ref → facility_credentials._id
admittedAt              Date        e.g. 2026-08-09
dischargedAt            Date        
allergies               Array       Embedded array of allergy snapshots
  [ ]
    allergen            String      
    severity            String      "Mild"|"Moderate"|"Severe"|"Life-threatening"
    reaction            String      
prescriptionChanges     Array       Embedded array of medication change snapshots
  [ ]
    medication          String      Drug name + dose
    action              String      "Started" | "Stopped" | "Dose changed"
    dosageSchedule      String      e.g. "10 units · night"
dischargeSummaryFileId  ObjectId    Ref → GridFS fs.files._id (the uploaded PDF)
createdAt               Date        Auto
updatedAt               Date        Auto
```

**Indexes:** `patientId`, `facilityId`, `dischargedAt`

---

### 4.9 `audit_logs`

Every access to a patient record — reads and writes — must produce one entry here. This powers the patient's access log view in the UI.

```
Field               Type        Notes
─────────────────────────────────────────────────────────────────
_id                 ObjectId    Auto
patientId           ObjectId    Ref → patients._id, indexed
actorType           String      "staff" | "facility" | "patient" | "paramedic"
actorId             ObjectId    Ref to whichever credential collection matches actorType
actorName           String      Denormalized display string, e.g. "Dr. A. Menon (HPID-11)"
facilityName        String      Denormalized, e.g. "City General Hospital"
dataAccessed        String      Human-readable scope, e.g. "Full emergency record"
accessType          String      "emergency" | "discharge" | "self" | "registration"
tone                String      "emergency" | "warn" | "ok"
                                Maps to UI badge colours
ipAddress           String      Request IP (for forensic trail)
sessionId           String      JWT jti claim
createdAt           Date        Auto (no updatedAt — logs are immutable)
```

**Indexes:** `patientId` + `createdAt` (compound, descending) for paginated patient view

---

### 4.10 `physical_card_requests`

Tracks requests for a replacement physical ABHA card.

```
Field               Type        Notes
─────────────────────────────────────────────────────────────────
_id                 ObjectId    Auto
patientId           ObjectId    Ref → patients._id, indexed
status              String      "requested" | "processing" | "dispatched" | "delivered"
requestedAt         Date        
dispatchedAt        Date        nullable
trackingId          String      nullable, filled when dispatched
address             String      Delivery address snapshot at time of request
createdAt           Date        Auto
updatedAt           Date        Auto
```

---

### 4.11 GridFS — PDF Discharge Summaries

MongoDB's GridFS is used to store uploaded PDF files. No separate collection schema is needed — Mongoose's `gridfs-stream` or the official `mongodb` driver handles this natively. Two system collections are created automatically:

```
fs.files       — metadata per uploaded file (filename, contentType, size, uploadDate, metadata{})
fs.chunks      — binary chunks of file data (default 255 KB per chunk)
```

Custom metadata stored inside `fs.files.metadata`:
```
patientId       ObjectId
facilityId      ObjectId
dischargeId     ObjectId
uploadedBy      ObjectId  (staff employee)
```

**Size limit enforced in Express middleware:** 20 MB. Only `application/pdf` content-type accepted.

---

## 5. API Routes — High-Level Overview

All routes are prefixed with `/api`. Every protected route requires a valid JWT in the `Authorization: Bearer <token>` header. The token payload carries `{ sub, role, jti, iat, exp }`.

### Role definitions

| Role | Who | Token lifetime |
|---|---|---|
| `staff` | Emergency responder authenticated via HPID + PIN | 8 hours |
| `facility` | Hospital staff authenticated via HFR + EMP + password | 12 hours |
| `patient` | Patient authenticated via mobile/ABHA + password | 7 days |

---

### 5.1 Auth Routes `/api/auth`

| Method | Path | Body | Protected | Description |
|---|---|---|---|---|
| POST | `/auth/staff/login` | `{ hpid, pin }` | No | Verify HPID + PIN → return JWT (role: staff) |
| POST | `/auth/facility/login` | `{ hfrId, staffEmployeeId, password }` | No | Verify facility credentials → return JWT (role: facility) |
| POST | `/auth/patient/login` | `{ mobileOrAbhaAddress, password }` | No | Verify patient credentials → return JWT (role: patient) |

---

### 5.2 ABHA Registration Routes `/api/abha`

| Method | Path | Body | Protected | Description |
|---|---|---|---|---|
| POST | `/abha/initiate` | `{ method, idNumber, mobileNumber, consentGiven }` | No | Start registration; trigger OTP via ABDM sandbox |
| POST | `/abha/verify-otp` | `{ registrationId, otp }` | No | Verify OTP hash; advance status to `otp_verified` |
| POST | `/abha/create` | `{ registrationId, abhaAddress }` | No | Finalize ABHA address; create patient record; return ABHA card data |
| GET | `/abha/check-address` | Query: `?handle=rahul.sharma` | No | Check if an ABHA address handle is already taken |

---

### 5.3 Emergency Responder Routes `/api/emergency`

| Method | Path | Body | Protected | Description |
|---|---|---|---|---|
| GET | `/emergency/patient/:abhaId` | — | Yes (staff) | Fetch full emergency record: identity, blood, allergies, medications, contacts. Writes audit log entry (tone: emergency) |
| POST | `/emergency/patient/:abhaId/notify-family` | — | Yes (staff) | Trigger SMS + call to primary and secondary emergency contacts via Twilio |

---

### 5.4 Patient Routes `/api/patient`

| Method | Path | Body | Protected | Description |
|---|---|---|---|---|
| GET | `/patient/me` | — | Yes (patient) | Fetch own profile — name, ABHA ID, ABHA address, blood group. Writes audit log (tone: ok) |
| PUT | `/patient/me/emergency-contacts` | `{ primary: { name, relationship, phone }, secondary: { ... } }` | Yes (patient) | Update emergency contact numbers |
| POST | `/patient/me/request-card` | — | Yes (patient) | Create a physical_card_requests document |
| GET | `/patient/me/audit-log` | Query: `?page&limit` | Yes (patient) | Paginated list of all access log entries for this patient |

---

### 5.5 Facility & Discharge Routes `/api/facility` and `/api/discharge`

| Method | Path | Body | Protected | Description |
|---|---|---|---|---|
| GET | `/facility/patient/:abhaId` | — | Yes (facility) | Fetch patient identity needed to display on discharge form header. Writes audit log (tone: warn) |
| POST | `/discharge` | multipart/form-data: `patientAbhaId`, `allergies[]`, `prescriptionChanges[]`, `dischargeSummary` (PDF) | Yes (facility) | Submit full discharge entry. Saves PDF to GridFS. Creates discharge document. Upserts new allergies into allergies collection. Updates medications collection. Writes audit log |
| GET | `/discharge/:dischargeId` | — | Yes (facility or patient) | Fetch a single discharge entry with file metadata |
| GET | `/discharge/:dischargeId/file` | — | Yes (facility or patient) | Stream the discharge PDF from GridFS |

---

### 5.6 Audit Log Route `/api/audit`

The audit log is written internally by other route handlers — it is never written directly from the client. The only external-facing audit route is the patient read endpoint listed under `/api/patient/me/audit-log` above.

---

## 6. Authentication & Authorization

### JWT structure

```
Header:  { alg: "HS256", typ: "JWT" }
Payload: {
  sub:      "<MongoDB _id of the actor>",
  role:     "staff" | "facility" | "patient",
  jti:      "<uuid v4>",           // stored in audit_logs.sessionId
  iat:      <unix timestamp>,
  exp:      <unix timestamp>
}
```

### Middleware chain

Every protected route passes through two middleware layers:

1. **`verifyToken`** — Decodes and validates the JWT. Attaches `req.actor = { id, role }`.
2. **`requireRole(...roles)`** — Checks `req.actor.role` against the allowed list. Returns 403 if not permitted.

### RBAC matrix

| Route group | staff | facility | patient |
|---|---|---|---|
| Emergency patient read | ✅ | ❌ | ❌ |
| Notify family | ✅ | ❌ | ❌ |
| Discharge submit | ❌ | ✅ | ❌ |
| Discharge file read | ❌ | ✅ | ✅ |
| Patient self read | ❌ | ❌ | ✅ |
| Update emergency contacts | ❌ | ❌ | ✅ |
| Request replacement card | ❌ | ❌ | ✅ |
| View audit log | ❌ | ❌ | ✅ |

---

## 7. Audit Trail — How It Works

Every time a protected route is hit and data is read or written, the route handler (or a post-response hook) inserts one document into `audit_logs`. This is what populates the patient-facing access log in the UI.

**Tone mapping:**

| Scenario | `accessType` | `tone` |
|---|---|---|
| Emergency responder reads full record | `emergency` | `emergency` |
| Facility reads patient for discharge | `discharge` | `warn` |
| Patient views own profile | `self` | `ok` |

The `facilityName` and `actorName` fields are denormalized at write time so the audit log remains readable even if credentials are later deleted.

---

## 8. Notification Flow (Family Alert)

When `POST /emergency/patient/:abhaId/notify-family` is called:

1. Look up the patient's `emergency_contacts` document.
2. Send an SMS to `primary.phone` and `secondary.phone` via **Twilio Programmable SMS** using the Twilio Node.js SDK.
3. Optionally trigger a Twilio voice call to `primary.phone` using a TwiML response that reads a pre-set message.
4. Return `{ notified: true, timestamp }` to the client.

No job queue is used — the Twilio API call is awaited directly in the route handler. If it fails, the error is logged but a 200 is still returned to the responder so the UI can show success (the clinical priority is showing the record, not blocking on notification delivery).

---

## 9. File Upload Flow (Discharge PDF)

1. The client POSTs to `/api/discharge` with `Content-Type: multipart/form-data`.
2. **Multer** middleware (with `multer-gridfs-storage`) intercepts the file stream and pipes it directly into MongoDB GridFS. The file never lands on disk.
3. Multer enforces: `fileFilter` (only `application/pdf`), `limits.fileSize` (20 MB = 20 × 1024 × 1024 bytes).
4. On successful upload, GridFS returns a `file._id` which is stored in `discharge_entries.dischargeSummaryFileId`.
5. To serve the file back: open a GridFS download stream by `_id` and pipe it to the HTTP response with `Content-Type: application/pdf` and `Content-Disposition: inline`.

---

## 10. ABDM Integration Notes

The Aadhaar OTP flow and DL enrollment are gated by the **National Health Authority sandbox** APIs. In a real implementation:

- **Aadhaar path:** Call NHA's `/v1/registration/aadhaar/generateOtp` with the hashed Aadhaar number. NHA sends OTP to the linked mobile. Your backend stores the `txnId` from NHA's response and uses it in the verify call.
- **DL path:** NHA does not offer instant verification. The backend generates a local enrollment number (`ENR-YYYY-XXXXXX`), stores the registration as `status: "otp_pending"`, and a manual review step (out of scope for this MVP) transitions it to `completed`.
- In development, skip the real NHA call and use a hardcoded OTP (`123456`) so the flow can be exercised without credentials.

---

## 11. Project Folder Structure

```
golden-hour-backend/
├── src/
│   ├── config/
│   │   └── db.js              # Mongoose connection setup
│   ├── models/
│   │   ├── Patient.js
│   │   ├── Allergy.js
│   │   ├── Medication.js
│   │   ├── EmergencyContact.js
│   │   ├── StaffCredential.js
│   │   ├── FacilityCredential.js
│   │   ├── AbhaRegistration.js
│   │   ├── DischargeEntry.js
│   │   ├── AuditLog.js
│   │   └── PhysicalCardRequest.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── abha.routes.js
│   │   ├── emergency.routes.js
│   │   ├── patient.routes.js
│   │   ├── facility.routes.js
│   │   ├── discharge.routes.js
│   │   └── audit.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── abha.controller.js
│   │   ├── emergency.controller.js
│   │   ├── patient.controller.js
│   │   ├── facility.controller.js
│   │   └── discharge.controller.js
│   ├── middleware/
│   │   ├── verifyToken.js     # JWT decode + attach req.actor
│   │   ├── requireRole.js     # RBAC check
│   │   └── uploadPdf.js       # Multer + GridFS storage config
│   ├── services/
│   │   ├── notification.service.js   # Twilio SMS + call
│   │   ├── auditLog.service.js       # Shared helper to write audit entries
│   │   └── abdm.service.js           # NHA API wrapper (or mock)
│   └── app.js                 # Express app setup, route mounting, error handler
├── server.js                  # Entry point — connects DB then starts listening
├── .env                       # Never committed
├── .env.example               # Committed — template with all keys
└── package.json
```

---

## 12. Environment Variables (`.env.example`)

```
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/golden_hour

# JWT
JWT_SECRET=replace_with_a_long_random_string
JWT_STAFF_EXPIRES_IN=8h
JWT_FACILITY_EXPIRES_IN=12h
JWT_PATIENT_EXPIRES_IN=7d

# Twilio (family notification)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1415XXXXXXX

# ABDM / NHA (use sandbox values in dev)
ABDM_BASE_URL=https://healthidsbx.abdm.gov.in/api
ABDM_CLIENT_ID=
ABDM_CLIENT_SECRET=

# Frontend origin (for CORS)
CLIENT_ORIGIN=http://localhost:8443
```

---

## 13. Development Setup

1. **Install Node.js** (LTS) and **MongoDB** (local) or create a free MongoDB Atlas cluster.
2. Clone the backend repo, run `npm install`.
3. Copy `.env.example` to `.env` and fill in `MONGO_URI` and `JWT_SECRET` at minimum.
4. Run `node server.js` (or `nodemon server.js` for hot reload).
5. **Seed script** — create `seed.js` that inserts one patient matching the frontend's hardcoded mock (Rahul Sharma, ABHA `12345678901234`, blood group O+, the three allergies, four medications, two emergency contacts). Run with `node seed.js` to get the app working end-to-end immediately.

---

## 14. Security Checklist

| Risk | Mitigation |
|---|---|
| Broken auth | JWT with short expiry; bcrypt for all passwords and PINs |
| Sensitive data in logs | Never log Aadhaar numbers, PINs, or full ABHA IDs |
| Aadhaar number storage | Store only a SHA-256 hash, never plaintext |
| Mass assignment | Use explicit field whitelists in each controller; never pass `req.body` directly to Mongoose |
| NoSQL injection | Use Mongoose ODM with typed schemas; never pass raw user strings into `$where` or `$regex` |
| Rate limiting | Apply `express-rate-limit` on all auth routes (e.g. 5 attempts per 15 minutes) |
| CORS | Lock `cors` to `CLIENT_ORIGIN` only; no wildcard `*` in production |
| PHI data access | Every patient record read must write an audit log entry — enforced in middleware, not left to controllers |
| File upload abuse | Multer size limit (20 MB) + MIME type check (`application/pdf`) before GridFS write |
| OTP brute force | Lock the registration document after 5 failed OTP attempts; expire OTPs after 10 minutes |
