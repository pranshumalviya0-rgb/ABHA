import {
  WireFrame,
  WireCard,
  WireImage,
  WireInput,
  WireButton,
  WireLine,
  WireTitle,
  WireOtp,
  WireCheckbox,
  WireToggle,
  WireBanner,
} from "../../components/wire";

function StepHead({ n, label }: { n: string; label: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="grid h-6 w-6 place-items-center rounded-full bg-neutral-900 font-mono text-[11px] text-white">
        {n}
      </span>
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-600">
        {label}
      </span>
    </div>
  );
}

export default function WfCreateAbha() {
  return (
    <WireFrame title="P1A · Create CliniKey (Multi-step)">
      <main className="mx-auto max-w-[560px] space-y-6 px-6 py-8">
        {/* Step 1 — Consent & ID */}
        <div>
          <StepHead n="1" label="Consent & ID" />
          <WireCard>
            <WireToggle />
            <div className="mt-4">
              <WireInput label="12-digit ID" />
            </div>
            <div className="mt-4">
              <WireCheckbox />
            </div>
            <div className="mt-5">
              <WireButton label="Continue" solid full large />
            </div>
          </WireCard>
        </div>

        {/* Step 2 — OTP */}
        <div>
          <StepHead n="2" label="OTP Verification" />
          <WireCard>
            <div className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-neutral-500">
              6-digit OTP
            </div>
            <WireOtp />
            <div className="mt-4">
              <WireInput label="Mobile number" />
            </div>
          </WireCard>
        </div>

        {/* Step 3 — Profile setup */}
        <div>
          <StepHead n="3" label="Profile Setup" />
          <WireCard>
            <div className="flex gap-4">
              <WireImage label="Photo" className="h-20 w-20 shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <WireTitle w="w-32" />
                <WireLine w="w-40" />
                <WireLine w="w-28" />
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-neutral-500">
                Custom identifier
              </div>
              <div className="flex items-stretch overflow-hidden rounded-sm border border-neutral-300">
                <div className="h-11 flex-1 bg-white" />
                <span className="grid place-items-center border-l border-neutral-300 bg-neutral-100 px-3 font-mono text-[12px] text-neutral-500">
                  @suffix
                </span>
              </div>
            </div>
            <div className="mt-5">
              <WireButton label="Generate CliniKey Card" solid full large />
            </div>
          </WireCard>
        </div>

        {/* Step 4 — Outcomes */}
        <div>
          <StepHead n="4" label="Outcome" />
          <div className="grid gap-4">
            {/* Variation A */}
            <WireCard title="Variation A · Success">
              <div className="rounded-sm border border-neutral-400 bg-neutral-100 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <WireLine w="w-20" />
                    <WireTitle w="w-40" />
                    <WireLine w="w-28" />
                  </div>
                  <WireImage label="QR" className="h-20 w-20 shrink-0" />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <WireButton label="PDF" />
                <WireButton label="Print" />
                <WireButton label="Dashboard" solid />
              </div>
            </WireCard>

            {/* Variation B */}
            <WireCard title="Variation B · Manual Verification">
              <div className="mb-3 text-center">
                <WireTitle w="w-40" />
              </div>
              <WireBanner label="Offline verification required — visit facility" />
              <div className="mt-4">
                <WireButton label="Find Nearest Facility" full />
              </div>
            </WireCard>
          </div>
        </div>
      </main>
    </WireFrame>
  );
}
