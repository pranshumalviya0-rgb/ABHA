import { useState } from "react";
import { useNavigate } from "react-router";
import { Logo, Button, Field } from "../components/ui";
import { authApi, setTargetAbhaId, getTargetAbhaId } from "../services/api";

export default function FacilityAuth() {
  const navigate = useNavigate();
  const [hfrId, setHfrId] = useState("IN-HFR-2024-0012");
  const [staffEmployeeId, setStaffEmployeeId] = useState("EMP-883100");
  const [patientAbhaId, setPatientAbhaId] = useState(() => getTargetAbhaId() || "12345678901234");
  const [password, setPassword] = useState("Facility@123");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!hfrId || !staffEmployeeId || !password || !patientAbhaId) {
      setError("Please fill in all credential fields including Patient ABHA ID");
      return;
    }

    setVerifying(true);
    const res = await authApi.facilityLogin(
      hfrId.trim(),
      staffEmployeeId.trim(),
      password,
      patientAbhaId.trim()
    );
    setVerifying(false);

    if (res.ok) {
      setTargetAbhaId(patientAbhaId.trim());
      navigate("/discharge");
    } else {
      setError(res.error || "Facility authentication failed. Invalid credentials or Patient ABHA ID.");
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-6 py-10">
      <div className="w-full max-w-[460px]">
        <div className="mb-7 flex justify-center">
          <Logo />
        </div>

        <form onSubmit={verify} className="rounded-lg border border-hairline bg-surface p-8">
          <div className="mb-5">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-600">
              Facility Checkpoint
            </span>
            <h1 className="mt-1 font-display text-[24px] font-bold tracking-tight text-ink">
              Hospital Facility Authentication
            </h1>
            <p className="mt-1 text-[14px] text-ink-soft">
              Verify your facility and staff credentials to enter discharge details for the patient.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">
              {error}
            </div>
          )}

          {/* Restricted access notice */}
          <div className="mb-6 flex gap-3 rounded-md border border-hairline bg-canvas px-4 py-3">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-teal-500 text-[11px] font-bold text-white">
              !
            </span>
            <p className="text-[13px] leading-snug text-ink-soft">
              <span className="font-semibold text-ink">Restricted Access:</span> Authorized hospital personnel may update clinical summaries for the specified ABHA patient record.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Field
              label="Health Facility Registry · HFR ID"
              mono
              placeholder="IN-HFR-0000-0000"
              value={hfrId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHfrId(e.target.value)}
              autoComplete="off"
              autoFocus
              required
            />
            <Field
              label="Staff Employee ID"
              mono
              placeholder="EMP-000000"
              value={staffEmployeeId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStaffEmployeeId(e.target.value)}
              autoComplete="off"
              required
            />
            <Field
              label="Patient ABHA ID / Number"
              mono
              placeholder="12-3456-7890-1234 or 12345678901234"
              hint="Patient ABHA ID or address (e.g. 12345678901234 or rahul.sharma@abdm)"
              value={patientAbhaId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPatientAbhaId(e.target.value)}
              autoComplete="off"
              required
            />
            <Field
              label="Password / Secure PIN"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
            <Button variant="primary" large full type="submit" disabled={verifying}>
              {verifying ? "Verifying Credentials & Patient…" : "Verify Credentials & Enter Discharge"}
            </Button>
            <Button variant="ghost" full type="button" onClick={() => navigate("/")}>
              Return to Main Portal
            </Button>
          </div>
        </form>

        <p className="mt-4 text-center font-mono text-[11px] leading-relaxed text-ink-soft">
          All facility access is audited under ABDM Reg. 2019 · CliniKey Network
        </p>
      </div>
    </div>
  );
}
