# Lo-fi Wireframe Set — Golden Hour (separate `/wireframes` routes)

## Context
The hi-fi clinical app (teal/red, react-router) is complete and must stay intact. The user now wants a
**separate low-fidelity, monochrome-grayscale wireframe set** of the same screens for layout review —
whites, light/dark grays, black only; placeholder text ("Label", "Title", lorem lines); images/QR/icons
shown as a box with an "X"; structure over aesthetics. These live at new `/wireframes/...` routes with a
browsable index. No existing page, route, token, or component is modified.

## Approach
Add a self-contained lo-fi module. All grayscale styling uses Tailwind's built-in neutral utilities
(`bg-white`, `bg-neutral-100/200/300`, `border-neutral-300/400`, `text-neutral-500/700/900`,
`bg-black`) — deliberately NOT the app's teal/emergency theme tokens, keeping the two systems separate.

### New primitives — `src/components/wire.tsx`
Small grayscale wireframe atoms reused across all screens:
- `WireFrame({title, children})` — page shell: top bar with "‹ All wireframes" link + screen title.
- `WireBox({label, h})` — bordered gray rectangle placeholder (generic block).
- `WireImage({label})` — box with a diagonal **X** (SVG cross) for photos/QR/icons/scanner.
- `WireInput({label})` — label line + empty bordered input rectangle.
- `WireLine({w})` — solid gray bar standing in for a text line (placeholder copy).
- `WireButton({label, solid})` — outlined (secondary) or filled dark-gray/black (primary) button.
- `WireOtp()` — row of 6 square segmented boxes.
- `WireCheckbox({label})` — square + placeholder line.
- `WireToggle()` / `WireDropdown({label})` — toggle switch and select placeholder.

### Wireframe pages — `src/pages/wireframes/`
One component per screen, composed from the primitives, matching the requested structure:
- `WfIndex.tsx` — index/gallery listing all wireframes as thumbnails/links (the `/wireframes` landing).
- `WfLanding.tsx` (P1) — split: left scanner `WireImage` + 14-digit `WireInput`; right login card + "Create ABHA" `WireButton`.
- `WfCreateAbha.tsx` (P1A) — one page showing all 4 steps stacked (Consent+ID w/ toggle & checkbox, OTP row + mobile, Profile card w/ X-photo + suffixed input, Outcome A card+QR / Outcome B dark alert banner).
- `WfStaffAuth.tsx` (P2) — centered card: ID input, segmented PIN, bottom consent-log banner.
- `WfEmergencyDashboard.tsx` (P3) — dense `h-screen`/`overflow-hidden` grid: Identity, Blood Group (oversized placeholder text), Allergies, Medications cards + large black "Notify Family" button.
- `WfFacilityAuth.tsx` (P4A) — centered card: Facility ID, Staff ID, Password inputs + restricted-access alert box above the button.
- `WfDischarge.tsx` (P4) — scrollable form: repeated input/dropdown rows + dashed-border upload zone.
- `WfPatientDashboard.tsx` (P5) — table/list placeholder for access logs, settings inputs, replacement-card CTA.

### Routing — `src/routes.tsx`
Add routes only (existing entries untouched):
`/wireframes` → WfIndex, plus `/wireframes/landing`, `/create-abha`, `/staff-auth`, `/emergency`,
`/facility-auth`, `/discharge`, `/patient` (namespaced under `/wireframes/...`). Optionally add a small
"View lo-fi wireframes" text link on the hi-fi landing footer for discoverability (non-destructive).

## Constraints
- Grayscale only — no teal/red, no `create_make_theme`, no font changes (lo-fi can use the existing sans; headings stay plain).
- Placeholder content only; no realistic names/data.
- Reuse `WireImage`'s X convention for every image, QR, icon, and scanner viewport.
- P3 wireframe must still fit one screen height with no scroll.

## Verification
- `pnpm build` succeeds.
- Visit `/wireframes`, click through each screen; confirm monochrome only, X-boxes for imagery, and that P3 has no scrollbar at ~1280–1440px.
- Confirm all original hi-fi routes (`/`, `/emergency/dashboard`, etc.) still render unchanged.

---

# (Prior) Golden Hour — Medical Emergency Web App (5-page wireframe build)

## Context
The user wants a high-fidelity, accessible 5-page wireframe prototype for "Golden Hour," a medical
emergency web application. It serves two audiences: emergency responders (paramedics, doctors) who
need speed, high contrast, and absolute clarity, and civilian patients who need a friendly standard
portal. The current repo is a clean Vite + React 19 + Tailwind v4 scaffold — `src/App.tsx` is only a
placeholder dot-grid background, there are no components, and react-router is not installed.

