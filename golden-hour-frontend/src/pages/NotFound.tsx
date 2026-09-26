import { useNavigate } from "react-router";
import { Logo, Button } from "../components/ui";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-ink-soft">
          Error 404
        </p>
        <h1 className="mt-2 font-display text-[28px] font-bold tracking-tight">
          This record could not be found
        </h1>
        <div className="mt-6 flex justify-center">
          <Button variant="primary" onClick={() => navigate("/")}>
            Return to Gateway
          </Button>
        </div>
      </div>
    </div>
  );
}
