import { AuthFrame } from "@/components/auth/auth-frame";
import { ResetPasswordForm } from "@/components/auth/member-auth-form";

export const metadata = { title: "Reset password" };

export default function ResetPasswordPage() {
  return (
    <AuthFrame>
      <ResetPasswordForm />
    </AuthFrame>
  );
}
