"use server";

import { revalidatePath } from "next/cache";
import { ReportStatus } from "@/generated/prisma/client";
import { getCurrentMember } from "@/lib/auth/member";
import { prisma } from "@/lib/prisma/client";
import { isSitterReportReason } from "@/lib/report/sitter-reasons";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ReportSitterRequestResult =
  { ok: true } | { ok: false; error: string };

export async function reportSitterRequest(
  formData: FormData,
): Promise<ReportSitterRequestResult> {
  const member = await getCurrentMember();
  if (!member) {
    return { ok: false, error: "Please sign in to report this request." };
  }

  const requestId = String(formData.get("requestId") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!UUID_PATTERN.test(requestId)) {
    return { ok: false, error: "This request could not be found." };
  }
  if (!isSitterReportReason(reason)) {
    return { ok: false, error: "Choose a reason for this report." };
  }

  const request = await prisma.sitterRequest.findUnique({
    where: { id: requestId },
    select: { id: true, authorId: true },
  });
  if (!request) {
    return { ok: false, error: "This request could not be found." };
  }
  if (request.authorId === member.id) {
    return { ok: false, error: "You can't report your own request." };
  }

  const existing = await prisma.report.findFirst({
    where: {
      reporterId: member.id,
      requestId,
      status: ReportStatus.OPEN,
    },
    select: { id: true },
  });
  if (existing) {
    return { ok: false, error: "You've already reported this request." };
  }

  await prisma.report.create({
    data: {
      reporterId: member.id,
      requestId,
      reason,
      status: ReportStatus.OPEN,
    },
  });

  revalidatePath(`/sitter-board/${requestId}`);
  // TODO: Admin Sitter Requests (Sprint 3) should list OPEN reports with requestId set.
  revalidatePath("/admin/sitter-requests");

  return { ok: true };
}
