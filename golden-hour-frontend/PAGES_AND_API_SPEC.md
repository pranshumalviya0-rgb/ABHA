# Golden Hour — Pages, Database Schema & API Specification

> **Stack:** MongoDB · Express.js · Node.js · JavaScript  
> **Date captured:** 2026-08-20  
> **Source:** Live frontend codebase (latest version)

This document describes every page of the Golden Hour application in its current state, the MongoDB collection schema each page touches, and the API routes required to back it.

---

## Application Navigation Map

```
/ (Landing)
├── [QR / Manual ABHA] → /emergency/auth (Staff PIN)
│     └── → /emergency/dashboard (Read-only patient record)
│           └── → / (End session)
│
├── [Patient Login] → /patient (Patient Dashboard)
│     └── → / (Sign out)
│
├── [Forgot access?] → /forgot-access (Password Recovery)
│     └── → /
│
├── [Create ABHA] → /create-abha (4-step ABHA wizard)
│     └── → /patient
│
└── [Post-Care Discharge] → /facility/auth (Facility Login)
      └── → /discharge (Discharge Entry Form)
            └── → /discharge/review (Confirmation Review)
                  └── → /
```

---

## Actor Types

| Actor | How they authenticate | What they can do |
|---|---|---|
| `patient` | Mobile/ABHA address + password | View own record, manage conditions and contacts, request card, recover password |
| `staff` | HPID + 6-digit PIN | Read-only emergency patient record, trigger family notification |
| `facility` | HFR ID + Employee ID + password | Submit discharge entries for a patient |

---

---

# SECTION 1 — DATABASE SCHEMAS

All collections live in the `golden_hour` MongoDB database. Every document automatically gets `_id` (ObjectId). Collections with `timestamps: true` get `createdAt` and `updatedAt`.

---

## Collection 1: `patients`

Central health record. Created when a user completes ABHA registration (Step 4 of `/create-abha`). Updated when the patient edits emergency contacts or adds conditions.

```js
{
  _id: ObjectId,

  // ABHA identity
  abhaId:          String,   // 14-digit unique, indexed, unique
                             // stored without spaces: "12345678901234"
                             // displayed as "XXXX XXXX XXXX XX"
  abhaAddress:     String,   // "rahul.sharma@abdm", unique, indexed
                             // handle part: lowercase [a-z0-9._]+

  // Personal details (from CreateAbha Step 3)
  fullName:        String,   // required
  dob:             Date,     // required — ISO date from <input type="date">
  gender:          String,   // "Male" | "Female" | "Other" | "Prefer not to say"
  address:         String,   // residential address, required

  // Medical biometrics (optional in registration)
  bloodGroup:      String,   // "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
                             // required in Step 3
  weight_kg:       Number,   // optional, from Step 3
  height_cm:       Number,   // optional, from Step 3

  // Auth
  passwordHash:    String,   // bcrypt hash — patient portal login password
  mobileNumber:    String,   // "+91XXXXXXXXXX", linked to Aadhaar OTP during registration

  // Emergency contacts (editable from patient dashboard)
  primaryContact:  String,   // phone number, e.g. "+91 98220 45210"
  secondaryContact: String,  // phone number

  // Registration metadata
  aadhaarHash:     String,   // SHA-256 of Aadhaar number — NEVER store plaintext
  consentGiven:    Boolean,  // NHA data sharing consent
  consentAt:       Date,     // timestamp of consent

  // Physical ABHA card request
  cardRequested:   Boolean,  // default false
  cardRequestedAt: Date,     // set when cardRequested becomes true

  timestamps: true           // createdAt, updatedAt
}
```

**Indexes:**
- `abhaId`: unique
- `abhaAddress`: unique
- `mobileNumber`: standard index

---

## Collection 2: `conditions`

Patient self-reported conditions — added and removed from the Patient Dashboard. One document per condition per patient.

```js
{
  _id: ObjectId,

  patientId:  ObjectId,  // ref → patients._id, indexed
  name:       String,    // e.g. "Type 2 Diabetes" — required
  since:      String,    // year string e.g. "2018" — optional
  notes:      String,    // free text e.g. "Managed with Metformin" — optional

  timestamps: true       // createdAt, updatedAt
}
```