Decisions confirmed with the user:
- **Navigation:** multi-route app using react-router (Data mode).
- **Visual tone:** clinical & calm — clean whites, medical teal/blue as primary, red reserved
  strictly for true emergency actions (Notify Family, emergency scan CTA).

## Aesthetic direction
Before writing UI, invoke `make:aesthetic-stance` and call `create_make_theme` (full-page brief) with
a 1–2 sentence request describing a calm clinical medical system with a decisive emergency mode.
Anchor the theme in `src/index.css` via Tailwind v4 `@theme` tokens:
- Neutrals: near-white app background, soft gray card borders, high-contrast slate text.
- Primary: medical teal/blue (used for standard portal, links, primary buttons).
- Emergency: a single saturated red used only for emergency scan, HPID access, and Notify Family.
- Typography: a clear humanist sans (e.g. Inter/Instrument Sans) plus a slightly tighter display face
  for headings — wired via Google Fonts `@import` at the very top of `src/index.css`.
- Enforce WCAG AA contrast; large hit targets; visible focus rings for accessibility.

## Structure to create
Install `react-router`, then follow the skill's Data-mode pattern.

- `src/main.tsx` — keep; still imports `index.css` and mounts `App`.
- `src/App.tsx` — replace placeholder with `<RouterProvider router={router} />`.
- `src/routes.tsx` — `createBrowserRouter` with routes:
  - `/` → LandingPage (Page 1)
  - `/emergency/auth` → StaffAuth (Page 2)
  - `/emergency/dashboard` → EmergencyDashboard (Page 3)
  - `/discharge` → DischargeEntry (Page 4)
  - `/patient` → PatientDashboard (Page 5)
  - `*` → NotFound
  - Optional `Root` layout wrapper with `<Outlet/>` (minimal shell; emergency screens may opt out of chrome).
- `src/index.css` — font `@import` + `@theme` tokens + global base.

### Shared building blocks (`src/components/`)
Small reusable primitives to keep pages consistent (build bespoke, no design-system dependency exists):
- `Card.tsx` — titled card container used across dashboards/forms.
- `Button.tsx` — variants: `primary` (teal), `emergency` (red), `ghost`.
- `Field.tsx` / `PinInput.tsx` — labeled text input, dropdown/select, segmented PIN input.
- `ConsentBanner.tsx` — the persistent "access is being logged" banner.
- `Logo.tsx` — small Golden Hour wordmark/mark.

### Pages (`src/pages/`)
1. **LandingPage.tsx** — split layout. Primary visual: large high-contrast **emergency scanner** panel
   (framed scan viewport + "Scan ABHA / QR" CTA) with a manual **14-digit ABHA ID** input (grouped/
   masked, validates length). Secondary, visually distinct **standard login portal** card for patients
   and admins. Scanner routes to `/emergency/auth`; standard login routes to `/patient`.
2. **StaffAuth.tsx** — rapid secure entry: **HPID** field + **rapid PIN** (segmented PinInput).
   Persistent high-visibility `ConsentBanner` stating access is logged for emergency consent.
   Submit → `/emergency/dashboard`.
3. **EmergencyDashboard.tsx** — **single screen, no scroll** (use `h-screen` grid, `overflow-hidden`,
   dense responsive grid). Distinct cards: **Patient Identity**, **Blood Group** (oversized, glanceable),
   clinician-verified **Severe Allergies** (flagged/verified badges), **Current Medications**.
   Prominent unmistakable red **Notify Family** button.
4. **DischargeEntry.tsx** — comprehensive form for records officers/doctors: text fields + dropdowns for
   **newly discovered allergies** and **prescription changes** (add-row pattern), plus an **Upload**
   module (drag/drop styled dropzone + file input) for the discharge summary. Save/submit actions.
5. **PatientDashboard.tsx** — standard portal (assume post-OTP). **Access Logs** section: list showing
   which hospital accessed emergency data, when, and what was viewed. **Account settings** with form
   fields to update emergency contact numbers. Primary CTA button to **request a replacement physical card**.

## Accessibility & emergency-clarity requirements
- No horizontal or vertical scroll on Page 3 at common desktop sizes.
- Semantic landmarks (`header`/`main`/`nav`), labeled inputs, `aria-live` on the consent banner.
- Red used only for emergency semantics; teal for everything routine.
- Keyboard-navigable, visible focus states, ≥44px touch targets on responder actions.

## Verification
- `pnpm install` picks up `react-router`; Vite dev server auto-reloads (already running on `$PORT`).
- Manually walk all five routes and the flows: scanner + ABHA input → auth → dashboard → (from landing)
  standard login → patient dashboard; discharge form at `/discharge`.
- Confirm Page 3 shows zero scrollbars at 1280–1440px width.
- Use `make-verify-bootstrap`/deploy-preview to smoke-test the running app; check `figma logs` only if a
  concrete error appears.
