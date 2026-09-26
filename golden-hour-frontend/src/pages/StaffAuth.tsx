import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Logo, Button, Field } from "../components/ui";
import ConsentBanner from "../components/ConsentBanner";
import { authApi } from "../services/api";

export default function StaffAuth() {
  const navigate = useNavigate();
  const [hpid, setHpid] = useState("HPID-11-2024-8831-0042");
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...pin];
    next[i] = d;
    setPin(next);
    if (d && i < 5) refs.current[i + 1]?.focus();
  };

  const pinReady = pin.every((d) => d !== "") && hpid.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!pinReady) return;

    setLoading(true);
    const res = await authApi.staffLogin(hpid.trim(), pin.join(""));
    setLoading(false);

    if (res.ok) {
      navigate("/emergency/dashboard");
    } else {
      setError(res.error || "Authentication failed. Invalid HPID or PIN.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <ConsentBanner />

      <main className="grid flex-1 place-items-center px-6 py-10">
        <div className="w-full max-w-[440px]">
          <div className="mb-8 flex justify-center">
            <Logo mono />
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-white/10 bg-surface p-8"
          >
            <div className="mb-6">
              <h1 className="font-display text-[24px] font-bold tracking-tight text-ink">
                Rapid Staff Authentication
              </h1>
              <p className="mt-1 text-[14px] text-ink-soft">
                Verify your identity to open the emergency record.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">
                {error}
              </div>
            )}

            <Field
              label="Health Professional ID · HPID"
              mono
              placeholder="HPID-00-0000-0000-0000"
              value={hpid}
              onChange={(e) => setHpid(e.target.value)}
              autoFocus
              autoComplete="off"
              required
            />

            <div className="mt-5">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                Rapid PIN · 6 digits
              </span>
              <div className="mt-1.5 flex gap-2">
                {pin.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      refs.current[i] = el;
                    }}
                    value={d}
                    onChange={(e) => setDigit(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !pin[i] && i > 0) refs.current[i - 1]?.focus();
                    }}
                    inputMode="numeric"
                    type="password"
                    aria-label={`PIN digit ${i + 1}`}
                    className="h-14 w-full rounded-md border border-hairline bg-canvas text-center font-mono text-[22px] text-ink focus:border-teal-500 focus:bg-surface"
                  />
                ))}
              </div>
            </div>

            <div className="mt-6">
              <Button variant="emergency" large full type="submit" disabled={!pinReady || loading}>
                {loading ? "Verifying Credentials…" : "Open Emergency Record"}
              </Button>
            </div>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-4 w-full text-center text-[13px] text-ink-soft hover:text-ink"
            >
              ← Cancel and return
            </button>
          </form>

          <p className="mt-4 text-center font-mono text-[11px] leading-relaxed text-white/40">
            Access under CliniKey implied-consent protocol · Reg. 2019/ABDM
          </p>
        </div>
      </main>
    </div>
  );
}
