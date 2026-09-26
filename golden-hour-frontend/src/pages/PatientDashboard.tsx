import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Logo, Card, Button, Field, Badge } from "../components/ui";
import { patientApi, clearAuthToken } from "../services/api";

type Condition = { id: string; name: string; since?: string; notes?: string };
type AuditLogItem = {
  id: string;
  facilityName: string;
  actorName: string;
  dataAccessed: string;
  tone: "emergency" | "warn" | "ok";
  createdAt: string;
};

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<{
    abhaId: string;
    abhaAddress: string;
    fullName: string;
    bloodGroup: string;
    primaryContact?: string;
    secondaryContact?: string;
    cardRequested?: boolean;
  } | null>(null);

  const [conditions, setConditions] = useState<Condition[]>([]);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSince, setNewSince] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [condSaved, setCondSaved] = useState(false);

  // Contacts
  const [primaryContact, setPrimaryContact] = useState("");
  const [secondaryContact, setSecondaryContact] = useState("");
  const [contactsSaved, setContactsSaved] = useState(false);

  // Card Request
  const [cardRequested, setCardRequested] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [profileRes, logsRes] = await Promise.all([
        patientApi.getProfile(),
        patientApi.getAuditLogs(1, 20),
      ]);
      setLoading(false);

      if (profileRes.ok && profileRes.data) {
        const p = profileRes.data.patient;
        setPatient(p);
        setConditions(profileRes.data.conditions || []);
        setPrimaryContact(p.primaryContact || "");
        setSecondaryContact(p.secondaryContact || "");
        setCardRequested(!!p.cardRequested);
      } else {
        // Token might be expired
        clearAuthToken();
        navigate("/");
      }

      if (logsRes.ok && logsRes.data) {
        setLogs(logsRes.data.logs || []);
      }
    }

    loadData();
  }, [navigate]);

  async function addCondition() {
    if (!newName.trim()) return;
    const res = await patientApi.addCondition({
      name: newName.trim(),
      since: newSince.trim() || undefined,
      notes: newNotes.trim() || undefined,
    });

    if (res.ok && res.data?.condition) {
      setConditions((prev) => [...prev, res.data!.condition]);
      setNewName("");
      setNewSince("");
      setNewNotes("");
      setShowAddForm(false);
      setCondSaved(true);
      setTimeout(() => setCondSaved(false), 2500);
    }
  }

  async function removeCondition(id: string) {
    const res = await patientApi.removeCondition(id);
    if (res.ok) {
      setConditions((prev) => prev.filter((c) => c.id !== id));
    }
  }

  async function handleSaveContacts(e: React.FormEvent) {
    e.preventDefault();
    const res = await patientApi.updateEmergencyContacts(primaryContact, secondaryContact);
    if (res.ok) {
      setContactsSaved(true);
      setTimeout(() => setContactsSaved(false), 3000);
    }
  }

  async function handleRequestCard() {
    const res = await patientApi.requestCard();
    if (res.ok) {
      setCardRequested(true);
    } else {
      alert(res.error || "Card already requested");
    }
  }

  function handleSignOut() {
    clearAuthToken();
    navigate("/");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-hairline bg-surface">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-3">
            <Badge tone="ok">Portal Active</Badge>
            <span className="hidden font-mono text-[12px] text-ink-soft sm:block">
              {patient?.fullName || "Patient"}
            </span>
            <Button variant="ghost" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center font-mono text-ink-soft">
          Loading your health records…
        </div>
      ) : (
        <main className="mx-auto max-w-[1120px] px-6 py-8">
          <div className="mb-6">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-600">
              My Health Account · {patient?.abhaAddress || ""}
            </span>
            <h1 className="mt-1 font-display text-[26px] font-bold tracking-tight">
              Welcome back, {patient?.fullName ? patient.fullName.split(" ")[0] : "Patient"}
            </h1>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            {/* My Conditions */}
            <div className="lg:col-span-2">
              <Card title="My Medical Conditions" accent="teal" hint="Visible to emergency responders">
                {condSaved && (
                  <div className="mb-3 rounded-md bg-teal-50 px-3 py-2 font-mono text-[12px] font-semibold text-teal-700">
                    ✓ Condition saved to your record
                  </div>
                )}
                {conditions.length === 0 && (
                  <p className="mb-3 text-[14px] text-ink-soft">No conditions added yet.</p>
                )}
                <ul className="mb-4 flex flex-col divide-y divide-hairline">
                  {conditions.map((c) => (
                    <li key={c.id} className="flex items-start justify-between gap-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-semibold text-ink">{c.name}</p>
                        <p className="mt-0.5 text-[13px] text-ink-soft">
                          {c.since && <span>Since {c.since}{c.notes ? " · " : ""}</span>}
                          {c.notes}
                        </p>
                      </div>
                      <button
                        onClick={() => removeCondition(c.id)}
                        className="mt-0.5 shrink-0 font-mono text-[12px] text-ink-soft hover:text-emergency-600"
                        aria-label={`Remove ${c.name}`}
                      >
                        ✕ Remove
                      </button>
                    </li>
                  ))}
                </ul>

                {showAddForm ? (
                  <div className="rounded-md border border-hairline bg-canvas p-4">
                    <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                      Add New Condition
                    </p>
                    <div className="flex flex-col gap-3">
                      <Field
                        label="Condition / Disease name *"
                        placeholder="e.g. Asthma, Hypothyroidism"
                        value={newName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)}
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field
                          label="Diagnosed since (year)"
                          placeholder="e.g. 2019"
                          value={newSince}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSince(e.target.value)}
                        />
                        <Field
                          label="Notes (optional)"
                          placeholder="e.g. Controlled with inhaler"
                          value={newNotes}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewNotes(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="primary" onClick={addCondition} disabled={!newName.trim()}>
                          Save Condition
                        </Button>
                        <Button variant="ghost" onClick={() => setShowAddForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => setShowAddForm(true)}>
                    + Add a Condition
                  </Button>
                )}
              </Card>
            </div>

            {/* Access logs */}
            <Card title="Emergency Access Logs" accent="emergency" hint="Who opened your record">
              {logs.length === 0 ? (
                <p className="py-4 text-center text-[13px] text-ink-soft font-mono">
                  No access records yet.
                </p>
              ) : (
                <ul className="flex flex-col divide-y divide-hairline">
                  {logs.map((l) => (
                    <li key={l.id} className="flex items-start justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="text-[15px] font-semibold text-ink">{l.facilityName}</p>
                        <p className="text-[13px] text-ink-soft">
                          {l.dataAccessed} · <span className="text-ink-soft">{l.actorName}</span>
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <Badge tone={l.tone}>
                          {l.tone === "emergency" ? "Emergency" : l.tone === "warn" ? "Field access" : "Self"}
                        </Badge>
                        <p className="mt-1 font-mono text-[11px] text-ink-soft tabular">
                          {new Date(l.createdAt).toLocaleDateString()} · {new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <div className="flex flex-col gap-6">
              {/* Emergency contacts settings */}
              <Card title="Account Settings · Emergency Contacts">
                <form className="flex flex-col gap-4" onSubmit={handleSaveContacts}>
                  <Field
                    label="Primary contact"
                    mono
                    value={primaryContact}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setPrimaryContact(e.target.value);
                      setContactsSaved(false);
                    }}
                    placeholder="+91 98220 45210"
                  />
                  <Field
                    label="Secondary contact"
                    mono
                    value={secondaryContact}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setSecondaryContact(e.target.value);
                      setContactsSaved(false);
                    }}
                    placeholder="+91 90040 88455"
                  />
                  <Button variant="primary" full type="submit">
                    {contactsSaved ? "✓ Contacts updated in database" : "Save contact numbers"}
                  </Button>
                </form>
              </Card>

              {/* Replacement card */}
              <Card title="Physical CliniKey Card" accent="teal">
                <p className="text-[14px] text-ink-soft">
                  Lost or damaged your card? Request a printed replacement delivered to your
                  registered address.
                </p>
                <div className="mt-4">
                  <Button
                    variant={cardRequested ? "outline" : "emergency"}
                    large
                    full
                    disabled={cardRequested}
                    onClick={handleRequestCard}
                  >
                    {cardRequested
                      ? "✓ Replacement requested · ETA 5–7 days"
                      : "Request Replacement Card"}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