**Indexes:** `patientId`

---

## Collection 3: `audit_logs`

Every access to a patient record (read or write) creates one immutable entry. This powers the "Emergency Access Logs" list on the patient dashboard.

```js
{
  _id: ObjectId,

  patientId:    ObjectId,  // ref → patients._id, indexed
  actorType:    String,    // "staff" | "facility" | "patient"
  actorId:      ObjectId,  // ref to whichever credential collection applies
  actorName:    String,    // denormalized display string: "Dr. A. Menon (HPID-11)"
  facilityName: String,    // denormalized: "City General Hospital"
  dataAccessed: String,    // human-readable: "Full emergency record"
  accessType:   String,    // "emergency" | "discharge" | "self" | "registration"
  tone:         String,    // "emergency" | "warn" | "ok" — maps to badge color in UI

  createdAt:    Date       // immutable — no updatedAt on logs
}
```

**Indexes:** compound `(patientId, createdAt)` descending — supports paginated patient view

---

## Collection 4: `staff_credentials`

Health professionals (doctors, paramedics) who authenticate via HPID + 6-digit PIN.

```js
{
  _id: ObjectId,

  hpid:           String,   // "HPID-00-0000-0000-0000" — unique, indexed
  pinHash:        String,   // bcrypt hash of 6-digit numeric PIN
  name:           String,   // display name: "Dr. A. Menon"
  specialization: String,   // e.g. "Emergency Medicine"
  active:         Boolean,  // soft-delete / suspension flag, default true

  lastLoginAt:    Date,

  timestamps: true
}
```

**Indexes:** `hpid` unique

---

## Collection 5: `facility_credentials`

Hospital facilities authenticating via HFR ID + Employee ID + password.

```js
{
  _id: ObjectId,

  hfrId:          String,   // "IN-HFR-0000-0000" — indexed
  staffEmployeeId: String,  // "EMP-000000" — indexed
  passwordHash:   String,   // bcrypt hash
  facilityName:   String,   // "City General Hospital"
  city:           String,
  state:          String,
  active:         Boolean,  // default true

  lastLoginAt:    Date,

  timestamps: true
}
```

**Indexes:** `hfrId`, compound `(hfrId, staffEmployeeId)` unique

---

## Collection 6: `abha_registrations`

Tracks in-progress and completed ABHA registration attempts (from `/create-abha`).

```js
{
  _id: ObjectId,

  // Step 1 data
  aadhaarHash:   String,    // SHA-256 of the 12-digit Aadhaar — never store plaintext
  mobileNumber:  String,    // OTP delivery number

  // Step 2 data
  otpHash:       String,    // bcrypt hash of OTP sent — cleared after verification
  otpExpiresAt:  Date,      // OTP TTL — 10 minutes from creation

  // Step 3 data (manual medical profile)
  fullName:      String,
  dob:           Date,
  gender:        String,    // "Male" | "Female" | "Other" | "Prefer not to say"
  address:       String,
  bloodGroup:    String,    // "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
  weight_kg:     Number,    // optional
  height_cm:     Number,    // optional
  emergencyContact: String, // optional phone number
  abhaHandle:    String,    // chosen handle e.g. "rahul.sharma" (before @abdm)
  consentGiven:  Boolean,

  // Flow status
  status:        String,    // "otp_pending" | "otp_verified" | "profile_complete" | "completed" | "failed"

  // Link to created patient
  patientId:     ObjectId,  // ref → patients._id — set after successful creation

  timestamps: true
}
```

**Indexes:** `mobileNumber`, `status`, `otpExpiresAt` (TTL index to auto-delete expired attempts)

---

## Collection 7: `discharge_entries`

One document per discharge event submitted at `/discharge`. Contains 5 optional clinical sections — only the ones the doctor checked are populated.

