import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Logo, Card, Button, Field, Badge } from "../components/ui";
import { authApi } from "../services/api";

type Step = "identify" | "otp" | "reset" | "done";

export default function ForgotAccess() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("identify");
  const [method, setMethod] = useState<"mobile" | "abha">("mobile");
  const [identifier, setIdentifier] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [otpSentTo, setOtpSentTo] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  const [devOtp, setDevOtp] = useState<string | null>(null);

  const identifierValid = identifier.trim().length >= 4;

  async function handleSendOtp() {
    setError(null);
    if (!identifierValid) return;

    setLoading(true);
    const idParam = method === "abha" && !identifier.includes("@abdm") ? `${identifier}@abdm` : identifier;
    const res = await authApi.forgotSendOtp(method, idParam.trim());
    setLoading(false);

    if (res.ok && res.data) {
      setSessionId(res.data.sessionId);
      setOtpSentTo(res.data.otpSentTo || identifier);
      if (res.data.devOtp) {
        setDevOtp(res.data.devOtp);
        setOtp(res.data.devOtp.split(""));
      } else {
        setOtp(["1", "2", "3", "4", "5", "6"]);
      }
      setStep("otp");
    } else {
      setError(res.error || "No account found with those details.");
    }
  }

  async function handleResend() {
    setLoading(true);
    const idParam = method === "abha" && !identifier.includes("@abdm") ? `${identifier}@abdm` : identifier;
    const res = await authApi.forgotSendOtp(method, idParam.trim());
    setLoading(false);

    if (res.ok) {
      setResent(true);
      if (res.data?.devOtp) {
        setDevOtp(res.data.devOtp);
        setOtp(res.data.devOtp.split(""));
      }
      setTimeout(() => setResent(false), 3000);
    }
  }

  async function handleVerifyOtp() {
    setError(null);
    const otpVal = otp.join("");
    if (otpVal.length < 6) {
      setError("Please enter all 6 digits of the recovery code.");
      return;
    }

    setLoading(true);
    const res = await authApi.forgotVerifyOtp(sessionId, otpVal);
    setLoading(false);

    if (res.ok) {
      setStep("reset");
    } else {
      setError(res.error || "Invalid or expired OTP code.");
    }
  }

  async function handleResetPassword() {
    setError(null);
    if (newPassword.length < 8) {
      setPwError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }
    setPwError("");

    setLoading(true);
    const res = await authApi.forgotResetPassword(sessionId, newPassword, confirmPassword);
    setLoading(false);

    if (res.ok) {
      setStep("done");
    } else {
      setError(res.error || "Failed to reset password.");
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-hairline bg-surface">
        <div className="mx-auto flex max-w-[720px] items-center justify-between px-6 py-4">
          <Logo />
          <button
            onClick={() => navigate("/")}
            className="text-[13px] text-ink-soft hover:text-ink"
          >
            Back to login
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[480px] px-6 py-12">
        <div className="mb-7 text-center">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-600">
            Account Recovery
          </span>
          <h1 className="mt-2 font-display text-[28px] font-bold tracking-tight">
            Recover your access
          </h1>
          <p className="mt-2 text-[14px] text-ink-soft">
            We&apos;ll send a one-time passcode to verify your identity before resetting your
            password.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">
            {error}
          </div>
        )}

        {/* ── Step 1: Identify ── */}
        {step === "identify" && (
          <Card title="Find Your Account" accent="teal">
            <p className="mb-4 text-[14px] text-ink-soft">
              Enter the mobile number or CliniKey address linked to your account.
            </p>

            {/* Method toggle */}
            <div className="mb-4 flex overflow-hidden rounded-md border border-hairline">
              {(["mobile", "abha"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMethod(m); setIdentifier(""); setError(null); }}
                  className={`flex-1 py-2.5 font-mono text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                    method === m
                      ? "bg-teal-500 text-white"
                      : "bg-surface text-ink-soft hover:bg-canvas"
                  }`}
                >
                  {m === "mobile" ? "Mobile Number" : "CliniKey Address"}
                </button>
              ))}
            </div>

            {method === "mobile" ? (
              <Field
                label="Registered mobile number"
                placeholder="+91 98XXX XXXXX"
                mono
                inputMode="tel"
                value={identifier}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIdentifier(e.target.value)}
              />
            ) : (
              <div>
                <label className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                  CliniKey Address
                </label>
                <div className="flex items-stretch overflow-hidden rounded-md border border-hairline focus-within:border-teal-500">
                  <input
                    value={identifier}
                    onChange={(e) =>
                      setIdentifier(e.target.value.replace(/[^a-z0-9._]/gi, "").toLowerCase())
                    }
                    placeholder="yourname.here"
                    className="min-h-[44px] flex-1 bg-surface px-3.5 font-mono text-[15px] text-ink placeholder:text-ink-soft/40"
                  />
                  <span className="grid place-items-center border-l border-hairline bg-canvas px-3.5 font-mono text-[14px] font-semibold text-ink-soft">
                    @abdm
                  </span>
                </div>
              </div>
            )}

            <div className="mt-5 rounded-md border border-[#d4eaf7] bg-[#eef6fc] p-3.5 text-[13px] leading-snug text-[#1a5a7a]">
              <span className="font-semibold">Privacy note: </span>
              An OTP will be sent only to the mobile number registered with this account.
            </div>

            <div className="mt-5">
              <Button
                variant="primary"
                large
                full
                disabled={!identifierValid || loading}
                onClick={handleSendOtp}
              >
                {loading ? "Sending OTP…" : "Send OTP"}
              </Button>
            </div>
          </Card>
        )}

        {/* ── Step 2: OTP Verification ── */}
        {step === "otp" && (
          <Card title="Enter OTP" accent="teal">
            <p className="mb-1 text-[14px] text-ink-soft">
              We sent a 6-digit code to
            </p>
            <p className="mb-4 font-mono text-[15px] font-semibold text-ink">
              {otpSentTo || identifier}
            </p>

            {devOtp && (
              <div className="mb-4 flex items-center justify-between rounded-md border border-teal-200 bg-teal-50 px-3.5 py-2.5 font-mono text-[12px] text-teal-800">
                <span>Demo OTP: <strong>{devOtp}</strong> (or enter <strong>123456</strong>)</span>
                <Badge tone="ok">Auto-filled</Badge>
              </div>
            )}

            <OtpInput otp={otp} setOtp={setOtp} />

            <div className="mt-4 flex items-center justify-between">
              <span className="font-mono text-[12px] text-ink-soft">Didn&apos;t receive it?</span>
              <button
                type="button"
                onClick={handleResend}
                className="font-mono text-[12px] font-semibold uppercase tracking-wide text-teal-600 hover:text-teal-700"
              >
                {resent ? "✓ Resent" : "Resend OTP"}
              </button>
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="ghost" onClick={() => setStep("identify")}>
                Back
              </Button>
              <Button
                variant="primary"
                large
                full
                disabled={otp.some((d) => !d) || loading}
                onClick={handleVerifyOtp}
              >
                {loading ? "Verifying…" : "Verify OTP"}
              </Button>
            </div>
          </Card>
        )}

        {/* ── Step 3: Set New Password ── */}
        {step === "reset" && (
          <Card title="Set New Password" accent="teal" hint={<Badge tone="ok">Identity verified</Badge>}>
            <p className="mb-5 text-[14px] text-ink-soft">
              Create a strong password for your CliniKey account. Minimum 8 characters.
            </p>

            <div className="flex flex-col gap-4">
              <Field
                label="New password"
                type="password"
                placeholder="Min. 8 characters"
                value={newPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setNewPassword(e.target.value);
                  setPwError("");
                }}
              />
              <Field
                label="Confirm new password"
                type="password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setConfirmPassword(e.target.value);
                  setPwError("");
                }}
              />

              {pwError && (
                <p className="rounded-md bg-emergency-50 px-3 py-2 font-mono text-[12px] font-semibold text-emergency-700">
                  {pwError}
                </p>
              )}

              {/* Password strength hint */}
              {newPassword && (
                <PasswordStrength password={newPassword} />
              )}
            </div>

            <div className="mt-6">
              <Button
                variant="primary"
                large
                full
                disabled={!newPassword || !confirmPassword || loading}
                onClick={handleResetPassword}
              >
                {loading ? "Updating Password…" : "Reset Password"}
              </Button>
            </div>
          </Card>
        )}

        {/* ── Step 4: Done ── */}
        {step === "done" && (
          <div className="text-center">
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-[#e4f5ec] text-[30px] text-[#0a7d4e]">
              ✓
            </div>
            <h2 className="font-display text-[24px] font-bold tracking-tight text-ink">
              Password reset successfully
            </h2>
            <p className="mt-2 text-[14px] text-ink-soft">
              Your account password has been updated. You can now log in with your new credentials.
            </p>

            <div className="mt-4 rounded-md border border-[#d4eaf7] bg-[#eef6fc] px-4 py-3 font-mono text-[12px] text-[#1a5a7a]">
              For your security, all active sessions have been signed out.
            </div>

            <div className="mt-8">
              <Button variant="primary" large full onClick={() => navigate("/")}>
                Go to Login
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ── OTP input — 6 cells, auto-advance ── */
function OtpInput({ otp, setOtp }: { otp: string[]; setOtp: (v: string[]) => void }) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  function set(i: number, v: string) {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = d;
    setOtp(next);
    if (d && i < 5) refs.current[i + 1]?.focus();
  }

  return (
    <div className="flex gap-2">
      {otp.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          value={d}
          onChange={(e) => set(i, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus();
          }}
          inputMode="numeric"
          aria-label={`Recovery OTP digit ${i + 1}`}
          className="h-14 w-full rounded-md border border-hairline bg-canvas text-center font-mono text-[22px] text-ink focus:border-teal-500 focus:bg-surface"
        />
      ))}
    </div>
  );
}

/* ── Password strength meter ── */
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /\d/.test(password) },
    { label: "Special character", ok: /[^a-zA-Z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ["bg-emergency-400", "bg-emergency-400", "bg-[#e6a817]", "bg-teal-400", "bg-teal-600"];
  const labels = ["", "Weak", "Weak", "Fair", "Strong"];

  return (
    <div>
      <div className="mb-1.5 flex gap-1">
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className={`h-1.5 flex-1 rounded-full transition-colors ${n <= score ? colors[score] : "bg-hairline"}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {checks.map((c) => (
            <span
              key={c.label}
              className={`font-mono text-[11px] ${c.ok ? "text-teal-600" : "text-ink-soft"}`}
            >
              {c.ok ? "✓" : "○"} {c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span className={`font-mono text-[11px] font-semibold ${score >= 4 ? "text-teal-600" : score === 3 ? "text-[#b07c12]" : "text-emergency-600"}`}>
            {labels[score]}
          </span>
        )}
      </div>
    </div>
  );
}
