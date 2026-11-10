import {Button} from "@/components/ui/button";
import Link from "next/link";


export default function VerificationPanel() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-4 shadow-md">
      <h2 className="text-xl font-semibold">Identity Verification</h2>
      <p className="text-gray-600 text-center">
        Verify your identity to gain access to additional features and build trust within the community.
      </p>
      <Link href="/profile/me/verification">
        <Button>Verify Now</Button>
      </Link>
    </div>
  );
}