```js
{
  _id: ObjectId,

  // Context
  patientId:     ObjectId,  // ref → patients._id, indexed
  facilityId:    ObjectId,  // ref → facility_credentials._id
  admittedAt:    Date,      // hardcoded context shown in UI (from patient admission record)
  submittedAt:   Date,      // server timestamp at submission

  // Section 1 — Severe Allergies (null if not selected)
  allergy: {
    allergen:              String,  // free text, e.g. "Penicillin"
    reactionSeverity:      String,  // "Class 0 — No reaction" ... "Class 4 — Life-threatening (anaphylactic shock)"
    clinicalManifestation: String,  // "Anaphylaxis" | "Hives / Urticaria" | "Bronchospasm" | "Angioedema" | "Contact dermatitis" | "Stevens-Johnson Syndrome"
    epinephrineRequired:   Boolean,
  },                                // entire object null/absent when section unchecked

  // Section 2 — Diabetes Mellitus (null if not selected)
  diabetes: {
    treatmentPathway: String,  // "Insulin" | "Oral medication" | "Diet-controlled" | "Insulin + Oral"
    hba1cPercent:     Number,  // 3.0 – 20.0
    dkaHistory:       Boolean,
  },

  // Section 3 — Critical Medical Implants (null if not selected)
  implant: {
    deviceName:  String,  // free text, e.g. "Medtronic Micra Pacemaker"
    mriClass:    String,  // "MR-Safe" | "MR-Conditional" | "MR-Unsafe"
    serialNo:    String,  // free text, e.g. "SN-2024-449821 · 1.5T max field strength"
  },

  // Section 4 — Blood Thinners (null if not selected)
  bloodThinner: {
    drugName:       String,  // free text, e.g. "Warfarin"
    lastDoseAt:     Date,    // from datetime-local input
    targetInr:      Number,  // 1.0 – 5.0
    reversalAgent:  String,  // "Vitamin K" | "Andexanet alfa" | "Idarucizumab (Praxbind)" | "Protamine sulphate" | "None"
  },

  // Section 5 — High-Risk Medications (null if not selected)
  highRiskMed: {
    apinchsCategory: String,  // "A — Antimicrobials" | "P — Potassium (electrolytes)" | "I — Insulin" | "N — Narcotics / Opioids" | "C — Chemotherapeutic agents" | "H — Heparin (anticoagulants)" | "S — Sedatives / Psychotropics"
    genericDrug:     String,  // free text drug name
    route:           String,  // "IV" | "Oral" | "IM" | "SC" | "Topical"
    labMarker:       String,  // free text, e.g. "Serum creatinine, CBC, LFTs"
  },

  // Doctor's note — always present (may be empty string)
  doctorNote: String,         // max 100 words — enforced client-side; validate server-side too

  // Review page metadata
  reviewedAndConfirmed: Boolean,  // true after "Confirm & Submit" on review page

  timestamps: true
}
```

**Indexes:** `patientId`, `facilityId`, `submittedAt`

---

## Collection 8: `otp_sessions`

Temporary OTP records for account recovery (`/forgot-access`). Separate from registration OTPs.

```js
{
  _id: ObjectId,

  // What the user identified with
  method:      String,   // "mobile" | "abha"
  identifier:  String,   // mobile number or ABHA address handle (lowercased)

  // OTP
  otpHash:     String,   // bcrypt hash of the 6-digit OTP
  expiresAt:   Date,     // 10 minutes from creation (TTL index)

  // Result
  verified:    Boolean,  // set to true after correct OTP entered
  used:        Boolean,  // set to true after password reset completes

  createdAt:   Date
}
```

**Indexes:** `expiresAt` (TTL — auto-deletes after expiry), `identifier`

---

---

# SECTION 2 — PAGE-BY-PAGE API ROUTES

All routes are prefixed `/api`. Protected routes require `Authorization: Bearer <jwt>` header. JWT payload: `{ sub, role, jti, iat, exp }`.

---

## Page 1: Landing Page (`/`)

### Patient Login

**`POST /api/auth/patient/login`**

