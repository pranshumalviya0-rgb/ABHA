import { Link } from "react-router";
import { WireImage } from "../../components/wire";

const SCREENS = [
  { to: "/wireframes/landing", code: "P1", name: "Landing & Emergency Gateway" },
  { to: "/wireframes/create-abha", code: "P1A", name: "Create CliniKey — Multi-step Flow" },
  { to: "/wireframes/staff-auth", code: "P2", name: "Emergency Staff Authentication" },
  { to: "/wireframes/emergency", code: "P3", name: "1-Screen Emergency Dashboard" },
  { to: "/wireframes/facility-auth", code: "P4A", name: "Hospital Facility Authentication" },
  { to: "/wireframes/discharge", code: "P4", name: "Post-Care Discharge Data Entry" },
  { to: "/wireframes/patient", code: "P5", name: "Patient Standard Dashboard" },
];

export default function WfIndex() {
  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="border-b border-neutral-300 bg-white px-6 py-5">
        <div className="mx-auto max-w-[960px]">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-500">
            CliniKey · Lo-fi Wireframes
          </p>
          <h1 className="mt-1 text-[22px] font-bold tracking-tight text-neutral-900">
            Wireframe Set
          </h1>
          <p className="mt-1 text-[13px] text-neutral-500">
            Grayscale, low-fidelity layouts for structural review.{" "}
            <Link to="/" className="underline hover:text-neutral-900">
              View hi-fi app →
            </Link>
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-[960px] px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SCREENS.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="group rounded-sm border border-neutral-300 bg-white p-3 transition-colors hover:border-neutral-500"
            >
              <WireImage className="aspect-[4/3] w-full" />
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-sm border border-neutral-300 bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] text-neutral-500">
                  {s.code}
                </span>
                <span className="text-[13px] font-medium text-neutral-800 group-hover:text-neutral-900">
                  {s.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
