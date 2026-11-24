import Link from "next/link";
import { Clock, ShieldCheck, ShieldQuestion, ShieldX } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

type VerificationPanelProps = {
  status?: VerificationStatus;
  rejectionReason?: string | null;
};



const CONTENT = {
  unverified: {
    title: "Verify your account",
    description:
      "Build trust with pet owners and sitters by verifying your identity. It only takes a minute.",
    label: "Not verified",
    tone: "default",
    icon: ShieldQuestion,
    border: "border-line",
    iconBox: "bg-cream text-brown-2",
    button: "Verify now",
  },
  pending: {
    title: "Verification in progress",
    description:
      "Your ID is being reviewed. We’ll update this card once it’s done.",
    label: "Under review",
    tone: "amber",
    icon: Clock,
    border: "border-amber",
    iconBox: "bg-amber-soft text-amber-ink",
    button: null,
  },
  verified: {
    title: "Your account is verified",
    description:
      "Other members can see your Verified badge. Thanks for helping keep Avancado safe.",
    label: "Verified",
    tone: "green",
    icon: ShieldCheck,
    border: "border-success-line",
    iconBox: "bg-success-soft text-success",
    button: null,
  },
  rejected: {
    title: "We couldn't verify your ID",
    description:
      "Please check the requirements and try again. Questions? Contact us.",
    label: "Action needed",
    tone: "red",
    icon: ShieldX,
    border: "border-coral-line",
    iconBox: "bg-coral-soft text-coral",
    button: "Try again",
  },
} as const;


export default function VerificationPanel({
  status = "unverified",
  rejectionReason = null,
}: VerificationPanelProps) {
  const content = CONTENT[status];
  const Icon = content.icon;


  return (
    <div
      className={`flex flex-col items-start gap-4 rounded-16 bg-white border p-5 sm:flex-row sm:items-center ${content.border}`}
    >
      {/* Status icon */}
      <div className={`grid size-12 shrink-0 place-items-center rounded-12 ${content.iconBox}`}>
        <Icon size={22} aria-hidden="true" />
      </div>

      {/* Text */}
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold">{content.title}</h2>
          <Badge tone={content.tone}>{content.label}</Badge>
        </div>
        <p className="text-sm text-muted">{content.description}</p>

        {status === "rejected" &&
          rejectionReason &&
          rejectionReason !== "Rejected by admin" && (
            <p className="text-sm text-coral">Reason: {rejectionReason}</p>
          )}
      </div>

      {content.button && (
        <Link
          href="/profile/me/verification"
          className={`shrink-0 sm:ml-auto ${buttonClass({ size: "md" })}`}
        >
          {content.button}
        </Link>
      )}
      {status === "pending" && (
        <span
          aria-disabled="true"
          className={`shrink-0 sm:ml-auto ${buttonClass({ size: "md", variant: "secondary" })} pointer-events-none opacity-60`}
        >
          Pending
        </span>
      )}
    </div>
  );
}