```
Purpose:  Authenticate patient via mobile number or ABHA address + password.
Auth:     None (public)

Request body:
{
  "identifier": "rahul.sharma@abdm",   // mobile number or ABHA address
  "password":   "••••••••"
}

Response 200:
{
  "token": "<jwt>",
  "patient": {
    "id":          "<ObjectId>",
    "abhaId":      "12345678901234",
    "abhaAddress": "rahul.sharma@abdm",
    "fullName":    "Rahul Sharma"
  }
}

Response 401: { "error": "Invalid credentials" }
```

---

## Page 2: Staff Authentication (`/emergency/auth`)

### Staff Login

**`POST /api/auth/staff/login`**

```
Purpose:  Authenticate health professional via HPID + 6-digit PIN.
Auth:     None (public)

Request body:
{
  "hpid": "HPID-00-0000-0000-0000",
  "pin":  "123456"
}

Response 200:
{
  "token": "<jwt with role='staff'>",
  "staff": {
    "id":             "<ObjectId>",
    "name":           "Dr. A. Menon",
    "specialization": "Emergency Medicine"
  }
}

Response 401: { "error": "Invalid HPID or PIN" }
```

---

## Page 3: Emergency Dashboard (`/emergency/dashboard`)

### Fetch patient emergency record

**`GET /api/emergency/patient/:abhaId`**

```
Purpose:  Return the full emergency record for a given patient ABHA ID.
          Writes one audit_log entry (tone: "emergency").
Auth:     Required — role: "staff"

URL param: abhaId — 14-digit ABHA ID (no spaces)

Response 200:
{
  "patient": {
    "abhaId":      "12345678901234",
    "fullName":    "Rahul Sharma",
    "dob":         "1983-06-14",
    "gender":      "Male",
    "bloodGroup":  "O+",
    "weight_kg":   72,
    "height_cm":   176
  },
  "conditions": [
    { "id": "<ObjectId>", "name": "Type 2 Diabetes", "since": "2018", "notes": "Managed with Metformin" },
    { "id": "<ObjectId>", "name": "Hypertension",    "since": "2020", "notes": "On Telmisartan 40mg" }
  ],
  "allergies": [
    // pulled from latest discharge_entries with allergy section present
    { "allergen": "Penicillin", "reactionSeverity": "Class 4 — Life-threatening (anaphylactic shock)", "clinicalManifestation": "Anaphylaxis", "epinephrineRequired": true }
  ],
  "medications": [
    // pulled from latest discharge_entries with highRiskMed or diabetes sections present
    { "genericDrug": "Metformin", "route": "Oral", "category": "Diabetes" }
  ],
  "emergencyContacts": {
    "primary":   { "phone": "+91 98220 45210" },
    "secondary": { "phone": "+91 90040 88455" }
  }
}

Response 404: { "error": "Patient not found" }
```

### Notify family

**`POST /api/emergency/patient/:abhaId/notify-family`**

```
Purpose:  Trigger SMS + call to both emergency contacts via Twilio.
Auth:     Required — role: "staff"

Request body: (empty)

Response 200:
{
  "notified": true,
  "timestamp": "2026-08-20T14:32:00.000Z"
}

Response 404: { "error": "Patient not found" }
Response 422: { "error": "No emergency contacts on file" }
```

---

## Page 4: Facility Authentication (`/facility/auth`)

### Facility staff login

**`POST /api/auth/facility/login`**

```
Purpose:  Authenticate hospital facility staff.
Auth:     None (public)

Request body:
{
  "hfrId":          "IN-HFR-0000-0000",
  "staffEmployeeId": "EMP-000000",
  "password":        "••••••••"
}

Response 200:
{
  "token": "<jwt with role='facility'>",
  "facility": {
    "id":           "<ObjectId>",
    "facilityName": "City General Hospital",
    "city":         "Pune",
    "state":        "Maharashtra"
  }
}

Response 401: { "error": "Invalid credentials" }
```

---

## Page 5: Discharge Entry (`/discharge`)

### Fetch patient context header

**`GET /api/facility/patient/:abhaId`**

