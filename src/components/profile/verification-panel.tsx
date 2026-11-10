import { buttonClass } from "@/components/ui/button";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";


export default function VerificationPanel() {
  return (
    <div className="flex flex-col items-start gap-4 rounded-16 border border-line bg-white p-5 sm:flex-row sm:items-center">
      <div className="grid size-12 shrink-0 place-items-center rounded-12 bg-cream">
        <ShieldCheck className="text-brown-2" />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">Verify your account</h2>
        <p className="text-sm text-muted">
          Verified accounts are more trusted by pet owners and sitters.
        </p>
      </div>
      <Link
        href="/profile/me/verification"
        className={`sm:ml-auto ${buttonClass({ size: "md", variant: "secondary" })}`}
      >
        Verify now
      </Link>
    </div>
  );
}
