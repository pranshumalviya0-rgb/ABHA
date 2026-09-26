import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Logo, Card, Button, Field, Badge } from "../components/ui";
import { abhaApi } from "../services/api";

type Step = 1 | 2 | 3 | 4;

const STEPS = ["Identity", "Verify OTP", "Medical Details", "Card"];

export default function CreateAbha() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [idNumber, setIdNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("+91 98220 45210");
  const [consent, setConsent] = useState(false);
  const [handle, setHandle] = useState("");
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);

  // Backend Registration tracking
  const [registrationId, setRegistrationId] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSentTo, setOtpSentTo] = useState("");
  const [createdPatient, setCreatedPatient] = useState<{
    abhaId: string;
    abhaAddress: string;
    fullName: string;
    bloodGroup: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  // Step 3 — manual medical profile
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  const [devOtp, setDevOtp] = useState<string | null>(null);

  const idDigits = idNumber.replace(/\D/g, "").slice(0, 12);
  const idGrouped = idDigits.replace(/(.{4})(.{4})(.{4}).*/, "$1 - $2 - $3").replace(/[\s-]+$/, "");
  const idValid = idDigits.length === 12;

  // Step 1: Send OTP
  async function handleSendOtp() {
    setStepError(null);
    if (!idValid || !consent) return;

    setLoading(true);
    const res = await abhaApi.sendOtp(idDigits, mobileNumber.replace(/\s+/g, ""), consent);
    setLoading(false);

    if (res.ok && res.data) {
      setRegistrationId(res.data.registrationId);
      setOtpSentTo(res.data.otpSentTo || mobileNumber);
      if (res.data.devOtp) {
        setDevOtp(res.data.devOtp);
        setOtp(res.data.devOtp.split(""));
      } else {
        setOtp(["1", "2", "3", "4", "5", "6"]);
      }
      setStep(2);
    } else {
      setStepError(res.error || "Failed to send registration OTP.");
    }
  }

  // Step 2: Verify OTP
  async function handleVerifyOtp() {
    setStepError(null);
    const otpVal = otp.join("");
    if (otpVal.length < 6) {
      setStepError("Please enter all 6 digits of the OTP.");
      return;
    }

    setLoading(true);
    const res = await abhaApi.verifyOtp(registrationId, otpVal);
    setLoading(false);

    if (res.ok) {
      setStep(3);
    } else {
      setStepError(res.error || "Invalid or expired OTP.");
    }
  }

  // Live handle check
  async function handleCheckAddress(cleanHandle: string) {
    if (cleanHandle.length < 3) {
      setHandleAvailable(null);
      return;
    }
    const res = await abhaApi.checkAddress(cleanHandle);
    if (res.ok && res.data) {
      setHandleAvailable(res.data.available);
    }
  }

  function validateProfile() {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = "Full name is required";
    if (!dob) errs.dob = "Date of birth is required";
    if (!gender) errs.gender = "Gender is required";
    if (!address.trim()) errs.address = "Address is required";
    if (!bloodGroup) errs.bloodGroup = "Blood group is required";
    if (!password) errs.password = "Password is required";
    else if (password.length < 8) errs.password = "Password must be at least 8 characters";
    if (password && confirmPassword && password !== confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    if (password.length >= 8 && !confirmPassword) errs.confirmPassword = "Please confirm your password";
    return errs;
  }

  // Step 3: Finalize & Create
  async function handleProfileContinue() {
    setStepError(null);
    const errs = validateProfile();
    if (Object.keys(errs).length > 0) {
      setProfileErrors(errs);
      return;
    }
    setProfileErrors({});

    setLoading(true);
    const res = await abhaApi.createAbha({
      registrationId,
      fullName: fullName.trim(),
      dob,
      gender,
      address: address.trim(),
      bloodGroup,
      abhaHandle: handle.trim().toLowerCase(),
      password,
      weight_kg: weight ? Number(weight) : undefined,
      height_cm: height ? Number(height) : undefined,
      emergencyContact: emergencyContact ? emergencyContact.trim() : undefined,
    });
    setLoading(false);

    if (res.ok && res.data) {
      setCreatedPatient(res.data);
      setStep(4);
    } else {
      setStepError(res.error || "Failed to create ABHA record. Handle might be taken.");
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
            Cancel
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[560px] px-6 py-8">
        {/* Stepper */}
        <ol className="mb-7 flex items-center gap-2">
          {STEPS.map((label, i) => {
            const n = (i + 1) as Step;
            const done = step > n;
            const active = step === n;
            return (
              <li key={label} className="flex flex-1 items-center gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full font-mono text-[12px] font-semibold ${
                      active
                        ? "bg-teal-500 text-white"
                        : done
                          ? "bg-teal-50 text-teal-700"
                          : "bg-canvas text-ink-soft"
                    }`}
                  >
                    {done ? "✓" : n}
                  </span>
                  <span
                    className={`hidden text-[12px] font-medium sm:block ${
                      active ? "text-ink" : "text-ink-soft"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && <span className="h-px flex-1 bg-hairline" />}
              </li>
            );
          })}
        </ol>

        {stepError && (
          <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">
            {stepError}
          </div>
        )}

        {/* ── Step 1 — Identity & Consent ── */}
        {step === 1 && (
          <Card title="Aadhaar Verification" accent="teal">
            <p className="mb-5 text-[14px] text-ink-soft">
              Enter your 12-digit Aadhaar number and mobile number to verify your identity via instant e-KYC and
              create your CliniKey.
            </p>

            <div>
              <label className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                Aadhaar Number · 12 digits
              </label>
              <input
                value={idGrouped}
                onChange={(e) => setIdNumber(e.target.value)}
                inputMode="numeric"
                placeholder="XXXX - XXXX - XXXX"
                className="min-h-[52px] w-full rounded-md border border-hairline bg-surface px-4 font-mono text-[18px] tracking-[0.1em] text-ink placeholder:text-ink-soft/40 focus:border-teal-500 tabular"
              />
              <span className="mt-1.5 block font-mono text-[11px] text-ink-soft tabular">
                {idDigits.length}/12
              </span>
            </div>

            <div className="mt-4">
              <Field
                label="Registered Mobile Number"
                mono
                value={mobileNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMobileNumber(e.target.value)}
                placeholder="+91 98220 45210"
                required
              />
            </div>

            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-md border border-hairline bg-canvas p-3.5">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-teal-500"
              />
              <span className="text-[13px] leading-snug text-ink">
                I voluntarily agree to share my demographic data with the{" "}
                <span className="font-semibold">National Health Authority (NHA)</span>.
              </span>
            </label>

            <div className="mt-6">
              <Button
                variant="primary"
                large
                full
                disabled={!idValid || !consent || loading}
                onClick={handleSendOtp}
              >
                {loading ? "Sending OTP…" : "Send OTP to linked mobile"}
              </Button>
            </div>
          </Card>
        )}

        {/* ── Step 2 — OTP ── */}
        {step === 2 && (
          <Card title="Mobile Authentication" accent="teal">
            <p className="mb-4 text-[14px] text-ink-soft">
              Enter the 6-digit OTP sent to your linked mobile ({otpSentTo || mobileNumber}).
            </p>

            {devOtp && (
              <div className="mb-4 flex items-center justify-between rounded-md border border-teal-200 bg-teal-50 px-3.5 py-2.5 font-mono text-[12px] text-teal-800">
                <span>Demo OTP: <strong>{devOtp}</strong> (or enter <strong>123456</strong>)</span>
                <Badge tone="ok">Auto-filled</Badge>
              </div>
            )}

            <OtpInput otp={otp} setOtp={setOtp} />

            <div className="mt-3 flex items-center justify-between">
              <span className="font-mono text-[12px] text-ink-soft">Didn&apos;t receive it?</span>
              <button
                type="button"
                onClick={handleSendOtp}
                className="font-mono text-[12px] font-semibold uppercase tracking-wide text-teal-600 hover:text-teal-700"
              >
                Resend OTP
              </button>
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                variant="primary"
                large
                full
                disabled={otp.some((d) => !d) || loading}
                onClick={handleVerifyOtp}
              >
                {loading ? "Verifying…" : "Verify & Continue"}
              </Button>
            </div>
          </Card>
        )}

        {/* ── Step 3 — Manual Medical Details ── */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <Card
              title="Your Medical Profile"
              accent="teal"
              hint={<Badge tone="teal">Manual entry</Badge>}
            >
              <p className="mb-4 text-[14px] text-ink-soft">
                Please fill in your personal and medical details. This information will be visible
                to emergency responders.
              </p>

              <div className="flex flex-col gap-4">
                {/* Personal details */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field
                      label="Full Name *"
                      placeholder="As on Aadhaar"
                      value={fullName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                    />
                    {profileErrors.fullName && (
                      <p className="mt-1 font-mono text-[11px] text-emergency-600">{profileErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="min-h-[44px] w-full rounded-md border border-hairline bg-surface px-3 font-mono text-[14px] text-ink focus:border-teal-500"
                    />
                    {profileErrors.dob && (
                      <p className="mt-1 font-mono text-[11px] text-emergency-600">{profileErrors.dob}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                      Gender *
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="min-h-[44px] w-full rounded-md border border-hairline bg-surface px-3 font-mono text-[14px] text-ink focus:border-teal-500"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                    {profileErrors.gender && (
                      <p className="mt-1 font-mono text-[11px] text-emergency-600">{profileErrors.gender}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Field
                    label="Residential Address *"
                    placeholder="Street, City, State, PIN code"
                    value={address}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
                  />
                  {profileErrors.address && (
                    <p className="mt-1 font-mono text-[11px] text-emergency-600">{profileErrors.address}</p>
                  )}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 py-1">
                  <span className="h-px flex-1 bg-hairline" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">Medical Info</span>
                  <span className="h-px flex-1 bg-hairline" />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                      Blood Group *
                    </label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="min-h-[44px] w-full rounded-md border border-hairline bg-surface px-3 font-mono text-[14px] text-ink focus:border-teal-500"
                    >
                      <option value="">Select</option>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                    {profileErrors.bloodGroup && (
                      <p className="mt-1 font-mono text-[11px] text-emergency-600">{profileErrors.bloodGroup}</p>
                    )}
                  </div>

                  <div>
                    <Field
                      label="Weight (kg)"
                      placeholder="70"
                      inputMode="numeric"
                      value={weight}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWeight(e.target.value)}
                    />
                  </div>

                  <div>
                    <Field
                      label="Height (cm)"
                      placeholder="175"
                      inputMode="numeric"
                      value={height}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHeight(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Field
                    label="Emergency Contact Number"
                    placeholder="+91 98XXX XXXXX"
                    mono
                    inputMode="tel"
                    value={emergencyContact}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmergencyContact(e.target.value)}
                  />
                </div>
              </div>
            </Card>

            <Card title="Create Your CliniKey Address">
              <p className="mb-3 text-[14px] text-ink-soft">
                Pick a custom identifier you&apos;ll use to log in and share your record.
              </p>
              <label className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                CliniKey Address
              </label>
              <div className="flex items-stretch overflow-hidden rounded-md border border-hairline focus-within:border-teal-500">
                <input
                  value={handle}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^a-z0-9._]/gi, "").toLowerCase();
                    setHandle(clean);
                    handleCheckAddress(clean);
                  }}
                  placeholder="yourname.here"
                  className="min-h-[48px] flex-1 bg-surface px-3.5 font-mono text-[15px] text-ink placeholder:text-ink-soft/40"
                />
                <span className="grid place-items-center border-l border-hairline bg-canvas px-3.5 font-mono text-[15px] font-semibold text-ink-soft">
                  @abdm
                </span>
              </div>
              {handle.length >= 3 && handleAvailable !== null && (
                <p
                  className={`mt-1 font-mono text-[11px] ${
                    handleAvailable ? "text-teal-600" : "text-red-600"
                  }`}
                >
                  {handleAvailable ? "✓ Handle is available" : "✕ Handle already taken"}
                </p>
              )}

              <div className="mt-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-hairline" />
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">Account Password</span>
                <span className="h-px flex-1 bg-hairline" />
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                    Create Password *
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setProfileErrors((p) => ({ ...p, password: "" })); }}
                    placeholder="Min. 8 characters"
                    className={`min-h-[44px] rounded-md border bg-surface px-3.5 text-[15px] text-ink placeholder:text-ink-soft/40 focus:outline-none ${profileErrors.password ? "border-emergency-400" : "border-hairline focus:border-teal-500"}`}
                  />
                  {profileErrors.password && (
                    <span className="font-mono text-[11px] text-emergency-600">{profileErrors.password}</span>
                  )}
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                    Confirm Password *
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setProfileErrors((p) => ({ ...p, confirmPassword: "" })); }}
                    placeholder="Repeat your password"
                    className={`min-h-[44px] rounded-md border bg-surface px-3.5 text-[15px] text-ink placeholder:text-ink-soft/40 focus:outline-none ${profileErrors.confirmPassword ? "border-emergency-400" : "border-hairline focus:border-teal-500"}`}
                  />
                  {profileErrors.confirmPassword && (
                    <span className="font-mono text-[11px] text-emergency-600">{profileErrors.confirmPassword}</span>
                  )}
                </label>

                {password && <PasswordStrength password={password} />}
              </div>

              <div className="mt-6 flex gap-3">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  large
                  full
                  disabled={!handle || handleAvailable === false || loading}
                  onClick={handleProfileContinue}
                >
                  {loading ? "Generating Record…" : "Generate CliniKey Card"}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* ── Step 4 — Success ── */}
        {step === 4 && (
          <div className="text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#e4f5ec] text-[26px] text-[#0a7d4e]">
              ✓
            </div>
            <h1 className="font-display text-[26px] font-bold tracking-tight">
              Your CliniKey is ready!
            </h1>
            <p className="mt-1 text-[14px] text-ink-soft">
              Your CliniKey Health Account has been created and saved to the live network.
            </p>

            {/* Digital card */}
            <div className="relative mt-6 overflow-hidden rounded-xl border border-teal-700 bg-teal-700 p-5 text-left text-white shadow-lg">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_55%)]" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/70">
                    CliniKey Health Account
                  </p>
                  <p className="mt-3 font-mono text-[20px] font-bold tracking-[0.12em] tabular">
                    {createdPatient?.abhaId || "12-3456-7890-1234"}
                  </p>
                  <p className="mt-1 font-mono text-[13px] text-white/85">
                    {createdPatient?.abhaAddress || (handle + "@abdm")}
                  </p>
                </div>
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-md bg-white p-1.5">
                  <QrGlyph />
                </div>
              </div>
              <div className="relative mt-4 flex items-end justify-between border-t border-white/15 pt-3">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/60">Name</p>
                  <p className="text-[14px] font-semibold">{createdPatient?.fullName || fullName || "—"}</p>
                </div>
                {(createdPatient?.bloodGroup || bloodGroup) && (
                  <div className="text-right">
                    <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/60">Blood</p>
                    <p className="font-mono text-[14px] font-bold">{createdPatient?.bloodGroup || bloodGroup}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-2.5">
              <Button variant="primary" large full onClick={() => navigate("/patient")}>
                Go to Patient Dashboard
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* Segmented 6-digit OTP */
function OtpInput({ otp, setOtp }: { otp: string[]; setOtp: (v: string[]) => void }) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const set = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = d;
    setOtp(next);
    if (d && i < 5) refs.current[i + 1]?.focus();
  };
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
          aria-label={`OTP digit ${i + 1}`}
          className="h-14 w-full rounded-md border border-hairline bg-canvas text-center font-mono text-[22px] text-ink focus:border-teal-500 focus:bg-surface"
        />
      ))}
    </div>
  );
}

