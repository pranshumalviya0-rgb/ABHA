import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { Logo, Card, Button, Badge } from "../components/ui"
import { dischargeApi, facilityApi, getTargetAbhaId, getAuthUser } from "../services/api"

/* ── shared display primitives ── */
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.13em] text-ink-soft">
        {label}
      </span>
      <span className="text-right text-[14px] font-medium text-ink">{value ?? "—"}</span>
    </div>
  )
}

function YesNo({ value }: { value: boolean | null }) {
  if (value === null) return <span className="text-ink-soft">—</span>
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold ${
        value
          ? "bg-teal-50 text-teal-700"
          : "bg-emergency-50 text-emergency-700"
      }`}
    >
      {value ? "Yes" : "No"}
    </span>
  )
}

function SectionCard({
  number,
  title,
  accent,
  children,
}: {
  number: string
  title: string
  accent: "emergency" | "teal" | "warn"
  children: React.ReactNode
}) {
  const barColor =
    accent === "emergency"
      ? "before:bg-emergency-500"
      : accent === "teal"
        ? "before:bg-teal-500"
        : "before:bg-[#e6a817]"

  const badgeTone =
    accent === "emergency" ? "emergency" : accent === "teal" ? "teal" : "warn"

  return (
    <section
      className={`relative overflow-hidden rounded-md border border-hairline bg-surface before:absolute before:left-0 before:top-0 before:h-full before:w-1 ${barColor}`}
    >
      <header className="flex items-center justify-between border-b border-hairline px-5 py-3">
        <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
          {number}. {title}
        </h3>
        <Badge tone={badgeTone as "emergency" | "teal" | "warn"}>Included</Badge>
      </header>
      <div className="divide-y divide-hairline px-5">{children}</div>
    </section>
  )
}

function NotApplicable({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-hairline bg-canvas px-5 py-3.5">
      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.13em] text-ink-soft">
        {title}
      </span>
      <Badge tone="neutral">Not applicable</Badge>
    </div>
  )
}

export default function DischargeReview() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const facility = getAuthUser()
  const abhaId = getTargetAbhaId()
  const [patientName, setPatientName] = useState("Patient")

  useEffect(() => {
    async function loadPatient() {
      const res = await facilityApi.getPatientContext(abhaId)
      if (res.ok && res.data?.patient) {
        setPatientName(res.data.patient.fullName)
      }
    }
    loadPatient()
  }, [abhaId])

  // Guard — if someone navigates directly without state, bounce back
  if (!state) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-[15px] text-ink-soft">No discharge data to review.</p>
        <Button variant="primary" onClick={() => navigate("/discharge")}>
          Back to discharge form
        </Button>
      </div>
    )
  }

  const {
    showAllergy, allergenCategory, allergen, reactionClassification, reactionSeverity, clinicalManifestation, clinicalManifestations, epinephrine,
    showDiabetes, diabetesClassification, treatmentPathway, hba1c, dkaHistory,
    showImplant, implantCategory, deviceName, mriClass, conditionalParams, serialNo,
    showBloodThinner, medicationClass, drugName, lastDose, targetInr, reversalAgent,
    showHighRisk, apinchsCategory, genericDrug, drugDosage, drugRoute, labMarker,
    note,
  } = state || {}

  const activeCount = [showAllergy, showDiabetes, showImplant, showBloodThinner, showHighRisk]
    .filter(Boolean).length

  const manifestText = Array.isArray(clinicalManifestations) && clinicalManifestations.length > 0
    ? clinicalManifestations.join(", ")
    : (clinicalManifestation || "Anaphylaxis");

  async function handleSubmit() {
    setSubmitError(null)
    setSubmitting(true)

    const payload = {
      patientAbhaId: getTargetAbhaId() || "12345678901234",
      allergy: showAllergy ? {
        allergen: allergen || "Penicillin",
        reactionSeverity: reactionSeverity || "Class 4 — Life-threatening (anaphylactic shock)",
        clinicalManifestation: manifestText,
        epinephrineRequired: Boolean(epinephrine === "Required" || epinephrine === true || epinephrine === "Yes")
      } : undefined,
      diabetes: showDiabetes ? {
        treatmentPathway: treatmentPathway || "Oral medication",
        hba1cPercent: Number(hba1c) || 7.2,
        dkaHistory: Boolean(dkaHistory === "Yes" || dkaHistory === true)
      } : undefined,
      implant: showImplant ? {
        deviceName: deviceName || "Pacemaker",
        mriClass: mriClass || "MR-Conditional",
        serialNo: serialNo || "SN-2024-449"
      } : undefined,
      bloodThinner: showBloodThinner ? {
        drugName: drugName || "Warfarin",
        lastDoseAt: lastDose ? new Date(lastDose).toISOString() : new Date().toISOString(),
        targetInr: Number(targetInr) || 2.5,
        reversalAgent: reversalAgent || "Vitamin K"
      } : undefined,
      highRiskMed: showHighRisk ? {
        apinchsCategory: apinchsCategory || "I — Insulin",
        genericDrug: genericDrug || "Insulin Glargine",
        route: drugRoute || "IV",
        labMarker: labMarker || "Blood Glucose"
      } : undefined,
      doctorNote: note
    }

    const res = await dischargeApi.submitDischarge(payload)
    setSubmitting(false)

    if (res.ok) {
      sessionStorage.removeItem("discharge_draft");
      setSubmitted(true)
    } else {
      const details = (res.data as any)?.details;
      const detailMsg = Array.isArray(details) ? details.join(" • ") : typeof details === "string" ? details : "";
      setSubmitError(detailMsg ? `${res.error || "Validation failed"}: ${detailMsg}` : (res.error || "Failed to submit discharge entry."))
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-canvas">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-[#e4f5ec] text-[32px] text-[#0a7d4e]">
          ✓
        </div>
        <h1 className="font-display text-[26px] font-bold tracking-tight text-ink">
          Discharge Entry Successfully Recorded
        </h1>
        <p className="mt-2 max-w-md text-[15px] text-ink-soft">
          The medical records have been permanently updated on the CliniKey network and logged for emergency responders.
        </p>
        <div className="mt-8 flex gap-3">
          <Button variant="primary" onClick={() => navigate("/discharge")}>
            New Discharge Entry
          </Button>
          <Button variant="ghost" onClick={() => navigate("/")}>
            Exit to Portal
          </Button>
        </div>
      </div>
    )
  }

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
        {/* Page heading */}
        <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-600">
              Post-Care · Discharge Entry
            </span>
            <h1 className="mt-1 font-display text-[26px] font-bold tracking-tight">
              Review Before Submitting
            </h1>
            <p className="mt-1 text-[14px] text-ink-soft">
              Patient: {patientName} · CliniKey {abhaId} · Admitted 2026-08-09
            </p>
          </div>
          <Badge tone="warn">Pending confirmation</Badge>
        </div>

        {submitError && (
          <div className="my-4 rounded-md border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">
            {submitError}
          </div>
        )}

        {/* Summary banner */}
        <div className="my-5 flex items-center justify-between rounded-md border border-hairline bg-canvas px-5 py-3.5">
          <span className="font-mono text-[12px] text-ink-soft">
            Sections included: <strong className="text-ink">{activeCount} of 5</strong>
          </span>
          <span className="font-mono text-[12px] text-ink-soft">
            Doctor note: <strong className="text-ink">{note?.trim() ? "Yes" : "None"}</strong>
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {/* ─── 1. Severe Allergies ─── */}
          {showAllergy ? (
            <SectionCard number="1" title="Severe Allergies" accent="emergency">
              {allergenCategory && <Row label="Allergen Category" value={allergenCategory} />}
              <Row label="Allergen" value={allergen || "—"} />
              {reactionClassification && <Row label="Reaction Type" value={reactionClassification} />}
              <Row label="Reaction Severity" value={reactionSeverity || "—"} />
              <Row label="Clinical Manifestation" value={manifestText || "—"} />
              <Row
                label="Epinephrine Auto-Injector"
                value={<YesNo value={epinephrine === "Required" || epinephrine === true || epinephrine === "Yes"} />}
              />
            </SectionCard>
          ) : (
            <NotApplicable title="1. Severe Allergies" />
          )}

          {/* ─── 2. Diabetes Mellitus ─── */}
          {showDiabetes ? (
            <SectionCard number="2" title="Diabetes Mellitus" accent="teal">
              {diabetesClassification && <Row label="Classification" value={diabetesClassification} />}
              <Row label="Treatment Pathway" value={treatmentPathway || "—"} />
              <Row
                label="HbA1c Level"
                value={hba1c ? `${hba1c}%` : "—"}
              />
              <Row
                label="DKA / HHS History"
                value={<YesNo value={dkaHistory === "Yes" || dkaHistory === true} />}
              />
            </SectionCard>
          ) : (
            <NotApplicable title="2. Diabetes Mellitus" />
          )}

          {/* ─── 3. Medical Implants ─── */}
          {showImplant ? (
            <SectionCard number="3" title="Critical Medical Implants" accent="warn">
              {implantCategory && <Row label="Implant Category" value={implantCategory} />}
              <Row label="Device Name" value={deviceName || "—"} />
              <Row label="MRI Safety Class" value={mriClass || "—"} />
              {conditionalParams && <Row label="Conditional Parameters" value={conditionalParams} />}
              <Row label="Serial Number" value={serialNo || "—"} />
            </SectionCard>
          ) : (
            <NotApplicable title="3. Critical Medical Implants" />
          )}

          {/* ─── 4. Blood Thinners ─── */}
          {showBloodThinner ? (
            <SectionCard number="4" title="Blood Thinners & Anticoagulants" accent="emergency">
              {medicationClass && <Row label="Medication Class" value={medicationClass} />}
              <Row label="Drug Name" value={drugName || "—"} />
              <Row label="Last Dose Administered" value={lastDose ? new Date(lastDose).toLocaleString() : "—"} />
              <Row label="Target INR Range" value={targetInr ? `INR ${targetInr}` : "—"} />
              <Row label="Reversal Agent" value={reversalAgent || "—"} />
            </SectionCard>
          ) : (
            <NotApplicable title="4. Blood Thinners" />
          )}

          {/* ─── 5. High-Risk Medications ─── */}
          {showHighRisk ? (
            <SectionCard number="5" title="High-Risk Medications" accent="teal">
              <Row label="APINCHS Category" value={apinchsCategory || "—"} />
              <Row
                label="Generic Drug & Route"
                value={
                  genericDrug
                    ? `${genericDrug}${drugDosage ? ` (${drugDosage})` : ""}${drugRoute ? ` · ${drugRoute}` : ""}`
                    : "—"
                }
              />
              <Row label="Associated Lab Marker" value={labMarker || "—"} />
            </SectionCard>
          ) : (
            <NotApplicable title="5. High-Risk Medications" />
          )}

          {/* ─── Doctor's Note ─── */}
          <Card title="Doctor's Note" accent="neutral">
            {note?.trim() ? (
              <p className="text-[14px] leading-relaxed text-ink">{note}</p>
            ) : (
              <p className="text-[14px] italic text-ink-soft">No note provided.</p>
            )}
          </Card>

          {/* ─── Legal declaration ─── */}
          <div className="rounded-md border border-[#f0dcb4] bg-[#fbf1de] px-4 py-3.5 text-[13px] leading-snug text-[#7a4d08]">
            <span className="font-semibold">Declaration: </span>
            By clicking "Confirm &amp; Submit", I certify that the information entered above is
            accurate to the best of my clinical knowledge and forms part of the patient&apos;s
            permanent health record under the CliniKey Health Network.
          </div>

          {/* ─── Actions ─── */}
          <div className="flex items-center justify-between gap-3 pb-4">
            <Button
              variant="ghost"
              type="button"
              onClick={() => navigate("/discharge", { state })}
            >
              ← Edit record
            </Button>
            <Button variant="primary" large type="button" disabled={submitting} onClick={handleSubmit}>
              {submitting ? "Recording in Live Database…" : "Confirm & Submit"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