```
Purpose:  Load patient identity to show in the discharge form header.
          Writes audit_log entry (tone: "warn").
Auth:     Required — role: "facility"

Response 200:
{
  "patient": {
    "abhaId":   "12345678901234",
    "fullName": "Rahul Sharma"
  }
}
```

---

## Page 6: Discharge Review (`/discharge/review`) + Submission

### Submit discharge entry

**`POST /api/discharge`**

```
Purpose:  Save the complete discharge entry. Called when doctor clicks
          "Confirm & Submit" on the review page.
Auth:     Required — role: "facility"

Request body (JSON):
{
  "patientAbhaId": "12345678901234",

  // Each clinical section is optional. Only include sections the doctor filled.

  "allergy": {                              // null/absent = section not selected
    "allergen":              "Penicillin",
    "reactionSeverity":      "Class 4 — Life-threatening (anaphylactic shock)",
    "clinicalManifestation": "Anaphylaxis",
    "epinephrineRequired":   true
  },

  "diabetes": {                             // null/absent = section not selected
    "treatmentPathway": "Insulin",
    "hba1cPercent":     8.2,
    "dkaHistory":       false
  },

  "implant": {                              // null/absent = section not selected
    "deviceName": "Medtronic Micra Pacemaker",
    "mriClass":   "MR-Conditional",
    "serialNo":   "SN-2024-449821"
  },

  "bloodThinner": {                         // null/absent = section not selected
    "drugName":      "Warfarin",
    "lastDoseAt":    "2026-08-19T22:00:00",
    "targetInr":     2.5,
    "reversalAgent": "Vitamin K"
  },

  "highRiskMed": {                          // null/absent = section not selected
    "apinchsCategory": "I — Insulin",
    "genericDrug":     "Insulin Glargine",
    "route":           "SC",
    "labMarker":       "Blood glucose, HbA1c"
  },

  "doctorNote": "Patient non-compliant with insulin for 2 weeks. Recommend dietitian referral."
}

Response 201:
{
  "dischargeId": "<ObjectId>",
  "submittedAt": "2026-08-20T08:00:00.000Z"
}

Response 400: { "error": "Validation failed", "details": { ... } }
Response 404: { "error": "Patient not found" }
```

**Server-side validation rules for POST /api/discharge:**
- `patientAbhaId` required, must exist in `patients` collection
- If an allergy section is present: all 4 fields required; `epinephrineRequired` must be boolean
- If a diabetes section is present: all 3 fields required; `hba1cPercent` must be number 3–20; `dkaHistory` must be boolean
- If an implant section is present: all 3 fields required; `mriClass` must be one of the 3 enum values
- If a bloodThinner section is present: all 4 fields required; `lastDoseAt` must be a valid date; `targetInr` must be number 1–5; `reversalAgent` must be from the enum
- If a highRiskMed section is present: all 4 fields required; `apinchsCategory` must be from the enum; `route` must be from the enum
- `doctorNote` if present: max 100 words (split on whitespace)
- At least one section must be present OR `doctorNote` must be non-empty (server decides minimum valid submission)

---

## Page 7: Patient Dashboard (`/patient`)

### Get own profile

**`GET /api/patient/me`**

```
Purpose:  Fetch logged-in patient's own profile and conditions.
          Writes audit_log entry (tone: "ok", accessType: "self").
Auth:     Required — role: "patient"

Response 200:
{
  "patient": {
    "abhaId":          "12345678901234",
    "abhaAddress":     "rahul.sharma@abdm",
    "fullName":        "Rahul Sharma",
    "bloodGroup":      "O+",
    "primaryContact":  "+91 98220 45210",
    "secondaryContact": "+91 90040 88455",
    "cardRequested":   false
  },
  "conditions": [
    { "id": "<ObjectId>", "name": "Type 2 Diabetes", "since": "2018", "notes": "Managed with Metformin" },
    { "id": "<ObjectId>", "name": "Hypertension",    "since": "2020", "notes": "On Telmisartan 40mg"   }
  ]
}
```

### Get audit log

**`GET /api/patient/me/audit-log`**

