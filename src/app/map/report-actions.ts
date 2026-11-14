"use server";

import { revalidatePath } from "next/cache";
import { PlaceStatus, ReportStatus } from "@/generated/prisma/client";
import { assertNotAdmin } from "@/lib/auth/admin";
import { getCurrentMember } from "@/lib/auth/member";
import { prisma } from "@/lib/prisma/client";
import { isPlaceReportReason } from "@/lib/report/place-reasons";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ReportPlaceResult = { ok: true } | { ok: false; error: string };

export async function reportPlace(formData: FormData): Promise<ReportPlaceResult> {
  const blocked = await assertNotAdmin();
  if (blocked) {
    return { ok: false, error: blocked };
  }

  const member = await getCurrentMember();
  if (!member) {
    return { ok: false, error: "Please sign in to report this place." };
  }

  const placeId = String(formData.get("placeId") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!UUID_PATTERN.test(placeId)) {
    return { ok: false, error: "This place could not be found." };
  }
  if (!isPlaceReportReason(reason)) {
    return { ok: false, error: "Choose a reason for this report." };
  }

  const place = await prisma.place.findFirst({
    where: { id: placeId, status: PlaceStatus.ACTIVE },
    select: { id: true },
  });
  if (!place) {
    return { ok: false, error: "This place could not be found." };
  }

  const existing = await prisma.report.findFirst({
    where: { reporterId: member.id, placeId, status: ReportStatus.OPEN },
    select: { id: true },
  });
  if (existing) {
    return { ok: false, error: "You've already reported this place." };
  }

  await prisma.report.create({
    data: { reporterId: member.id, placeId, reason, status: ReportStatus.OPEN },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/spots");

  return { ok: true };
}
