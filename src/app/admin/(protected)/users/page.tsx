// Notion flow: Admin: Manage users
// TODO: implement

import type { Metadata } from "next";
import { ComingSoon } from "@/components/admin/coming-soon";

export const metadata: Metadata = {
  title: "User Management",
};

export default function AdminUsersPage() {
  return (
    <ComingSoon
      title="User Management"
      description="Identity verification will live here. This page is a placeholder until its feature owner implements it."
    />
  );
}