```
Purpose:  Paginated list of all accesses to this patient's record.
Auth:     Required — role: "patient"

Query params:
  page  (default: 1)
  limit (default: 20)

Response 200:
{
  "total": 3,
  "page":  1,
  "logs": [
    {
      "id":           "<ObjectId>",
      "facilityName": "City General Hospital",
      "actorName":    "Dr. A. Menon (HPID-11)",
      "dataAccessed": "Full emergency record",
      "tone":         "emergency",
      "createdAt":    "2026-08-09T14:32:00.000Z"
    }
  ]
}
```

### Add a condition

**`POST /api/patient/me/conditions`**

```
Purpose:  Add a new self-reported condition to the patient's record.
Auth:     Required — role: "patient"

Request body:
{
  "name":  "Asthma",       // required
  "since": "2015",         // optional
  "notes": "Uses inhaler"  // optional
}

Response 201:
{
  "condition": {
    "id":    "<ObjectId>",
    "name":  "Asthma",
    "since": "2015",
    "notes": "Uses inhaler"
  }
}

Response 400: { "error": "Condition name is required" }
```

### Remove a condition

**`DELETE /api/patient/me/conditions/:conditionId`**

```
Purpose:  Remove a condition by its ID.
Auth:     Required — role: "patient"

Response 200: { "deleted": true }
Response 404: { "error": "Condition not found" }
```

### Update emergency contacts

**`PUT /api/patient/me/emergency-contacts`**

```
Purpose:  Update primary and/or secondary emergency contact numbers.
Auth:     Required — role: "patient"

Request body:
{
  "primaryContact":   "+91 98220 45210",
  "secondaryContact": "+91 90040 88455"
}

Response 200:
{
  "primaryContact":   "+91 98220 45210",
  "secondaryContact": "+91 90040 88455"
}

Response 400: { "error": "At least one contact is required" }
```

### Request replacement ABHA card

**`POST /api/patient/me/request-card`**

```
Purpose:  Mark that the patient has requested a physical replacement card.
Auth:     Required — role: "patient"

Request body: (empty)

Response 200:
{
  "cardRequested":   true,
  "cardRequestedAt": "2026-08-20T10:00:00.000Z"
}

Response 409: { "error": "Card replacement already requested" }
```

---

## Page 8: Create ABHA (`/create-abha`)

### Step 1 → Step 2: Send OTP

**`POST /api/abha/send-otp`**

```
Purpose:  Hash Aadhaar (SHA-256), call NHA sandbox to generate OTP,
          store hashed OTP in abha_registrations.
Auth:     None (public)

Request body:
{
  "aadhaarNumber": "123456789012",   // 12 digits — hashed server-side immediately
  "mobileNumber":  "+919822045210",
  "consentGiven":  true
}

Response 200:
{
  "registrationId": "<ObjectId>",   // used in subsequent steps
  "otpSentTo":      "+91 9822XXXXXX"  // partially masked for display
}

Response 400: { "error": "Invalid Aadhaar format" }
Response 422: { "error": "Consent is required" }
```

### Step 2 → Step 3: Verify OTP

**`POST /api/abha/verify-otp`**

```
Purpose:  Compare submitted OTP against stored hash; advance registration status.
Auth:     None (public)

Request body:
{
  "registrationId": "<ObjectId>",
  "otp":            "123456"
}

Response 200:
{
  "registrationId": "<ObjectId>",
  "status":         "otp_verified"
}

Response 400: { "error": "Invalid OTP" }
Response 410: { "error": "OTP has expired" }
Response 429: { "error": "Too many attempts — registration locked" }
```

### Step 3 → Step 4: Save profile and create ABHA

**`POST /api/abha/create`**

