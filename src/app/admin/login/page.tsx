import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MEMBER_LOGIN_PATH } from "@/lib/auth/paths";

export const metadata: Metadata = {
  title: "Admin login",
};

export default function AdminLoginPage() {
  redirect(MEMBER_LOGIN_PATH);
}
