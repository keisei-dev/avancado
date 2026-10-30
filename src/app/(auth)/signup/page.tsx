import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthFrame } from "@/components/auth/auth-frame";
import { MemberAuthForm } from "@/components/auth/member-auth-form";
import { getCurrentMember } from "@/lib/auth/member";

export const metadata = { title: "Create account" };

async function SignupContent() {
  if (await getCurrentMember()) redirect("/");
  return <MemberAuthForm signup />;
}

export default function SignupPage() {
  return (
    <AuthFrame signup>
      <Suspense
        fallback={
          <p role="status" className="text-muted">
            Loading sign up…
          </p>
        }
      >
        <SignupContent />
      </Suspense>
    </AuthFrame>
  );
}
