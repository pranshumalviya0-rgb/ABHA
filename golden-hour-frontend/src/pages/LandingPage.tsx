import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Logo, Button, Field } from "../components/ui";
import { authApi, setTargetAbhaId } from "../services/api";

export default function LandingPage() {
  const navigate = useNavigate();
  const [abha, setAbha] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Patient Login State
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const digits = abha.replace(/\D/g, "").slice(0, 14);
  const grouped = digits.replace(/(.{4})(.{4})(.{4})(.{2}).*/, "$1 $2 $3 $4").trim();
  const valid = digits.length === 14;

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const openCamera = async () => {
    setCameraError(null);
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      // Simulate a successful QR read, then continue to staff authentication.
      window.setTimeout(() => {
        stopCamera();
        setTargetAbhaId(digits || "12345678901234");
        navigate("/emergency/auth");
      }, 2600);
    } catch {
      setCameraError("Camera access was blocked. Enable it or enter the CliniKey ID manually.");
    }
  };

  const closeCamera = () => {
    stopCamera();
    setCameraOpen(false);
  };

  const handleEmergencyNext = () => {
    if (valid) {
      setTargetAbhaId(digits);
      navigate("/emergency/auth");
    }
  };

  const handlePatientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!identifier || !password) {
      setLoginError("Please enter your Mobile/ABHA Address and Password");
      return;
    }

    setLoginLoading(true);
    const res = await authApi.patientLogin(identifier, password);
    setLoginLoading(false);

    if (res.ok) {
      navigate("/patient");
    } else {
      setLoginError(res.error || "Login failed. Please verify credentials.");
    }
  };

  useEffect(() => stopCamera, []);

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-5">
        <Logo />
        <nav className="flex items-center gap-6 text-[13px] text-ink-soft">
          <button
            type="button"
            onClick={() => navigate("/about")}
            className="hidden hover:text-ink sm:block"
          >
            About CliniKey
          </button>
          <button
            type="button"
            onClick={() => navigate("/help")}
            className="hidden hover:text-ink sm:block"
          >
            Help &amp; FAQ
          </button>
          <button
            type="button"
            onClick={() => navigate("/wireframes")}
            className="hidden hover:text-ink sm:block"
          >
            Wireframes
          </button>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-teal-600">
            IN · CliniKey Network
          </span>
        </nav>
      </header>

      <main className="mx-auto grid max-w-[1240px] gap-6 px-6 pb-16 lg:grid-cols-[1.35fr_1fr]">
        {/* Emergency path — primary visual */}
        <section className="relative overflow-hidden rounded-lg border border-emergency-100 bg-surface">
          <div className="flex items-center gap-2 border-b border-emergency-100 bg-emergency-50 px-6 py-3">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emergency-500" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-emergency-700">
              Emergency Responder Access
            </span>
          </div>

          <div className="p-8">
            <h1 className="font-display text-[34px] font-bold leading-[1.05] tracking-tight text-ink">
              Every second counts. CliniKey saves them.
            </h1>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-ink-soft">
              Scan the patient&apos;s CliniKey QR code or enter their CliniKey ID to instantly pull
              life-critical medical data — blood group, verified allergies, and current medications.
            </p>

            {/* Camera QR scan */}
            <div className="mt-7">
              <Button variant="emergency" large full onClick={openCamera}>
                <span aria-hidden>▣</span> Scan CliniKey QR with Camera
              </Button>
              <p className="mt-1.5 text-center font-mono text-[11px] text-ink-soft">
                Opens your device camera to scan the patient&apos;s card
              </p>
            </div>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-hairline" />
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
                or enter manually
              </span>
              <span className="h-px flex-1 bg-hairline" />
            </div>

            {/* Manual CliniKey */}
            <label className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
              Manual CliniKey ID · 14 digits
            </label>
            <input
              value={grouped}
              onChange={(e) => setAbha(e.target.value)}
              inputMode="numeric"
              placeholder="0000 0000 0000 00"
              className="min-h-[52px] w-full rounded-md border border-hairline bg-surface px-4 font-mono text-[18px] tracking-[0.12em] text-ink placeholder:text-ink-soft/40 focus:border-emergency-500 tabular"
            />
            <div className="mb-4 mt-1.5">
              <span className="font-mono text-[11px] text-ink-soft tabular">{digits.length}/14</span>
            </div>

            <Button variant="emergency" large full disabled={!valid} onClick={handleEmergencyNext}>
              Next →
            </Button>
          </div>
        </section>

        {/* Standard portal */}
        <aside className="flex flex-col gap-6">
          <div className="rounded-lg border border-hairline bg-surface p-8">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-600">
              Patient Portal
            </span>
            <h2 className="mt-2 font-display text-[22px] font-bold tracking-tight">
              Patient Login
            </h2>
            <p className="mt-1.5 text-[14px] text-ink-soft">
              For conscious patients to view and manage their own health record.
            </p>

            {loginError && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">
                {loginError}
              </div>
            )}

            <form className="mt-6 flex flex-col gap-4" onSubmit={handlePatientLogin}>
              <Field
                label="Mobile / CliniKey Address"
                placeholder="you@abdm or mobile number"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
              <Field
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button variant="primary" full type="submit" disabled={loginLoading}>
                {loginLoading ? "Authenticating…" : "Login"}
              </Button>
            </form>

            <div className="mt-4 flex items-center justify-between text-[13px]">
              <button
                type="button"
                onClick={() => navigate("/forgot-access")}
                className="text-teal-600 hover:underline"
              >
                Forgot access?
              </button>
              <button
                type="button"
                onClick={() => navigate("/create-abha")}
                className="text-ink-soft hover:text-ink"
              >
                Create CliniKey
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-hairline bg-teal-50 p-6">
            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-700">
              Administrator tools
            </h3>
            <div className="mt-3 flex flex-col gap-2">
              <Button variant="outline" full onClick={() => navigate("/facility/auth")}>
                Post-Care Discharge Entry
              </Button>
            </div>
          </div>
        </aside>
      </main>

      {/* Camera scan overlay */}
      {cameraOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/90 p-6"
          role="dialog"
          aria-label="Scan CliniKey QR code"
        >
          <div className="w-full max-w-[420px]">
            <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-emergency-500 bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
              {/* Framing corners */}
              {[
                "left-5 top-5 border-l-2 border-t-2",
                "right-5 top-5 border-r-2 border-t-2",
                "left-5 bottom-5 border-b-2 border-l-2",
                "right-5 bottom-5 border-b-2 border-r-2",
              ].map((c) => (
                <span key={c} className={`absolute h-12 w-12 border-emergency-500 ${c}`} />
              ))}
              {!cameraError && (
                <span className="absolute inset-x-8 top-8 h-0.5 animate-[scan_1.3s_ease-in-out_infinite] bg-emergency-500 shadow-[0_0_16px_4px_rgba(213,36,29,0.6)]" />
              )}
            </div>
            <p className="mt-4 text-center font-mono text-[12px] uppercase tracking-[0.16em] text-white/80">
              {cameraError ? "Camera unavailable" : "Align the CliniKey QR code within the frame…"}
            </p>
            {cameraError && (
              <p className="mt-2 text-center text-[13px] text-white/70">{cameraError}</p>
            )}
            <div className="mt-5">
              <Button variant="ghost" full onClick={closeCamera} className="text-white hover:bg-white/10 hover:text-white">
                Cancel scan
              </Button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes scan{0%{top:2rem}50%{top:calc(100% - 2rem)}100%{top:2rem}}`}</style>
    </div>
  );
}
