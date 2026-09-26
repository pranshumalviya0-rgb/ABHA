import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Logo, Card, Button, Badge } from "../components/ui";
import { emergencyApi, getTargetAbhaId, getAuthUser } from "../services/api";

export default function EmergencyDashboard() {
  const navigate = useNavigate();
  const [notified, setNotified] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [patientData, setPatientData] = useState<{
    patient: {
      abhaId: string;
      fullName: string;
      dob?: string;
      gender?: string;
      bloodGroup?: string;
      weight_kg?: number;
      height_cm?: number;
    };
    conditions: Array<{ id: string; name: string; since?: string; notes?: string }>;
    allergies: Array<{
      allergen: string;
      reactionSeverity: string;
      clinicalManifestation: string;
      epinephrineRequired: boolean;
    }>;
    medications: Array<{ genericDrug: string; route?: string; category?: string }>;
    emergencyContacts: {
      primary?: { phone: string } | null;
      secondary?: { phone: string } | null;
    };
  } | null>(null);

  const abhaId = getTargetAbhaId();
  const staff = getAuthUser();

  useEffect(() => {
    async function loadEmergencyRecord() {
      setLoading(true);
      setError(null);
      const res = await emergencyApi.getPatientRecord(abhaId);
      setLoading(false);

      if (res.ok && res.data) {
        setPatientData(res.data);
      } else {
        setError(res.error || "Unable to retrieve emergency record for this patient.");
      }
    }

    loadEmergencyRecord();
  }, [abhaId]);

  const handleNotifyFamily = async () => {
    if (!abhaId) return;
    setNotifying(true);
    const res = await emergencyApi.notifyFamily(abhaId);
    setNotifying(false);

    if (res.ok) {
      setNotified(true);
    } else {
      alert(res.error || "Failed to notify emergency contacts.");
    }
  };

  const p = patientData?.patient;
  const initials = p?.fullName
    ? p.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "PT";

  const formattedAbha = p?.abhaId
    ? p.abhaId.replace(/(.{4})(.{4})(.{4})(.{2}).*/, "$1 $2 $3 $4")
    : abhaId;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-canvas">
      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-hairline bg-surface px-6 py-2.5">
        <Logo />
        <div className="flex items-center gap-3">
          <Badge tone="emergency">● Live emergency session</Badge>
          <span className="hidden font-mono text-[12px] text-ink-soft sm:block tabular">
            {staff?.name || "Dr. A. Menon"} · {staff?.hpid || "HPID-11"} ·{" "}
            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} IST
          </span>
          <Button variant="ghost" onClick={() => navigate("/")}>
            End session
          </Button>
        </div>
      </header>

      {/* Loading & Error States */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center font-mono text-[14px] text-ink-soft">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-emergency-500 border-t-transparent mr-2" />
            Decrypting & Loading Emergency Health Record…
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-md rounded-lg border border-red-200 bg-surface p-6 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-red-100 text-red-600 font-bold text-[20px]">
              !
            </div>
            <h2 className="text-[18px] font-bold text-ink">Record Not Found</h2>
            <p className="mt-2 text-[14px] text-ink-soft">{error}</p>
            <Button variant="primary" className="mt-5" onClick={() => navigate("/")}>
              Return to Search
            </Button>
          </div>
        </div>
      ) : (
        /* Dense single-screen grid */
        <main className="grid min-h-0 flex-1 gap-3 p-3 lg:grid-cols-[1.1fr_1fr_1fr] lg:grid-rows-[auto_1fr]">
          {/* Identity — spans */}
          <div className="lg:col-span-2">
            <Card accent="teal" className="h-full">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-md bg-teal-500 font-display text-[24px] font-bold text-white">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-display text-[22px] font-bold leading-none tracking-tight">
                      {p?.fullName || "Patient Record"}
                    </h1>
                    <Badge tone="teal">Verified CliniKey</Badge>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[12px] text-ink-soft tabular">
                    <span>
                      {p?.gender === "Male" ? "♂" : p?.gender === "Female" ? "♀" : "⚲"} ·{" "}
                      {p?.dob ? `DOB ${p.dob}` : "Age verified"}
                    </span>
                    <span>CliniKey {formattedAbha}</span>
                    <span>
                      {p?.weight_kg ? `${p.weight_kg} kg` : ""}
                      {p?.weight_kg && p?.height_cm ? " · " : ""}
                      {p?.height_cm ? `${p.height_cm} cm` : ""}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Blood group — glanceable */}
          <Card accent="emergency" title="Blood Group" className="flex flex-col">
            <div className="flex flex-1 items-center justify-between">
              <span className="font-display text-[56px] font-bold leading-none text-emergency-600">
                {p?.bloodGroup || "O+"}
              </span>
              <div className="text-right font-mono text-[11px] text-ink-soft">
                <p>Status</p>
                <p className="text-ink font-semibold">Clinically Verified</p>
                <p className="mt-1">Implied Consent Active</p>
              </div>
            </div>
          </Card>

          {/* Severe allergies */}
          <Card
            accent="emergency"
            title="Severe Allergies"
            hint={<Badge tone="ok">Verified</Badge>}
          >
            {patientData?.allergies && patientData.allergies.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {patientData.allergies.map((a, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-md border border-emergency-100 bg-emergency-50 px-3 py-2"
                  >
                    <div>
                      <p className="text-[14px] font-semibold text-emergency-700">{a.allergen}</p>
                      <p className="text-[12px] text-ink-soft">
                        {a.clinicalManifestation} · {a.reactionSeverity}
                      </p>
                    </div>
                    {a.epinephrineRequired && <Badge tone="emergency">EpiPen Required</Badge>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-4 text-center text-[13px] text-ink-soft font-mono">
                No severe allergies recorded
              </p>
            )}
          </Card>

          {/* Current medications / Conditions */}
          <Card
            title="Active Medications & Conditions"
            hint={
              <span className="tabular">
                {(patientData?.conditions?.length || 0) + (patientData?.medications?.length || 0)} items
              </span>
            }
          >
            <ul className="flex flex-col divide-y divide-hairline">
              {patientData?.medications && patientData.medications.length > 0
                ? patientData.medications.map((m, i) => (
                    <li key={`med-${i}`} className="flex items-start justify-between gap-2 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-semibold text-ink">{m.genericDrug}</p>
                        <p className="font-mono text-[12px] text-ink-soft tabular">
                          {m.route?.includes(":") || m.route?.includes("·")
                            ? m.route
                            : `Route: ${m.route || "Standard"}`}
                        </p>
                      </div>
                      <Badge tone="emergency">{m.category || "High-Risk"}</Badge>
                    </li>
                  ))
                : null}

              {patientData?.conditions && patientData.conditions.length > 0
                ? patientData.conditions.map((c, i) => (
                    <li key={`cond-${i}`} className="flex items-start justify-between gap-2 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-semibold text-ink">{c.name}</p>
                        <p className="font-mono text-[12px] text-ink-soft tabular">
                          {c.since
                            ? c.since.startsWith("MR-")
                              ? `Safety: ${c.since}`
                              : `Since ${c.since}`
                            : "Ongoing"}{" "}
                          {c.notes ? `· ${c.notes}` : ""}
                        </p>
                      </div>
                      <Badge tone={c.name.startsWith("Implant:") ? "warn" : "neutral"}>
                        {c.name.startsWith("Implant:") ? "Critical Implant" : "Reported Condition"}
                      </Badge>
                    </li>
                  ))
                : null}

              {(!patientData?.medications || patientData.medications.length === 0) &&
                (!patientData?.conditions || patientData.conditions.length === 0) && (
                  <li className="py-4 text-center text-[13px] text-ink-soft font-mono">
                    No active conditions or medications recorded
                  </li>
                )}
            </ul>
          </Card>

          {/* Notify family + context */}
          <div className="flex flex-col gap-3">
            <Card title="Emergency Contacts" className="flex-1">
              <div className="flex flex-col gap-2">
                {patientData?.emergencyContacts.primary ? (
                  <div className="flex items-center justify-between text-[13px]">
                    <div>
                      <p className="font-semibold">Primary Contact</p>
                      <p className="text-ink-soft">Designated Kin</p>
                    </div>
                    <span className="font-mono text-ink tabular font-semibold">
                      {patientData.emergencyContacts.primary.phone}
                    </span>
                  </div>
                ) : null}

                {patientData?.emergencyContacts.secondary ? (
                  <div className="flex items-center justify-between text-[13px]">
                    <div>
                      <p className="font-semibold">Secondary Contact</p>
                      <p className="text-ink-soft">Emergency Kin</p>
                    </div>
                    <span className="font-mono text-ink tabular font-semibold">
                      {patientData.emergencyContacts.secondary.phone}
                    </span>
                  </div>
                ) : null}

                {!patientData?.emergencyContacts.primary &&
                  !patientData?.emergencyContacts.secondary && (
                    <p className="py-2 text-center text-[13px] text-ink-soft font-mono">
                      No contact numbers on file
                    </p>
                  )}
              </div>
            </Card>

            <Button
              variant={notified ? "outline" : "emergency"}
              large
              full
              disabled={notifying}
              onClick={handleNotifyFamily}
            >
              {notifying
                ? "Dispatching SMS & Calls…"
                : notified
                  ? "✓ Family notified · Alert dispatched"
                  : "Notify Family Now"}
            </Button>
          </div>
        </main>
      )}
    </div>
  );
}
