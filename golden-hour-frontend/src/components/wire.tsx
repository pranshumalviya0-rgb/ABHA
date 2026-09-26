import type { ReactNode } from "react";
import { Link } from "react-router";

/* Lo-fi grayscale wireframe primitives. Monochrome only: white, neutral grays, black. */

export function WireFrame({
  title,
  children,
  fill = false,
}: {
  title: string;
  children: ReactNode;
  fill?: boolean;
}) {
  return (
    <div className={`${fill ? "flex h-screen flex-col overflow-hidden" : "min-h-screen"} bg-neutral-100`}>
      <header className="flex shrink-0 items-center justify-between border-b border-neutral-300 bg-white px-6 py-3">
        <Link
          to="/wireframes"
          className="font-mono text-[12px] uppercase tracking-[0.14em] text-neutral-500 hover:text-neutral-900"
        >
          ‹ All wireframes
        </Link>
        <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-neutral-700">
          {title}
        </span>
        <span className="grid h-6 w-16 place-items-center rounded-sm border border-dashed border-neutral-400 font-mono text-[10px] text-neutral-400">
          LO-FI
        </span>
      </header>
      {children}
    </div>
  );
}

export function WireBox({
  label,
  className = "",
  h,
}: {
  label?: string;
  className?: string;
  h?: string;
}) {
  return (
    <div
      className={`grid place-items-center rounded-sm border border-neutral-300 bg-neutral-200 text-center font-mono text-[11px] uppercase tracking-[0.12em] text-neutral-500 ${h ?? ""} ${className}`}
    >
      {label}
    </div>
  );
}

/* Box with a diagonal X — stands in for photos, QR codes, icons, scanner viewports. */
export function WireImage({
  label,
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-sm border border-neutral-400 bg-neutral-200 ${className}`}
    >
      <svg className="absolute inset-0 h-full w-full text-neutral-400" preserveAspectRatio="none">
        <line x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" strokeWidth="1" />
        <line x1="100%" y1="0" x2="0" y2="100%" stroke="currentColor" strokeWidth="1" />
      </svg>
      {label && (
        <div className="absolute inset-0 grid place-items-center">
          <span className="bg-neutral-200 px-1 font-mono text-[11px] uppercase tracking-[0.12em] text-neutral-500">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}

/* Solid gray bar — a placeholder text line. */
export function WireLine({ w = "w-full", className = "" }: { w?: string; className?: string }) {
  return <div className={`h-2.5 rounded-full bg-neutral-300 ${w} ${className}`} />;
}

export function WireTitle({ w = "w-40" }: { w?: string }) {
  return <div className={`h-4 rounded-sm bg-neutral-400 ${w}`} />;
}

export function WireInput({ label, className = "" }: { label?: string; className?: string }) {
  return (
    <div className={className}>
      {label && (
        <div className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-neutral-500">
          {label}
        </div>
      )}
      <div className="h-11 rounded-sm border border-neutral-300 bg-white" />
    </div>
  );
}

export function WireDropdown({ label }: { label?: string }) {
  return (
    <div>
      {label && (
        <div className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-neutral-500">
          {label}
        </div>
      )}
      <div className="flex h-11 items-center justify-between rounded-sm border border-neutral-300 bg-white px-3">
        <span className="h-2 w-16 rounded-full bg-neutral-300" />
        <span className="font-mono text-[12px] text-neutral-400">▾</span>
      </div>
    </div>
  );
}

export function WireButton({
  label,
  solid = false,
  full = false,
  large = false,
}: {
  label: string;
  solid?: boolean;
  full?: boolean;
  large?: boolean;
}) {
  return (
    <div
      className={`grid place-items-center rounded-sm font-mono text-[12px] uppercase tracking-[0.12em] ${
        large ? "h-12" : "h-10"
      } ${full ? "w-full" : "px-5"} ${
        solid
          ? "bg-neutral-900 text-white"
          : "border border-neutral-400 bg-white text-neutral-700"
      }`}
    >
      {label}
    </div>
  );
}

export function WireOtp({ count = 6 }: { count?: number }) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-12 flex-1 rounded-sm border border-neutral-300 bg-white" />
      ))}
    </div>
  );
}

export function WireCheckbox({ label }: { label?: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-sm border border-neutral-300 bg-white p-3">
      <span className="mt-0.5 h-4 w-4 shrink-0 rounded-[2px] border border-neutral-400" />
      <div className="flex-1 space-y-1.5 pt-0.5">
        <WireLine w="w-full" />
        <WireLine w="w-2/3" />
      </div>
    </div>
  );
}

export function WireToggle() {
  return (
    <div className="inline-flex rounded-sm border border-neutral-300 bg-neutral-200 p-1">
      <span className="rounded-[2px] bg-white px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-neutral-700">
        Option A
      </span>
      <span className="px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-neutral-400">
        Option B
      </span>
    </div>
  );
}

/* Dark full-width alert banner. */
export function WireBanner({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-sm bg-neutral-800 px-4 py-3">
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-neutral-500 font-mono text-[11px] text-neutral-300">
        !
      </span>
      <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-neutral-300">
        {label}
      </span>
    </div>
  );
}

/* Lo-fi card container with an optional title bar. */
export function WireCard({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-sm border border-neutral-300 bg-white ${className}`}>
      {title && (
        <div className="border-b border-neutral-300 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-neutral-500">
          {title}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
