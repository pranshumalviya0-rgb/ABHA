import {
  WireFrame,
  WireCard,
  WireInput,
  WireButton,
  WireLine,
  WireTitle,
} from "../../components/wire";

export default function WfPatientDashboard() {
  return (
    <WireFrame title="P5 · Patient Dashboard">
      <main className="mx-auto max-w-[1000px] px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-2">
            <WireTitle w="w-48" />
            <WireLine w="w-32" />
          </div>
          <WireButton label="Request Replacement Card" solid large />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Access logs table */}
          <WireCard title="Access Logs">
            {/* Table header */}
            <div className="grid grid-cols-4 gap-3 border-b border-neutral-300 pb-2">
              {["Facility", "Data", "Who", "Date"].map((h) => (
                <div key={h} className="font-mono text-[10px] uppercase tracking-[0.1em] text-neutral-500">
                  {h}
                </div>
              ))}
            </div>
            {/* Rows */}
            <div className="divide-y divide-neutral-200">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="grid grid-cols-4 gap-3 py-3">
                  <WireLine w="w-24" />
                  <WireLine w="w-20" />
                  <WireLine w="w-16" />
                  <WireLine w="w-20" />
                </div>
              ))}
            </div>
          </WireCard>

          {/* Settings */}
          <WireCard title="Account Settings">
            <div className="space-y-4">
              <WireInput label="Primary contact" />
              <WireInput label="Secondary contact" />
              <WireButton label="Save" solid full large />
            </div>
          </WireCard>
        </div>
      </main>
    </WireFrame>
  );
}
