import type { ReactNode, InputHTMLAttributes, SelectHTMLAttributes } from "react";

/* ---------- Logo ---------- */
export function Logo({ mono = false }: { mono?: boolean }) {
  const c = mono ? "white" : "#0d9488";
  return (
    <div className="flex items-center gap-2.5">
      <svg width="38" height="32" viewBox="0 0 56 40" fill="none" aria-hidden>
        {/* Medical cross outline */}
        <path
          d="M13 0 H25 V13 H38 V27 H25 V40 H13 V27 H0 V13 H13 Z"
          stroke={c} strokeWidth="2.2" fill="none" strokeLinejoin="round"
        />
        {/* ECG / heartbeat line */}
        <path
          d="M0 20 L7 20 L10 13 L13 27 L16 11 L19 20 L38 20"
          stroke={c} strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round"
        />
        {/* Key shaft */}
        <line x1="38" y1="20" x2="56" y2="20" stroke={c} strokeWidth="2.2" strokeLinecap="round"/>
        {/* Key bow (ring) */}
        <circle cx="50" cy="20" r="5.5" stroke={c} strokeWidth="2.2" fill="none"/>
        {/* Key teeth */}
        <line x1="40" y1="20" x2="40" y2="25" stroke={c} strokeWidth="2" strokeLinecap="round"/>
        <line x1="43.5" y1="20" x2="43.5" y2="23.5" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <span className="flex flex-col leading-none">
        <span
          className={`font-display text-[17px] font-bold tracking-tight ${
            mono ? "text-white" : "text-teal-700"
          }`}
        >
          CliniKey
        </span>
        <span
          className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
            mono ? "text-white/60" : "text-ink-soft"
          }`}
        >
          Emergency Health Access
        </span>
      </span>
    </div>
  );
}

/* ---------- Card ---------- */
export function Card({
  title,
  hint,
  accent,
  className = "",
  children,
}: {
  title?: string;
  hint?: ReactNode;
  accent?: "teal" | "emergency" | "neutral";
  className?: string;
  children: ReactNode;
}) {
  const bar =
    accent === "emergency"
      ? "before:bg-emergency-500"
      : accent === "teal"
        ? "before:bg-teal-500"
        : "before:bg-hairline";
  return (
    <section
      className={`relative overflow-hidden rounded-md border border-hairline bg-surface ${
        accent ? `before:absolute before:left-0 before:top-0 before:h-full before:w-1 ${bar}` : ""
      } ${className}`}
    >
      {title && (
        <header className="flex items-center justify-between border-b border-hairline px-5 py-3">
          <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            {title}
          </h3>
          {hint && <div className="text-[12px] text-ink-soft">{hint}</div>}
        </header>
      )}
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

/* ---------- Button ---------- */
type BtnVariant = "primary" | "emergency" | "ghost" | "outline";
export function Button({
  variant = "primary",
  full,
  large,
  children,
  className = "",
  ...rest
}: {
  variant?: BtnVariant;
  full?: boolean;
  large?: boolean;
  children: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants: Record<BtnVariant, string> = {
    primary: "bg-teal-500 text-white hover:bg-teal-600 active:bg-teal-700",
    emergency:
      "bg-emergency-500 text-white hover:bg-emergency-600 active:bg-emergency-700 shadow-[0_1px_0_rgba(0,0,0,0.15)]",
    ghost: "bg-transparent text-ink-soft hover:bg-canvas hover:text-ink",
    outline: "border border-hairline bg-surface text-ink hover:border-teal-500 hover:text-teal-600",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors ${
        large ? "min-h-[52px] px-6 text-[16px]" : "min-h-[44px] px-5 text-[14px]"
      } ${full ? "w-full" : ""} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------- Field ---------- */
export function Field({
  label,
  hint,
  mono,
  className = "",
  ...rest
}: {
  label: string;
  hint?: string;
  mono?: boolean;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
        {label}
      </span>
      <input
        className={`min-h-[44px] rounded-md border border-hairline bg-surface px-3.5 text-[15px] text-ink placeholder:text-ink-soft/50 focus:border-teal-500 ${
          mono ? "font-mono tracking-wide" : ""
        }`}
        {...rest}
      />
      {hint && <span className="text-[12px] text-ink-soft">{hint}</span>}
    </label>
  );
}

export function Select({
  label,
  className = "",
  children,
  ...rest
}: { label: string } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
        {label}
      </span>
      <select
        className="min-h-[44px] rounded-md border border-hairline bg-surface px-3 text-[15px] text-ink focus:border-teal-500"
        {...rest}
      >
        {children}
      </select>
    </label>
  );
}

/* ---------- Badge ---------- */
export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "teal" | "emergency" | "warn" | "ok";
  children: ReactNode;
}) {
  const tones = {
    neutral: "bg-canvas text-ink-soft border-hairline",
    teal: "bg-teal-50 text-teal-700 border-teal-100",
    emergency: "bg-emergency-50 text-emergency-700 border-emergency-100",
    warn: "bg-[#fbf1de] text-[#8a5606] border-[#f0dcb4]",
    ok: "bg-[#e4f5ec] text-[#0a7d4e] border-[#c3e9d3]",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