```
Purpose:  Save the manually entered medical profile; finalize the ABHA;
          create the patient document.
Auth:     None (public — guarded by registrationId + otp_verified status)

Request body:
{
  "registrationId":  "<ObjectId>",

  // Required profile fields
  "fullName":        "Rahul Sharma",
  "dob":             "1983-06-14",
  "gender":          "Male",
  "address":         "Kothrud, Pune, MH 411038",
  "bloodGroup":      "O+",
  "abhaHandle":      "rahul.sharma",   // handle before @abdm

  // Optional profile fields
  "weight_kg":         72,
  "height_cm":         176,
  "emergencyContact":  "+919822045210"
}

Response 201:
{
  "abhaId":      "12345678901234",
  "abhaAddress": "rahul.sharma@abdm",
  "fullName":    "Rahul Sharma",
  "bloodGroup":  "O+",
  "token":       "<jwt with role='patient'>"   // logs patient in immediately
}

Response 400: { "error": "Validation failed", "details": { ... } }
Response 409: { "error": "ABHA address already taken" }
Response 422: { "error": "Registration not in otp_verified state" }
```

### Check ABHA address availability

**`GET /api/abha/check-address`**

```
Purpose:  Live check whether an ABHA handle is already registered.
          Called while user types in the handle field (Step 3).
Auth:     None (public)

Query param: handle  e.g. ?handle=rahul.sharma

Response 200:
{
  "available": true   // or false
}
```

---

## Page 9: Forgot Access (`/forgot-access`)

### Step 1: Send recovery OTP

**`POST /api/auth/patient/forgot`**

```
Purpose:  Look up patient by mobile number or ABHA address;
          send OTP to their registered mobile.
Auth:     None (public)

Request body:
{
  "method":     "mobile",                 // "mobile" | "abha"
  "identifier": "+919822045210"           // or "rahul.sharma@abdm"
}

Response 200:
{
  "sessionId":  "<ObjectId>",            // otp_sessions _id
  "otpSentTo":  "+91 9822XXXXXX"         // partially masked
}

Response 404: { "error": "No account found for that identifier" }
Response 429: { "error": "Too many requests — wait before trying again" }
```

### Step 2: Verify recovery OTP

**`POST /api/auth/patient/verify-otp`**

```
Purpose:  Validate the recovery OTP; mark session as verified.
Auth:     None (public)

Request body:
{
  "sessionId": "<ObjectId>",
  "otp":       "123456"
}

Response 200:
{
  "sessionId": "<ObjectId>",
  "verified":  true
}

Response 400: { "error": "Invalid OTP" }
Response 410: { "error": "OTP has expired" }
Response 429: { "error": "Too many failed attempts" }
```

### Step 3: Reset password

**`POST /api/auth/patient/reset-password`**

```
Purpose:  Set a new password after OTP has been verified.
          Invalidates all existing JWT sessions for this patient.
Auth:     None (guarded by sessionId + verified=true)

Request body:
{
  "sessionId":       "<ObjectId>",
  "newPassword":     "NewSecure@123",
  "confirmPassword": "NewSecure@123"
}

Response 200:
{
  "reset": true,
  "message": "Password updated — all sessions signed out."
}

Response 400: { "error": "Passwords do not match" }
Response 400: { "error": "Password must be at least 8 characters" }
Response 422: { "error": "OTP not verified for this session" }
Response 410: { "error": "Reset session has expired" }
```

---

---

# SECTION 3 — COMPLETE ROUTE TABLE

| Method | Path | Auth role | Purpose |
|---|---|---|---|
| POST | `/api/auth/patient/login` | public | Patient portal login |
| POST | `/api/auth/staff/login` | public | Staff HPID + PIN login |
| POST | `/api/auth/facility/login` | public | Facility HFR + EMP login |
| POST | `/api/auth/patient/forgot` | public | Send recovery OTP |
| POST | `/api/auth/patient/verify-otp` | public | Verify recovery OTP |
| POST | `/api/auth/patient/reset-password` | public | Reset patient password |
| POST | `/api/abha/send-otp` | public | Start ABHA registration — send OTP |
| POST | `/api/abha/verify-otp` | public | Verify ABHA registration OTP |
| POST | `/api/abha/create` | public | Finalize ABHA — create patient |
| GET | `/api/abha/check-address` | public | Check ABHA handle availability |
| GET | `/api/emergency/patient/:abhaId` | staff | Read emergency patient record |
| POST | `/api/emergency/patient/:abhaId/notify-family` | staff | Trigger family SMS + call |
| POST | `/api/auth/facility/login` | public | Facility auth |
| GET | `/api/facility/patient/:abhaId` | facility | Fetch patient context for discharge form |
| POST | `/api/discharge` | facility | Submit discharge entry |
| GET | `/api/patient/me` | patient | Own profile + conditions |
| GET | `/api/patient/me/audit-log` | patient | Paginated access log |
| POST | `/api/patient/me/conditions` | patient | Add a condition |
| DELETE | `/api/patient/me/conditions/:conditionId` | patient | Remove a condition |
| PUT | `/api/patient/me/emergency-contacts` | patient | Update emergency contacts |
| POST | `/api/patient/me/request-card` | patient | Request physical ABHA card |

