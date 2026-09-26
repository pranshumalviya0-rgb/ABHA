import { useNavigate } from "react-router";
import { Logo, Card, Button, Badge } from "../components/ui";

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="border-b border-hairline bg-surface">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/help")}>
              Help &amp; FAQ
            </Button>
            <Button variant="primary" onClick={() => navigate("/")}>
              ← Back to Portal
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1120px] px-6 py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <Badge tone="teal">Ayushman Bharat Digital Mission · ABDM Interoperable</Badge>
          <h1 className="mt-4 font-display text-[38px] font-bold tracking-tight text-ink sm:text-[46px]">
            Every second counts. CliniKey saves them.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-relaxed text-ink-soft">
            CliniKey is an emergency health access network designed for the Golden Hour — the critical
            first 60 minutes following severe trauma or acute medical distress.
          </p>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card title="1. Golden Hour Response" accent="emergency">
            <h3 className="font-display text-[18px] font-bold text-ink">
              Sub-10 Second Vital Access
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
              First responders can immediately scan a patient&apos;s physical CliniKey QR code or
              input their 14-digit ABHA number to fetch critical blood group, life-threatening
              allergies, and active medications without waiting for conscious consent.
            </p>
          </Card>

          <Card title="2. ABDM Integrated" accent="teal">
            <h3 className="font-display text-[18px] font-bold text-ink">
              National Health Identification
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
              Directly aligned with the Ayushman Bharat Digital Mission (ABDM). Features seamless
              integration with Health Professional Registry (HPID) and Health Facility Registry
              (HFR) for verified clinical handovers.
            </p>
          </Card>

          <Card title="3. Automated Kin Alert" accent="neutral">
            <h3 className="font-display text-[18px] font-bold text-ink">
              Multi-Channel Dispatch
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
              With a single click on the emergency dashboard, the system broadcasts instant SMS
              alerts and automated text-to-speech phone calls to designated primary and secondary
              emergency contacts.
            </p>
          </Card>
        </div>

        {/* How It Works Architecture */}
        <div className="mt-12">
          <Card title="System Architecture &amp; Data Flow" accent="teal">
            <div className="grid gap-6 lg:grid-cols-4">
              <div className="rounded-md border border-hairline bg-canvas p-4">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-emergency-500 font-mono text-[14px] font-bold text-white">
                  1
                </span>
                <h4 className="mt-3 font-semibold text-ink">Rapid Identification</h4>
                <p className="mt-1 text-[13px] text-ink-soft">
                  Paramedics scan the CliniKey card QR code or input the 14-digit ABHA ID on scene.
                </p>
              </div>

              <div className="rounded-md border border-hairline bg-canvas p-4">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-teal-500 font-mono text-[14px] font-bold text-white">
                  2
                </span>
                <h4 className="mt-3 font-semibold text-ink">HPID Verification</h4>
                <p className="mt-1 text-[13px] text-ink-soft">
                  Responder enters their verified Health Professional ID and 6-digit rapid PIN.
                </p>
              </div>

              <div className="rounded-md border border-hairline bg-canvas p-4">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-teal-600 font-mono text-[14px] font-bold text-white">
                  3
                </span>
                <h4 className="mt-3 font-semibold text-ink">Vital Data Retrieval</h4>
                <p className="mt-1 text-[13px] text-ink-soft">
                  Instantly renders blood group, severe allergies, high-risk APINCHS drugs, and implants.
                </p>
              </div>

              <div className="rounded-md border border-hairline bg-canvas p-4">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-600 font-mono text-[14px] font-bold text-white">
                  4
                </span>
                <h4 className="mt-3 font-semibold text-ink">Post-Care Discharge</h4>
                <p className="mt-1 text-[13px] text-ink-soft">
                  Hospital records officers update confirmed diagnosis and prescriptions for future safety.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Security and Compliance */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Card title="Security &amp; Encryption" accent="teal">
            <ul className="flex flex-col gap-3 text-[14px] text-ink-soft">
              <li className="flex items-start gap-2">
                <span className="font-bold text-teal-600">✓</span>
                <span>
                  <strong className="text-ink">SHA-256 Aadhaar Hashing:</strong> Aadhaar numbers are never stored in raw text; only irreversible cryptographic hashes are preserved.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-teal-600">✓</span>
                <span>
                  <strong className="text-ink">Role-Based JWT Authorization:</strong> Strict cryptographic tokens isolate patient, paramedic, and facility capabilities.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-teal-600">✓</span>
                <span>
                  <strong className="text-ink">Tamper-Proof Audit Logging:</strong> Every record access triggers an immutable log entry with hospital, staff HPID, and timestamp.
                </span>
              </li>
            </ul>
          </Card>

          <Card title="Legal &amp; Regulatory Framework" accent="neutral">
            <ul className="flex flex-col gap-3 text-[14px] text-ink-soft">
              <li className="flex items-start gap-2">
                <span className="font-bold text-teal-600">✓</span>
                <span>
                  <strong className="text-ink">ABDM Health Data Management Policy:</strong> Fully compliant with National Digital Health Blueprint guidelines.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-teal-600">✓</span>
                <span>
                  <strong className="text-ink">Good Samaritan Implied Consent:</strong> Operates under statutory implied emergency consent protocols during unconscious triage.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-teal-600">✓</span>
                <span>
                  <strong className="text-ink">Patient Right to Revoke:</strong> Conscious patients can audit all emergency queries directly from their self-service dashboard.
                </span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="mt-12 rounded-xl border border-hairline bg-surface p-8 text-center">
          <h2 className="font-display text-[26px] font-bold text-ink">
            Protect your golden hour today
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-[14px] text-ink-soft">
            Create your CliniKey in less than 2 minutes using your Aadhaar number and instant OTP.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Button variant="primary" large onClick={() => navigate("/create-abha")}>
              Create Your CliniKey
            </Button>
            <Button variant="outline" large onClick={() => navigate("/")}>
              Return to Portal Home
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
