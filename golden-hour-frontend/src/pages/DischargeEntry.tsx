import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router"
import { Logo, Card, Button, Badge } from "../components/ui"
import { facilityApi, getTargetAbhaId, getAuthUser } from "../services/api"

/* ── shared field primitives ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
      {children}
    </span>
  )
}

function FField({
  label,
  hint,
  error,
  ...rest
}: {
  label: string
  hint?: string
  error?: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <SectionLabel>{label}</SectionLabel>
      <input
        className={`min-h-[44px] rounded-md border bg-surface px-3.5 text-[15px] text-ink placeholder:text-ink-soft/50 focus:outline-none ${
          error
            ? "border-emergency-400 focus:border-emergency-500"
            : "border-hairline focus:border-teal-500"
        }`}
        {...rest}
      />
      {error ? (
        <span className="font-mono text-[11px] text-emergency-600">{error}</span>
      ) : hint ? (
        <span className="text-[12px] text-ink-soft">{hint}</span>
      ) : null}
    </label>
  )
}

function FSelect({
  label,
  error,
  value,
  onChange,
  children,
}: {
  label: string
  error?: string
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <SectionLabel>{label}</SectionLabel>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`min-h-[44px] rounded-md border bg-surface px-3 text-[15px] text-ink focus:outline-none ${
          error
            ? "border-emergency-400 focus:border-emergency-500"
            : "border-hairline focus:border-teal-500"
        }`}
      >
        {children}
      </select>
      {error && (
        <span className="font-mono text-[11px] text-emergency-600">{error}</span>
      )}
    </label>
  )
}

/* ── NEW: Multi-select chip field ── */
function FMultiSelect({
  label,
  options,
  value,
  onChange,
  error,
  hint,
}: {
  label: string
  options: string[]
  value: string[]
  onChange: (v: string[]) => void
  error?: string
  hint?: string
}) {
  const toggle = (opt: string) => {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt))
    else onChange([...value, opt])
  }

  return (
    <div className="flex flex-col gap-1.5">
      <SectionLabel>{label}</SectionLabel>
      <div
        className={`flex min-h-[44px] flex-wrap gap-2 rounded-md border bg-surface px-3.5 py-2.5 ${
          error ? "border-emergency-400" : "border-hairline"
        }`}
      >
        {options.map((opt) => {
          const selected = value.includes(opt)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors ${
                selected
                  ? "border-emergency-500 bg-emergency-500 text-white"
                  : "border-hairline bg-canvas text-ink-soft hover:border-emergency-300 hover:bg-emergency-50 hover:text-emergency-700"
              }`}
            >
              {opt}
            </button>
          )
        })}
      </div>
      {error ? (
        <span className="font-mono text-[11px] text-emergency-600">{error}</span>
      ) : hint ? (
        <span className="text-[12px] text-ink-soft">{hint}</span>
      ) : null}
    </div>
  )
}

function FToggle({
  label,
  value,
  onChange,
  error,
}: {
  label: string
  value: boolean | null
  onChange: (v: boolean) => void
  error?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <SectionLabel>{label}</SectionLabel>
      <div
        className={`flex overflow-hidden rounded-md border ${
          error ? "border-emergency-400" : "border-hairline"
        }`}
      >
        {(["Yes", "No"] as const).map((opt) => {
          const isYes = opt === "Yes"
          const active = value === isYes
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(isYes)}
              className={`flex-1 py-2.5 text-[14px] font-semibold transition-colors ${
                active
                  ? isYes
                    ? "bg-teal-500 text-white"
                    : "bg-emergency-500 text-white"
                  : "bg-surface text-ink-soft hover:bg-canvas"
              }`}
            >
              {opt}
            </button>
          )
        })}
      </div>
      {error && (
        <span className="font-mono text-[11px] text-emergency-600">{error}</span>
      )}
    </div>
  )
}

/* ── checkbox section wrapper ── */
function SectionToggle({
  label,
  sublabel,
  checked,
  onChange,
  accent,
  hasErrors,
  children,
}: {
  label: string
  sublabel: string
  checked: boolean
  onChange: (v: boolean) => void
  accent: "emergency" | "teal" | "warn"
  hasErrors?: boolean
  children: React.ReactNode
}) {
  const accentBar =
    accent === "emergency"
      ? "before:bg-emergency-500"
      : accent === "teal"
        ? "before:bg-teal-500"
        : "before:bg-[#e6a817]"

  const checkColor =
    accent === "emergency"
      ? "accent-emergency-500"
      : accent === "teal"
        ? "accent-teal-500"
        : "accent-[#e6a817]"

  return (
    <section
      className={`relative overflow-hidden rounded-md border bg-surface transition-colors ${
        checked && hasErrors
          ? "border-emergency-300"
          : checked
            ? "border-teal-200"
            : "border-hairline"
      } before:absolute before:left-0 before:top-0 before:h-full before:w-1 ${accentBar}`}
    >
      <label className="flex cursor-pointer items-start gap-4 px-5 py-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className={`mt-0.5 h-5 w-5 shrink-0 rounded ${checkColor}`}
        />
        <div className="flex-1">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            {label}
          </p>
          <p className="mt-0.5 text-[13px] text-ink-soft">{sublabel}</p>
        </div>
        <span
          className={`mt-0.5 font-mono text-[11px] font-semibold transition-colors ${
            checked && hasErrors
              ? "text-emergency-600"
              : checked
                ? "text-teal-600"
                : "text-ink-soft"
          }`}
        >
          {checked && hasErrors ? "Incomplete" : checked ? "Filling" : "Not applicable"}
        </span>
      </label>

      {checked && (
        <div className="border-t border-hairline bg-canvas/40 px-5 py-4">
          <div className="grid gap-4 sm:grid-cols-2">{children}</div>
        </div>
      )}
    </section>
  )
}

/* ══════════════════════════════════════════════════ */

const CLINICAL_MANIFESTATION_OPTIONS = [
  "Anaphylaxis",
  "Angioedema",
  "Bronchospasm",
  "Hives / Urticaria",
  "Contact Dermatitis",
  "Stevens-Johnson Syndrome",
]

export default function DischargeEntry() {
  const navigate = useNavigate()
  const location = useLocation()
  const navState = location.state
  const savedDraft = (() => {
    try {
      const raw = sessionStorage.getItem("discharge_draft")
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })()

  const initial = navState || savedDraft || {}

  const [attempted, setAttempted] = useState(false)
  const [patientName, setPatientName] = useState("Patient")
  const [draftStatus, setDraftStatus] = useState<string | null>(null)
  const facility = getAuthUser()
  const abhaId = getTargetAbhaId()

  useEffect(() => {
    async function loadPatient() {
      const res = await facilityApi.getPatientContext(abhaId)
      if (res.ok && res.data?.patient) {
        setPatientName(res.data.patient.fullName)
      }
    }
    loadPatient()
  }, [abhaId])

  /* section toggles — reset attempted on every toggle so newly
     expanded sections never open with pre-lit error states */
  function toggle(setter: (v: boolean) => void, value: boolean) {
    setter(value)
    setAttempted(false)
  }

  const [showAllergy, setShowAllergy] = useState<boolean>(initial.showAllergy || false)
  const [showDiabetes, setShowDiabetes] = useState<boolean>(initial.showDiabetes || false)
  const [showImplant, setShowImplant] = useState<boolean>(initial.showImplant || false)
  const [showBloodThinner, setShowBloodThinner] = useState<boolean>(initial.showBloodThinner || false)
  const [showHighRisk, setShowHighRisk] = useState<boolean>(initial.showHighRisk || false)

  /* 1. Severe Allergies — updated with new fields from spec */
  const [allergenCategory, setAllergenCategory] = useState<string>(initial.allergenCategory || "")
  const [allergen, setAllergen] = useState<string>(initial.allergen || "")
  const [reactionClassification, setReactionClassification] = useState<string>(initial.reactionClassification || "")
  const [reactionSeverity, setReactionSeverity] = useState<string>(initial.reactionSeverity || "")
  const [clinicalManifestations, setClinicalManifestations] = useState<string[]>(initial.clinicalManifestations || [])
  const [epinephrine, setEpinephrine] = useState<boolean | null>(initial.epinephrine ?? null)

  /* 2. Diabetes Mellitus */
  const [diabetesClassification, setDiabetesClassification] = useState<string>(initial.diabetesClassification || "")
  const [treatmentPathway, setTreatmentPathway] = useState<string>(initial.treatmentPathway || "")
  const [hba1c, setHba1c] = useState<string>(initial.hba1c || "")
  const [dkaHistory, setDkaHistory] = useState<boolean | null>(initial.dkaHistory ?? null)

  /* 3. Critical Medical Implants */
  const [implantCategory, setImplantCategory] = useState<string>(initial.implantCategory || "")
  const [deviceName, setDeviceName] = useState<string>(initial.deviceName || "")
  const [mriClass, setMriClass] = useState<string>(initial.mriClass || "")
  const [conditionalParams, setConditionalParams] = useState<string>(initial.conditionalParams || "")
  const [serialNo, setSerialNo] = useState<string>(initial.serialNo || "")

  /* 4. Blood Thinners */
  const [medicationClass, setMedicationClass] = useState<string>(initial.medicationClass || "")
  const [drugName, setDrugName] = useState<string>(initial.drugName || "")
  const [lastDose, setLastDose] = useState<string>(initial.lastDose || "")
  const [targetInr, setTargetInr] = useState<string>(initial.targetInr || "")
  const [reversalAgent, setReversalAgent] = useState<string>(initial.reversalAgent || "")

  /* 5. High-Risk Medications */
  const [apinchsCategory, setApinchsCategory] = useState<string>(initial.apinchsCategory || "")
  const [genericDrug, setGenericDrug] = useState<string>(initial.genericDrug || "")
  const [drugDosage, setDrugDosage] = useState<string>(initial.drugDosage || "")
  const [drugRoute, setDrugRoute] = useState<string>(initial.drugRoute || "")
  const [labMarker, setLabMarker] = useState<string>(initial.labMarker || "")

  /* Doctor note */
  const [note, setNote] = useState<string>(initial.note || "")
  const noteWords = note.trim() === "" ? 0 : note.trim().split(/\s+/).length

  function handleNoteChange(val: string) {
    const words = val.trim().split(/\s+/)
    if (val.trim() === "" || words.length <= 100) setNote(val)
    else setNote(words.slice(0, 100).join(" "))
  }

  function getFormData() {
    return {
      showAllergy,
      allergenCategory,
      allergen,
      reactionClassification,
      reactionSeverity,
      clinicalManifestations,
      epinephrine,
      showDiabetes,
      diabetesClassification,
      treatmentPathway,
      hba1c,
      dkaHistory,
      showImplant,
      implantCategory,
      deviceName,
      mriClass,
      conditionalParams,
      serialNo,
      showBloodThinner,
      medicationClass,
      drugName,
      lastDose,
      targetInr,
      reversalAgent,
      showHighRisk,
      apinchsCategory,
      genericDrug,
      drugDosage,
      drugRoute,
      labMarker,
      note,
    }
  }

  function handleSaveDraft() {
    const data = getFormData()
    sessionStorage.setItem("discharge_draft", JSON.stringify(data))
    setDraftStatus("Draft saved locally")
    setTimeout(() => setDraftStatus(null), 3500)
  }

  function handleClearDraft() {
    if (window.confirm("Are you sure you want to clear all entered details in this form?")) {
      sessionStorage.removeItem("discharge_draft")
      setShowAllergy(false); setAllergenCategory(""); setAllergen(""); setReactionClassification(""); setReactionSeverity(""); setClinicalManifestations([]); setEpinephrine(null);
      setShowDiabetes(false); setDiabetesClassification(""); setTreatmentPathway(""); setHba1c(""); setDkaHistory(null);
      setShowImplant(false); setImplantCategory(""); setDeviceName(""); setMriClass(""); setConditionalParams(""); setSerialNo("");
      setShowBloodThinner(false); setMedicationClass(""); setDrugName(""); setLastDose(""); setTargetInr(""); setReversalAgent("");
      setShowHighRisk(false); setApinchsCategory(""); setGenericDrug(""); setDrugDosage(""); setDrugRoute(""); setLabMarker("");
      setNote("")
      setAttempted(false)
      setDraftStatus("Draft cleared")
      setTimeout(() => setDraftStatus(null), 2500)
    }
  }

  /* ── validation ── */
  const req = (v: string) => (!v.trim() ? "Required" : "")
  const reqBool = (v: boolean | null) => (v === null ? "Required" : "")

  const allergyErrors = {
    allergenCategory: req(allergenCategory),
    allergen: req(allergen),
    reactionClassification: req(reactionClassification),
    reactionSeverity: req(reactionSeverity),
    clinicalManifestations: clinicalManifestations.length === 0 ? "Required" : "",
    epinephrine: reqBool(epinephrine),
  }
  const diabetesErrors = {
    diabetesClassification: req(diabetesClassification),
    treatmentPathway: req(treatmentPathway),
    hba1c: req(hba1c),
    dkaHistory: reqBool(dkaHistory),
  }
  const implantErrors = {
    implantCategory: req(implantCategory),
    deviceName: req(deviceName),
    mriClass: req(mriClass),
    conditionalParams: req(conditionalParams),
    serialNo: req(serialNo),
  }
  const bloodThinnerErrors = {
    medicationClass: req(medicationClass),
    drugName: req(drugName),
    lastDose: req(lastDose),
    targetInr: req(targetInr),
    reversalAgent: req(reversalAgent),
  }
  const highRiskErrors = {
    apinchsCategory: req(apinchsCategory),
    genericDrug: req(genericDrug),
    drugDosage: req(drugDosage),
    drugRoute: req(drugRoute),
    labMarker: req(labMarker),
  }

  const hasAllergyErr = showAllergy && Object.values(allergyErrors).some(Boolean)
  const hasDiabetesErr = showDiabetes && Object.values(diabetesErrors).some(Boolean)
  const hasImplantErr = showImplant && Object.values(implantErrors).some(Boolean)
  const hasBloodThinnerErr = showBloodThinner && Object.values(bloodThinnerErrors).some(Boolean)
  const hasHighRiskErr = showHighRisk && Object.values(highRiskErrors).some(Boolean)
  const hasAnyError =
    hasAllergyErr || hasDiabetesErr || hasImplantErr || hasBloodThinnerErr || hasHighRiskErr

  function handleReview() {
    setAttempted(true)
    if (hasAnyError) return
    const data = getFormData()
    sessionStorage.setItem("discharge_draft", JSON.stringify(data))
    navigate("/discharge/review", {
      state: data,
    })
  }

  const e = attempted // shorthand: only show errors after first attempt

  return (
    <div className="min-h-screen">
      <header className="border-b border-hairline bg-surface">
        <div className="mx-auto flex max-w-[800px] items-center justify-between px-6 py-4">
          <Logo />
          <span className="font-mono text-[12px] text-ink-soft">
            Records Officer · {facility?.facilityName || "City General Hospital"}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[800px] px-6 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-600">
              Post-Care · Discharge Entry
            </span>
            <h1 className="mt-1 font-display text-[26px] font-bold tracking-tight">
              Update Patient Record
            </h1>
            <p className="mt-1 text-[14px] text-ink-soft">
              Patient: {patientName} · CliniKey {abhaId} · Admitted 2026-08-09
            </p>
          </div>
          <Badge tone="warn">Draft · not yet submitted</Badge>
        </div>

        <div className="mb-6 flex gap-3 rounded-md border border-[#d4eaf7] bg-[#eef6fc] px-4 py-3 text-[13px] leading-snug text-[#1a5a7a]">
          <span className="mt-0.5 shrink-0 text-[15px]">ℹ</span>
          <span>
            Tick the checkbox for each condition that applies to this patient. All fields within a
            checked section are required before you can proceed.
          </span>
        </div>

        <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>

          {/* ─── 1. Severe Allergies ─── */}
          <SectionToggle
            label="1. Severe Allergies"
            sublabel="Type I (Immediate/Anaphylactic) and Type IV (Delayed/Cell-Mediated)"
            checked={showAllergy}
            onChange={(v) => toggle(setShowAllergy, v)}
            accent="emergency"
            hasErrors={e && hasAllergyErr}
          >
            {/* Row 1: Allergen Category + Specific Allergen */}
            <FSelect
              label="Allergen Category *"
              value={allergenCategory}
              onChange={setAllergenCategory}
              error={e ? allergyErrors.allergenCategory : ""}
            >
              <option value="">Select category</option>
              <option value="Medication">Medication</option>
              <option value="Food">Food</option>
              <option value="Environmental">Environmental</option>
              <option value="Venom / Insect">Venom / Insect</option>
            </FSelect>

            <FField
              label="Specific Allergen *"
              placeholder="e.g. Penicillin, Latex, Peanut"
              value={allergen}
              onChange={(ev) => setAllergen(ev.target.value)}
              error={e ? allergyErrors.allergen : ""}
              hint={!e || !allergyErrors.allergen ? "Exact trigger — used for alert flags across all records" : ""}
            />

            {/* Row 2: Reaction Classification + Reaction Severity */}
            <FSelect
              label="Reaction Classification *"
              value={reactionClassification}
              onChange={setReactionClassification}
              error={e ? allergyErrors.reactionClassification : ""}
            >
              <option value="">Select type</option>
              <option value="Type I — Immediate Hypersensitivity (IgE-mediated)">
                Type I — Immediate Hypersensitivity (IgE-mediated)
              </option>
              <option value="Type II — Cytotoxic (Antibody-mediated)">
                Type II — Cytotoxic (Antibody-mediated)
              </option>
              <option value="Type III — Immune Complex (Serum sickness)">
                Type III — Immune Complex (Serum sickness)
              </option>
              <option value="Type IV — Delayed / Cell-Mediated (T-cell)">
                Type IV — Delayed / Cell-Mediated (T-cell)
              </option>
            </FSelect>

            <FSelect
              label="Reaction Severity (Class 0–4) *"
              value={reactionSeverity}
              onChange={setReactionSeverity}
              error={e ? allergyErrors.reactionSeverity : ""}
            >
              <option value="">Select class</option>
              <option value="Class 0 — No reaction">Class 0 — No reaction</option>
              <option value="Class 1 — Mild (local urticaria)">Class 1 — Mild (local urticaria)</option>
              <option value="Class 2 — Moderate (generalised urticaria)">
                Class 2 — Moderate (generalised urticaria)
              </option>
              <option value="Class 3 — Severe (bronchospasm, hypotension)">
                Class 3 — Severe (bronchospasm, hypotension)
              </option>
              <option value="Class 4 — Life-threatening (anaphylactic shock)">
                Class 4 — Life-threatening (anaphylactic shock)
              </option>
            </FSelect>

            {/* Row 3: Clinical Manifestation — full-width multi-select */}
            <div className="sm:col-span-2">
              <FMultiSelect
                label="Clinical Manifestation * (select all that apply)"
                options={CLINICAL_MANIFESTATION_OPTIONS}
                value={clinicalManifestations}
                onChange={setClinicalManifestations}
                error={e ? allergyErrors.clinicalManifestations : ""}
                hint={
                  !e || !allergyErrors.clinicalManifestations
                    ? "Evidence of what exactly happens to the patient during a reaction"
                    : ""
                }
              />
            </div>

            {/* Row 4: Epinephrine Required — full-width toggle */}
            <div className="sm:col-span-2">
              <FToggle
                label="Epinephrine Required? *"
                value={epinephrine}
                onChange={setEpinephrine}
                error={e ? allergyErrors.epinephrine : ""}
              />
            </div>
          </SectionToggle>

          {/* ─── 2. Diabetes Mellitus ─── */}
          <SectionToggle
            label="2. Diabetes Mellitus"
            sublabel="Type 1, Type 2, Gestational (GDM), LADA, MODY and Type 3c"
            checked={showDiabetes}
            onChange={(v) => toggle(setShowDiabetes, v)}
            accent="teal"
            hasErrors={e && hasDiabetesErr}
          >
            {/* Row 1: Diabetes Classification — full width (primary classifier) */}
            <div className="sm:col-span-2">
              <FSelect
                label="Diabetes Classification *"
                value={diabetesClassification}
                onChange={setDiabetesClassification}
                error={e ? diabetesErrors.diabetesClassification : ""}
              >
                <option value="">Select classification</option>
                <option value="Type 1 — Autoimmune, absolute insulin deficiency">
                  Type 1 — Autoimmune, absolute insulin deficiency
                </option>
                <option value="Type 2 — Insulin resistance, relative deficiency">
                  Type 2 — Insulin resistance, relative deficiency
                </option>
                <option value="GDM — Gestational (Pregnancy-induced)">
                  GDM — Gestational (Pregnancy-induced)
                </option>
                <option value="MODY — Maturity-Onset Diabetes of the Young (Genetic)">
                  MODY — Maturity-Onset Diabetes of the Young (Genetic)
                </option>
                <option value="LADA — Latent Autoimmune Diabetes in Adults">
                  LADA — Latent Autoimmune Diabetes in Adults
                </option>
                <option value="Type 3c — Pancreatogenic (cystic fibrosis / pancreatitis)">
                  Type 3c — Pancreatogenic (cystic fibrosis / pancreatitis)
                </option>
                <option value="Drug/Steroid-Induced">
                  Drug/Steroid-Induced
                </option>
              </FSelect>
            </div>

            {/* Row 2: Treatment Regimen + HbA1c */}
            <FSelect
              label="Treatment Regimen *"
              value={treatmentPathway}
              onChange={setTreatmentPathway}
              error={e ? diabetesErrors.treatmentPathway : ""}
            >
              <option value="">Select regimen</option>
              <option value="Insulin-Dependent">Insulin-Dependent</option>
              <option value="Oral Hypoglycemics">Oral Hypoglycemics</option>
              <option value="Diet-Controlled">Diet-Controlled</option>
              <option value="Insulin + Oral Hypoglycemics">Insulin + Oral Hypoglycemics</option>
            </FSelect>
            <FField
              label="Latest HbA1c Level (%) *"
              type="number"
              min="3"
              max="20"
              step="0.1"
              placeholder="e.g. 7.2"
              value={hba1c}
              onChange={(ev) => setHba1c(ev.target.value)}
              error={e ? diabetesErrors.hba1c : ""}
              hint={!e || !diabetesErrors.hba1c ? "Reference range: 4.0–5.6% (normal)" : ""}
            />

            {/* Row 3: DKA / HHS history — full width */}
            <div className="sm:col-span-2">
              <FToggle
                label="History of DKA / HHS? *"
                value={dkaHistory}
                onChange={setDkaHistory}
                error={e ? diabetesErrors.dkaHistory : ""}
              />
              {!e && (
                <p className="mt-1.5 text-[12px] text-ink-soft">
                  Flags patients at high risk for Diabetic Ketoacidosis or Hyperosmolar Hyperglycaemic State
                </p>
              )}
            </div>
          </SectionToggle>

          {/* ─── 3. Critical Medical Implants ─── */}
          <SectionToggle
            label="3. Critical Medical Implants"
            sublabel="Cardiac, Neurological, Orthopedic and Other — MRI safety governed by ASTM standards"
            checked={showImplant}
            onChange={(v) => toggle(setShowImplant, v)}
            accent="warn"
            hasErrors={e && hasImplantErr}
          >
            {/* Row 1: Implant Category — full width (primary classifier) */}
            <div className="sm:col-span-2">
              <FSelect
                label="Implant Category *"
                value={implantCategory}
                onChange={setImplantCategory}
                error={e ? implantErrors.implantCategory : ""}
              >
                <option value="">Select category</option>
                <option value="Cardiac — Pacemaker / ICD / Mechanical Heart Valve / Coronary Stent">
                  Cardiac — Pacemaker / ICD / Mechanical Heart Valve / Coronary Stent
                </option>
                <option value="Neurological — DBS / VNS / Cochlear Implant / Aneurysm Clip">
                  Neurological — DBS / VNS / Cochlear Implant / Aneurysm Clip
                </option>
                <option value="Orthopedic — Joint Replacement / Spinal Fusion Hardware">
                  Orthopedic — Joint Replacement / Spinal Fusion Hardware
                </option>
                <option value="Other — Copper IUD / Tissue Expander / Insulin Pump">
                  Other — Copper IUD / Tissue Expander / Insulin Pump
                </option>
              </FSelect>
            </div>

            {/* Row 2: Specific Device/Model + MRI Safety Class (ASTM) */}
            <FField
              label="Specific Device / Model *"
              placeholder="e.g. Medtronic Micra AV Pacemaker"
              value={deviceName}
              onChange={(ev) => setDeviceName(ev.target.value)}
              error={e ? implantErrors.deviceName : ""}
              hint={!e || !implantErrors.deviceName ? "Identifies the exact hardware inside the patient" : ""}
            />
            <FSelect
              label="MRI Safety Class (ASTM) *"
              value={mriClass}
              onChange={setMriClass}
              error={e ? implantErrors.mriClass : ""}
            >
              <option value="">Select class</option>
              <option value="MR-Safe">MR-Safe</option>
              <option value="MR-Conditional">MR-Conditional</option>
              <option value="MR-Unsafe">MR-Unsafe</option>
            </FSelect>

            {/* Row 3: Conditional Parameters + Manufacturer Serial No. */}
            <FField
              label="Conditional Parameters *"
              placeholder="e.g. Max 3T, 1.5T bore, specific SAR limits"
              value={conditionalParams}
              onChange={(ev) => setConditionalParams(ev.target.value)}
              error={e ? implantErrors.conditionalParams : ""}
              hint={!e || !implantErrors.conditionalParams ? "Rules that apply if MR-Conditional is selected" : ""}
            />
            <FField
              label="Manufacturer Serial No. *"
              placeholder="e.g. SN-2024-449821"
              value={serialNo}
              onChange={(ev) => setSerialNo(ev.target.value)}
              error={e ? implantErrors.serialNo : ""}
              hint={!e || !implantErrors.serialNo ? "Necessary for device interrogation by specialists" : ""}
            />
          </SectionToggle>

          {/* ─── 4. Blood Thinners ─── */}
          <SectionToggle
            label="4. Blood Thinners"
            sublabel="VKA, DOACs, Heparins and Antiplatelets (P2Y12 Inhibitors)"
            checked={showBloodThinner}
            onChange={(v) => toggle(setShowBloodThinner, v)}
            accent="emergency"
            hasErrors={e && hasBloodThinnerErr}
          >
            {/* Row 1: Medication Class — full width (primary classifier) */}
            <div className="sm:col-span-2">
              <FSelect
                label="Medication Class *"
                value={medicationClass}
                onChange={setMedicationClass}
                error={e ? bloodThinnerErrors.medicationClass : ""}
              >
                <option value="">Select class</option>
                <option value="VKA — Vitamin K Antagonists (Warfarin)">
                  VKA — Vitamin K Antagonists (Warfarin)
                </option>
                <option value="DOAC — Direct Oral Anticoagulants (Apixaban, Rivaroxaban, Dabigatran)">
                  DOAC — Direct Oral Anticoagulants (Apixaban, Rivaroxaban, Dabigatran)
                </option>
                <option value="Heparin — LMWH / Unfractionated (Enoxaparin)">
                  Heparin — LMWH / Unfractionated (Enoxaparin)
                </option>
                <option value="Antiplatelet — P2Y12 Inhibitors (Aspirin, Clopidogrel, Ticagrelor)">
                  Antiplatelet — P2Y12 Inhibitors (Aspirin, Clopidogrel, Ticagrelor)
                </option>
              </FSelect>
            </div>

            {/* Row 2: Generic Drug Name + Date/Time of Last Dose */}
            <FField
              label="Generic Drug Name *"
              placeholder="e.g. Warfarin, Rivaroxaban, Enoxaparin"
              value={drugName}
              onChange={(ev) => setDrugName(ev.target.value)}
              error={e ? bloodThinnerErrors.drugName : ""}
              hint={!e || !bloodThinnerErrors.drugName ? "Specific drug identification — use generic name" : ""}
            />
            <FField
              label="Date & Time of Last Dose *"
              type="datetime-local"
              value={lastDose}
              onChange={(ev) => setLastDose(ev.target.value)}
              error={e ? bloodThinnerErrors.lastDose : ""}
              hint={!e || !bloodThinnerErrors.lastDose ? "Critical — dictates if reversal agents will work" : ""}
            />

            {/* Row 3: Target INR / Renal eGFR + Specific Reversal Agent */}
            <FField
              label="Target INR / Renal eGFR *"
              type="number"
              min="0"
              max="200"
              step="0.1"
              placeholder="e.g. 2.5 (INR) or 60 (eGFR)"
              value={targetInr}
              onChange={(ev) => setTargetInr(ev.target.value)}
              error={e ? bloodThinnerErrors.targetInr : ""}
              hint={!e || !bloodThinnerErrors.targetInr ? "INR for VKA · Renal eGFR (mL/min/1.73m²) for DOACs / Heparin" : ""}
            />
            <FSelect
              label="Specific Reversal Agent? *"
              value={reversalAgent}
              onChange={setReversalAgent}
              error={e ? bloodThinnerErrors.reversalAgent : ""}
            >
              <option value="">Select agent</option>
              <option value="Vitamin K">Vitamin K</option>
              <option value="Andexanet alfa (Ondexxya)">Andexanet alfa (Ondexxya)</option>
              <option value="Praxbind (Idarucizumab)">Praxbind (Idarucizumab)</option>
              <option value="Protamine sulphate">Protamine sulphate</option>
              <option value="None">None</option>
            </FSelect>
          </SectionToggle>

          {/* ─── 5. High-Risk Medications ─── */}
          <SectionToggle
            label="5. High-Risk Medications"
            sublabel="APINCHS Framework — globally recognized high-risk medication categories"
            checked={showHighRisk}
            onChange={(v) => toggle(setShowHighRisk, v)}
            accent="teal"
            hasErrors={e && hasHighRiskErr}
          >
            <div className="sm:col-span-2">
              <p className="mb-3 text-[13px] leading-snug text-ink-soft">
                Instead of a generic list, the globally recognized APINCHS framework (utilized heavily in Australian and international hospitals) is used to categorize drugs with a high potential to cause catastrophic harm.
              </p>
            </div>

            <FSelect
              label="APINCHS Category *"
              value={apinchsCategory}
              onChange={setApinchsCategory}
              error={e ? highRiskErrors.apinchsCategory : ""}
            >
              <option value="">Select category</option>
              <option value="A — Antimicrobials/Anti-infectives">A — Antimicrobials/Anti-infectives</option>
              <option value="P — Potassium & Electrolytes">P — Potassium &amp; Electrolytes</option>
              <option value="I — Insulin">I — Insulin</option>
              <option value="N — Narcotics & Sedatives">N — Narcotics &amp; Sedatives</option>
              <option value="C — Chemotherapeutic Agents">C — Chemotherapeutic Agents</option>
              <option value="H — Heparin & Anticoagulants">H — Heparin &amp; Anticoagulants</option>
              <option value="S — Systems/Psychotropics">S — Systems/Psychotropics</option>
            </FSelect>

            <FField
              label="Generic Drug Name *"
              placeholder="e.g. Vancomycin, Insulin, Morphine"
              value={genericDrug}
              onChange={(ev) => setGenericDrug(ev.target.value)}
              error={e ? highRiskErrors.genericDrug : ""}
              hint={!e || !highRiskErrors.genericDrug ? "Exact identification." : ""}
            />

            <div className="flex flex-col gap-1.5">
              <SectionLabel>Dosage &amp; Route *</SectionLabel>
              <div className={`flex gap-2 rounded-md ${e && (highRiskErrors.drugDosage || highRiskErrors.drugRoute) ? "ring-1 ring-emergency-400" : ""}`}>
                <input
                  className={`min-h-[44px] flex-1 rounded-md border bg-surface px-3.5 text-[15px] text-ink placeholder:text-ink-soft/50 focus:outline-none ${
                    e && highRiskErrors.drugDosage
                      ? "border-emergency-400 focus:border-emergency-500"
                      : "border-hairline focus:border-teal-500"
                  }`}
                  placeholder="e.g. 1 g"
                  value={drugDosage}
                  onChange={(ev) => setDrugDosage(ev.target.value)}
                />
                <select
                  className={`min-h-[44px] rounded-md border bg-surface px-3 text-[14px] text-ink focus:outline-none ${
                    e && highRiskErrors.drugRoute
                      ? "border-emergency-400 focus:border-emergency-500"
                      : "border-hairline focus:border-teal-500"
                  }`}
                  value={drugRoute}
                  onChange={(ev) => setDrugRoute(ev.target.value)}
                >
                  <option value="">Route</option>
                  <option>IV</option>
                  <option>IM</option>
                  <option>Epidural</option>
                  <option>Intrathecal</option>
                  <option>Oral</option>
                </select>
              </div>
              {e && (highRiskErrors.drugDosage || highRiskErrors.drugRoute) && (
                <span className="font-mono text-[11px] text-emergency-600">
                  {highRiskErrors.drugDosage ? "Dosage required" : "Route required"}
                </span>
              )}
              {!e || (!highRiskErrors.drugDosage && !highRiskErrors.drugRoute) ? (
                <span className="text-[12px] text-ink-soft">
                  Route of administration severely alters risk profile.
                </span>
              ) : null}
            </div>

            <FField
              label="Associated Lab Marker *"
              placeholder="e.g. Lithium levels, aPTT"
              value={labMarker}
              onChange={(ev) => setLabMarker(ev.target.value)}
              error={e ? highRiskErrors.labMarker : ""}
              hint={!e || !highRiskErrors.labMarker ? "Tells the physician what blood test to run immediately." : ""}
            />
          </SectionToggle>

          {/* ─── Doctor's Note ─── */}
          <Card title="Doctor's Note" accent="neutral">
            <p className="mb-3 text-[13px] text-ink-soft">
              Optional free-text note for handover or observations not covered above. Max 100 words.
            </p>
            <textarea
              rows={4}
              placeholder="e.g. Patient was non-compliant with insulin dosing for 2 weeks prior to admission. Recommend dietitian referral before discharge…"
              value={note}
              onChange={(ev) => handleNoteChange(ev.target.value)}
              className="w-full resize-none rounded-md border border-hairline bg-surface px-3.5 py-3 text-[15px] text-ink placeholder:text-ink-soft/40 focus:border-teal-500 focus:outline-none"
            />
            <div className="mt-1.5 flex justify-end">
              <span
                className={`font-mono text-[12px] font-semibold tabular ${
                  noteWords >= 90 ? "text-[#b07c12]" : "text-ink-soft"
                }`}
              >
                {noteWords}/100 words
              </span>
            </div>
          </Card>

          {/* ─── Actions ─── */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                type="button"
                onClick={handleClearDraft}
                className="text-ink-soft hover:text-emergency-600"
              >
                Clear form
              </Button>
            </div>
            <div className="flex items-center gap-3">
              {draftStatus && (
                <span className="font-mono text-[12px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded animate-pulse">
                  ✓ {draftStatus}
                </span>
              )}
              <Button variant="outline" type="button" onClick={handleSaveDraft}>
                Save draft
              </Button>
              <Button variant="primary" large type="button" onClick={handleReview}>
                Review Changes →
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}