---

---

# SECTION 4 — FIELD ENUM REFERENCE

Quick lookup for all dropdown values in the application.

### Gender
`"Male"` · `"Female"` · `"Other"` · `"Prefer not to say"`

### Blood Group
`"A+"` · `"A-"` · `"B+"` · `"B-"` · `"AB+"` · `"AB-"` · `"O+"` · `"O-"`

### Allergy — Reaction Severity
`"Class 0 — No reaction"` · `"Class 1 — Mild (local urticaria)"` · `"Class 2 — Moderate (generalised urticaria)"` · `"Class 3 — Severe (bronchospasm, hypotension)"` · `"Class 4 — Life-threatening (anaphylactic shock)"`

### Allergy — Clinical Manifestation
`"Anaphylaxis"` · `"Hives / Urticaria"` · `"Bronchospasm"` · `"Angioedema"` · `"Contact dermatitis"` · `"Stevens-Johnson Syndrome"`

### Diabetes — Treatment Pathway
`"Insulin"` · `"Oral medication"` · `"Diet-controlled"` · `"Insulin + Oral"`

### Implant — MRI Safety Class
`"MR-Safe"` · `"MR-Conditional"` · `"MR-Unsafe"`

### Blood Thinner — Required Reversal Agent
`"Vitamin K"` · `"Andexanet alfa"` · `"Idarucizumab (Praxbind)"` · `"Protamine sulphate"` · `"None"`

### High-Risk Med — APINCHS Category
`"A — Antimicrobials"` · `"P — Potassium (electrolytes)"` · `"I — Insulin"` · `"N — Narcotics / Opioids"` · `"C — Chemotherapeutic agents"` · `"H — Heparin (anticoagulants)"` · `"S — Sedatives / Psychotropics"`

### High-Risk Med — Administration Route
`"IV"` · `"Oral"` · `"IM"` · `"SC"` · `"Topical"`

### Audit Log — Tone
`"emergency"` · `"warn"` · `"ok"`

### Audit Log — Access Type
`"emergency"` · `"discharge"` · `"self"` · `"registration"`

---

---

# SECTION 5 — SECURITY & VALIDATION RULES

| Concern | Rule |
|---|---|
| Aadhaar storage | SHA-256 hash only — never store plaintext |
| Passwords / PINs | bcrypt (rounds ≥ 12) |
| JWT secret | Min 32 random bytes, stored in env |
| JWT expiry | staff: 8 h · facility: 12 h · patient: 7 d |
| OTP expiry | 10 minutes (TTL index on `expiresAt`) |
| OTP brute-force | Lock after 5 failed attempts; return 429 |
| Rate limiting | Auth routes: 5 requests / 15 min per IP |
| ABHA handle regex | `/^[a-z0-9._]+$/` min 3 chars |
| HPID format | `HPID-\d{2}-\d{4}-\d{4}-\d{4}` |
| HFR ID format | `IN-HFR-\d{4}-\d{4}` |
| Employee ID format | `EMP-\d{6}` |
| Doctor note | Max 100 words — validate server-side (split on `\s+`) |
| HbA1c range | 3.0 – 20.0 (numeric, 1 decimal) |
| Target INR range | 1.0 – 5.0 (numeric, 1 decimal) |
| CORS | Restrict to `CLIENT_ORIGIN` — no wildcard in production |
| Audit log | Every read of patient data must write an audit entry |
