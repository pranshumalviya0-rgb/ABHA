export default function ConsentBanner({ context }: { context?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 bg-emergency-600 px-4 py-2.5 text-white"
    >
      <span className="grid h-5 w-5 shrink-0 animate-pulse place-items-center rounded-full bg-white/20 text-[11px] font-bold">
        !
      </span>
      <p className="text-[13px] leading-snug">
        <span className="font-semibold">Emergency access is being recorded.</span>{" "}
        <span className="text-white/80">
          {context ??
            "This session is logged under implied consent (CliniKey protocol). The patient will see your identity, facility, and timestamp."}
        </span>
      </p>
      <span className="ml-auto hidden shrink-0 font-mono text-[11px] text-white/70 sm:block tabular">
        LOG&nbsp;#CK-{new Date().getFullYear()}-04812
      </span>
    </div>
  );
}