/* Password strength meter */
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ chars", ok: password.length >= 8 },
    { label: "Uppercase", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /\d/.test(password) },
    { label: "Special char", ok: /[^a-zA-Z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ["bg-emergency-400", "bg-emergency-400", "bg-emergency-400", "bg-[#e6a817]", "bg-teal-500"];
  const labels = ["", "Weak", "Weak", "Fair", "Strong"];
  return (
    <div>
      <div className="mb-1.5 flex gap-1">
        {[1, 2, 3, 4].map((n) => (
          <span key={n} className={`h-1.5 flex-1 rounded-full transition-colors ${n <= score ? colors[score] : "bg-hairline"}`} />
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          {checks.map((c) => (
            <span key={c.label} className={`font-mono text-[11px] ${c.ok ? "text-teal-600" : "text-ink-soft"}`}>
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

/* Simple decorative QR placeholder */
function QrGlyph() {
  return (
    <div className="grid h-full w-full grid-cols-5 grid-rows-5 gap-px">
      {Array.from({ length: 25 }).map((_, i) => {
        const on = [0, 1, 2, 4, 5, 7, 9, 10, 12, 14, 15, 18, 20, 22, 23, 24].includes(i);
        return <span key={i} className={on ? "bg-teal-700" : "bg-transparent"} />;
      })}
    </div>
  );
}
