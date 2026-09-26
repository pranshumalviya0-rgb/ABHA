# Plan: Golden Hour — Backend Implementation Document

## Context
The Golden Hour frontend is fully built (React 19 + Vite + Tailwind v4 + react-router Data mode). All pages are live with hardcoded mock data and no real API calls. The user wants a comprehensive, downloadable backend specification document that a developer can pick up and implement from scratch, covering every feature surfaced by the UI.

## What will be created
A single Markdown file at:
```
/workspaces/default/code/BACKEND_SPEC.md
```
This file will be committed alongside the source code and will be downloadable from the Figma Make preview or the project repository.

## Document outline (all sections to be written in full)

1. **Project Overview** — mission, audiences (responders vs patients), regulatory context (ABDM/NHA)
2. **Tech Stack Recommendation** — Node.js/TypeScript + Express or Fastify, PostgreSQL + Redis, S3-compatible storage, BullMQ for async jobs, full rationale
3. **Architecture Diagram (ASCII)** — client → API gateway → services → DB/cache/storage
4. **Domain Data Models** — every entity (Patient, ABHA, StaffCredential, Facility, Allergy, Medication, EmergencyContact, Discharge, AccessLog, PhysicalCardRequest) with field names, types, constraints, and enums matching the frontend exactly
5. **API Endpoints** — every route needed, grouped by domain:
   - Auth: staff HPID+PIN, facility HFR+EMP+password, patient mobile/ABHA+password
   - Patient record: read emergency record, update contacts, request replacement card
   - ABHA registration: initiate (Aadhaar/DL), send OTP, verify OTP, create address
   - Emergency actions: fetch full record, notify family (SMS+call)
   - Discharge: submit form + PDF upload, retrieve discharge summary
   - Audit log: write on access, read by patient
   - File upload: PDF discharge summary (multipart, 20 MB max, virus scan)
6. **Authentication & Authorization** — JWT + short-lived sessions for each actor type, RBAC matrix (staff / facility / patient / emergency-responder), consent model for data access
7. **ABDM Integration** — how to call NHA's Health ID APIs for Aadhaar OTP flow and DL manual enrollment, sandbox vs production endpoints
8. **Notifications** — SMS gateway (Twilio/MSG91) + call trigger for family notification; webhook structure for delivery receipts
9. **Audit & Consent Trail** — every access must be logged with actor, scope, timestamp, tone (emergency/warn/ok) to power the patient's access log view
10. **File Handling** — multipart upload flow, S3 pre-signed URLs, PDF validation, 20 MB size enforcement, virus scanning
11. **Database Schema (SQL DDL)** — CREATE TABLE statements for every entity with indexes and foreign keys
12. **Environment Variables** — full `.env.example` with every key needed
13. **Project Structure** — recommended folder layout for the backend repo
14. **Development Setup** — step-by-step to run locally (Docker Compose for Postgres + Redis, migrations, seeding mock data matching the frontend's hardcoded values)
15. **Security Checklist** — OWASP Top 10 mitigations, PHI/PII handling, data at rest encryption, rate limiting per endpoint
16. **Deployment** — Docker multi-stage build, Render/Railway/AWS ECS options, CI/CD sketch

## File location and format
- Path: `/workspaces/default/code/BACKEND_SPEC.md`
- Format: GitHub-flavored Markdown, downloadable as-is
- No code is changed; only this new documentation file is created
