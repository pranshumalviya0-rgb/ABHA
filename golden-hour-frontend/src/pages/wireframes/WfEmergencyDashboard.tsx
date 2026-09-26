import {
  WireFrame,
  WireImage,
  WireButton,
  WireLine,
  WireTitle,
} from "../../components/wire";

function WfCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-col rounded-sm border border-neutral-300 bg-white">
      <div className="border-b border-neutral-300 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-500">
        {title}
      </div>
      <div className="min-h-0 flex-1 p-3">{children}</div>
    </div>
  );
}

export default function WfEmergencyDashboard() {
  return (
    <WireFrame title="P3 · Emergency Dashboard (no scroll)" fill>
      <main className="grid min-h-0 flex-1 grid-cols-3 grid-rows-[auto_1fr] gap-3 p-3">
        {/* Identity */}
        <div className="col-span-2">
          <WfCard title="Identity">
            <div className="flex items-center gap-4">
              <WireImage label="Photo" className="h-16 w-16 shrink-0" />
              <div className="flex-1 space-y-2">
                <WireTitle w="w-40" />
                <WireLine w="w-56" />
                <WireLine w="w-32" />
              </div>
            </div>
          </WfCard>
        </div>

        {/* Blood group — oversized */}
        <WfCard title="Blood Group">
          <div className="flex h-full items-center justify-center">
            <span className="text-[64px] font-bold leading-none text-neutral-900">O+</span>
          </div>
        </WfCard>

        {/* Allergies */}
        <WfCard title="Severe Allergies">
          <div className="space-y-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-sm border border-neutral-300 bg-neutral-100 p-2">
                <WireLine w="w-24" />
                <div className="mt-1.5">
                  <WireLine w="w-36" />
                </div>
              </div>
            ))}
          </div>
        </WfCard>

        {/* Medications */}
        <WfCard title="Medications">
          <div className="divide-y divide-neutral-200">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <WireLine w="w-28" />
                <WireLine w="w-14" />
              </div>
            ))}
          </div>
        </WfCard>

        {/* Notify family */}
        <div className="flex flex-col gap-3">
          <div className="min-h-0 flex-1">
            <WfCard title="Contacts">
              <div className="space-y-2">
                <WireLine w="w-full" />
                <WireLine w="w-3/4" />
              </div>
            </WfCard>
          </div>
          <WireButton label="Notify Family" solid full large />
        </div>
      </main>
    </WireFrame>
  );
}
