import {
  WireFrame,
  WireCard,
  WireInput,
  WireButton,
  WireBanner,
  WireTitle,
  WireLine,
} from "../../components/wire";

export default function WfFacilityAuth() {
  return (
    <WireFrame title="P4A · Facility Authentication" fill>
      <main className="grid flex-1 place-items-center px-6">
        <div className="w-full max-w-[420px]">
          <WireCard>
            <div className="mb-4 space-y-2">
              <WireTitle w="w-48" />
              <WireLine w="w-2/3" />
            </div>
            <div className="space-y-4">
              <WireInput label="Facility ID" />
              <WireInput label="Staff ID" />
              <WireInput label="Patient ABHA ID" />
              <WireInput label="Password" />
            </div>
            <div className="mt-5">
              <WireBanner label="Restricted access — authorized personnel only" />
            </div>
            <div className="mt-4">
              <WireButton label="Verify Credentials" solid full large />
            </div>
          </WireCard>
        </div>
      </main>
    </WireFrame>
  );
}
