import {
  WireFrame,
  WireCard,
  WireInput,
  WireButton,
  WireOtp,
  WireBanner,
  WireTitle,
  WireLine,
} from "../../components/wire";

export default function WfStaffAuth() {
  return (
    <WireFrame title="P2 · Staff Authentication" fill>
      <main className="grid flex-1 place-items-center px-6">
        <div className="w-full max-w-[420px]">
          <WireCard>
            <div className="mb-4 space-y-2">
              <WireTitle w="w-44" />
              <WireLine w="w-2/3" />
            </div>
            <WireInput label="Staff ID" />
            <div className="mt-4">
              <div className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-neutral-500">
                Rapid PIN
              </div>
              <WireOtp />
            </div>
            <div className="mt-5">
              <WireButton label="Open Record" solid full large />
            </div>
          </WireCard>
        </div>
      </main>

      {/* Bottom consent-log warning banner */}
      <div className="shrink-0 px-6 pb-6">
        <WireBanner label="Consent log warning — access is being recorded" />
      </div>
    </WireFrame>
  );
}
