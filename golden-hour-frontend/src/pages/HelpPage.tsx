import { useState } from "react";
import { useNavigate } from "react-router";
import { Logo, Card, Button, Badge } from "../components/ui";

type FAQItem = {
  q: string;
  a: string;
  category: "patient" | "responder" | "facility";
};

const FAQS: FAQItem[] = [
  {
    category: "patient",
    q: "What is CliniKey and why do I need one?",
    a: "CliniKey is an emergency health access identifier linked to your 14-digit ABHA number. In the event of a medical emergency or accident where you are unconscious, paramedics can scan your CliniKey card to immediately know your blood group, life-threatening drug allergies, and active medications, preventing fatal clinical errors during the Golden Hour.",
  },
  {
    category: "patient",
    q: "How do I create a CliniKey account?",
    a: "Click on 'Create CliniKey' on the home page. Enter your 12-digit Aadhaar number and registered mobile number to verify via a one-time passcode (OTP). Then fill in your basic medical details, pick your custom @abdm address, and your digital card is immediately ready.",
  },
  {
    category: "patient",
    q: "What should I do if I lose my physical CliniKey card?",
    a: "Log in to your Patient Dashboard and click on 'Request Replacement Card'. A newly printed card with your verified QR code will be dispatched to your registered address within 5–7 business days.",
  },
  {
    category: "patient",
    q: "How do I know who has accessed my emergency medical record?",
    a: "Every time a doctor or paramedic views your emergency record, an immutable audit log entry is saved. You can see the full chronological history with the hospital name, doctor's HPID, and exact timestamp directly on your Patient Dashboard under 'Emergency Access Logs'.",
  },
  {
    category: "responder",
    q: "How do paramedics and emergency responders access a patient's record?",
    a: "Paramedics can tap 'Scan CliniKey QR with Camera' on any mobile device or tablet to scan the patient's card, or manually type in the 14-digit CliniKey number. After authenticating with their HPID (Health Professional ID) and 6-digit rapid PIN, the emergency dashboard opens in under 2 seconds.",
  },
  {
    category: "responder",
    q: "How does the 'Notify Family' button work?",
    a: "When you tap 'Notify Family Now' on the Emergency Dashboard, the system instantly sends emergency SMS alerts and automated text-to-speech phone calls to the patient's primary and secondary kin registered in the national health database.",
  },
  {
    category: "facility",
    q: "How do hospital staff enter post-care discharge data?",
    a: "Authorized hospital records personnel navigate to 'Post-Care Discharge Entry', log in with their HFR ID (Health Facility Registry) and Employee ID, and fill in clinically verified details for severe allergies, diabetes metrics, implants (with MRI safety class), blood thinners, and APINCHS high-risk medications.",
  },
  {
    category: "facility",
    q: "What are APINCHS high-risk medication categories?",
    a: "APINCHS is the international standard for high-alert medications: Anti-infectives/Aminoglycosides, Potassium & Electrolytes, Insulin, Narcotics & Sedatives, Chemotherapy agents, Heparin & Anticoagulants, and Systems/Psychotropics. Recording these ensures future emergency doctors avoid lethal drug interactions.",
  },
];

export default function HelpPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"all" | "patient" | "responder" | "facility">("all");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = activeTab === "all" ? FAQS : FAQS.filter((f) => f.category === activeTab);

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="border-b border-hairline bg-surface">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/about")}>
              About CliniKey
            </Button>
            <Button variant="primary" onClick={() => navigate("/")}>
              ← Back to Portal
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[960px] px-6 py-12">
        <div className="mb-10 text-center">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-600">
            Help Center &amp; Documentation
          </span>
          <h1 className="mt-2 font-display text-[36px] font-bold tracking-tight text-ink">
            Frequently Asked Questions
          </h1>
          <p className="mt-2 text-[15px] text-ink-soft">
            Everything you need to know about using the CliniKey Golden Hour emergency network.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="mb-8 flex justify-center gap-2">
          {(
            [
              { id: "all", label: "All Questions" },
              { id: "patient", label: "For Patients" },
              { id: "responder", label: "For Responders" },
              { id: "facility", label: "For Hospitals" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setOpenIndex(null);
              }}
              className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${
                activeTab === tab.id
                  ? "bg-teal-500 text-white"
                  : "border border-hairline bg-surface text-ink-soft hover:bg-canvas hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="flex flex-col gap-3">
          {filteredFaqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="overflow-hidden rounded-lg border border-hairline bg-surface transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between p-5 text-left font-semibold text-ink hover:bg-canvas/50"
                >
                  <span className="text-[16px]">{faq.q}</span>
                  <span
                    className={`ml-4 grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-[14px] text-ink-soft transition-transform ${
                      isOpen ? "rotate-180 text-teal-600" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-hairline bg-canvas/30 px-5 py-4 text-[14px] leading-relaxed text-ink-soft">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Emergency Assistance & Contacts */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Card title="Emergency ABDM Helplines" accent="emergency">
            <div className="flex flex-col gap-3 text-[14px]">
              <div className="flex items-center justify-between">
                <span className="text-ink-soft">National Emergency Medical Service:</span>
                <strong className="font-mono text-emergency-600">108 / 112</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-soft">National ABDM Toll-Free Support:</span>
                <strong className="font-mono text-ink">1800-11-4477</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-soft">Shortcode Helpline:</span>
                <strong className="font-mono text-ink">14477</strong>
              </div>
            </div>
          </Card>

          <Card title="Technical Support" accent="teal">
            <p className="text-[14px] text-ink-soft">
              Need assistance with your account, HPID credentials, or hospital facility integration?
            </p>
            <div className="mt-3 flex flex-col gap-1.5 font-mono text-[13px] text-teal-700">
              <p>Email: support@clinikey.abdm.gov.in</p>
              <p>Hours: 24/7 Priority Emergency Support</p>
            </div>
            <div className="mt-4">
              <Button variant="outline" full onClick={() => navigate("/")}>
                Return to Main Portal
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
