import {
  WireFrame,
  WireCard,
  WireInput,
  WireDropdown,
  WireButton,
  WireLine,
  WireTitle,
} from "../../components/wire";

export default function WfDischarge() {
  return (
    <WireFrame title="P4 · Discharge Data Entry">
      <main className="mx-auto max-w-[760px] space-y-6 px-6 py-8">
        <div className="space-y-2">
          <WireTitle w="w-52" />
          <WireLine w="w-2/3" />
        </div>

        {/* Allergies rows */}
        <WireCard title="Allergies">
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="grid grid-cols-3 gap-3">
                <WireInput label={i === 0 ? "Allergen" : undefined} />
                <WireDropdown label={i === 0 ? "Severity" : undefined} />
                <WireInput label={i === 0 ? "Reaction" : undefined} />
              </div>
            ))}
          </div>
          <div className="mt-3">
            <WireLine w="w-28" />
          </div>
        </WireCard>

        {/* Prescription rows */}
        <WireCard title="Prescriptions">
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="grid grid-cols-3 gap-3">
                <WireInput label={i === 0 ? "Medication" : undefined} />
                <WireDropdown label={i === 0 ? "Action" : undefined} />
                <WireInput label={i === 0 ? "Dosage" : undefined} />
              </div>
            ))}
          </div>
          <div className="mt-3">
            <WireLine w="w-28" />
          </div>
        </WireCard>

        {/* Upload zone */}
        <WireCard title="Summary Document">
          <div className="grid h-36 place-items-center rounded-sm border-2 border-dashed border-neutral-400 bg-neutral-100">
            <div className="text-center">
              <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full border border-neutral-400 font-mono text-neutral-500">
                ↑
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-neutral-500">
                Drag & drop file
              </span>
            </div>
          </div>
        </WireCard>

        <div className="flex justify-end gap-3">
          <WireButton label="Save Draft" />
          <WireButton label="Submit" solid large />
        </div>
      </main>
    </WireFrame>
  );
}
