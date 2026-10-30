import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthFrame } from "@/components/auth/auth-frame";
import { MemberAuthForm } from "@/components/auth/member-auth-form";
import { getCurrentMember } from "@/lib/auth/member";

export const metadata = { title: "Log in" };

async function LoginContent({ searchParams }: PageProps<"/login">) {
  if (await getCurrentMember()) redirect("/");
  const query = await searchParams;
  return <MemberAuthForm linkError={query.error === "auth_link"} />;
}

export default function LoginPage(props: PageProps<"/login">) {
  return (
    <AuthFrame>
      <Suspense
        fallback={
          <p role="status" className="text-muted">
            Loading sign in…
          </p>
        }
      >
        <LoginContent {...props} />
      </Suspense>
    </AuthFrame>
  );
}
