"use server";

import { revalidatePath } from "next/cache";
import { ReportStatus, RequestStatus } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma/client";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ADMIN_SITTER_PATH = "/admin/sitter-requests";

function readId(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return UUID_PATTERN.test(value) ? value : null;
}

async function logAdminAction(
  adminId: string,
  action: string,
  targetId: string,
  note?: string,
) {
  await prisma.adminActionLog.create({
    data: {
      adminId,
      action,
      targetType: "REQUEST",
      targetId,
      note: note ?? null,
    },
  });
}

function revalidateSitter(requestId: string) {
  revalidatePath(ADMIN_SITTER_PATH);
  revalidatePath("/sitter-board", "layout");
  revalidatePath(`/sitter-board/${requestId}`);
}

async function resolveOpenRequestReports(requestId: string, adminId: string) {
  await prisma.report.updateMany({
    where: { requestId, status: ReportStatus.OPEN },
    data: {
      status: ReportStatus.RESOLVED,
      handledById: adminId,
      handledAt: new Date(),
    },
  });
}

export async function hideSitterRequest(formData: FormData) {
  const admin = await requireAdmin();
  const requestId = readId(formData, "requestId");
  if (!requestId) return;

  const result = await prisma.sitterRequest.updateMany({
    where: { id: requestId, status: { not: RequestStatus.HIDDEN } },
    data: { status: RequestStatus.HIDDEN },
  });
  if (!result.count) return;

  await resolveOpenRequestReports(requestId, admin.id);
  await logAdminAction(admin.id, "HIDE_REQUEST", requestId);
  revalidateSitter(requestId);
}

export async function restoreSitterRequest(formData: FormData) {
  const admin = await requireAdmin();
  const requestId = readId(formData, "requestId");
  if (!requestId) return;

  // Unhide always restores OPEN. MATCHED/DONE/CANCELLED are not stored separately from HIDDEN.
  const result = await prisma.sitterRequest.updateMany({
    where: { id: requestId, status: RequestStatus.HIDDEN },
    data: { status: RequestStatus.OPEN },
  });
  if (!result.count) return;

  await logAdminAction(admin.id, "RESTORE_REQUEST", requestId);
  revalidateSitter(requestId);
}

/**
 * Prototype "Delete". RequestStatus has no DELETED value, so this hides the
 * request instead of removing the row.
 * TODO: persist a deleted state when the schema supports it.
 */
export async function deleteSitterRequest(formData: FormData) {
  const admin = await requireAdmin();
  const requestId = readId(formData, "requestId");
  if (!requestId) return;

  const result = await prisma.sitterRequest.updateMany({
    where: { id: requestId },
    data: { status: RequestStatus.HIDDEN },
  });
  if (!result.count) return;

  await resolveOpenRequestReports(requestId, admin.id);
  await logAdminAction(
    admin.id,
    "DELETE_REQUEST",
    requestId,
    "HIDDEN until RequestStatus supports DELETED",
  );
  revalidateSitter(requestId);
}

export async function resolveSitterReport(formData: FormData) {
  const admin = await requireAdmin();
  const reportId = readId(formData, "reportId");
  if (!reportId) return;

  const report = await prisma.report.findFirst({
    where: {
      id: reportId,
      requestId: { not: null },
      status: ReportStatus.OPEN,
    },
    select: { id: true, requestId: true },
  });
  if (!report?.requestId) return;

  await prisma.report.update({
    where: { id: report.id },
    data: {
      status: ReportStatus.RESOLVED,
      handledById: admin.id,
      handledAt: new Date(),
    },
  });
  await logAdminAction(admin.id, "RESOLVE_REQUEST_REPORT", report.requestId);
  revalidateSitter(report.requestId);
}

export async function dismissSitterReport(formData: FormData) {
  const admin = await requireAdmin();
  const reportId = readId(formData, "reportId");
  if (!reportId) return;

  const report = await prisma.report.findFirst({
    where: {
      id: reportId,
      requestId: { not: null },
      status: ReportStatus.OPEN,
    },
    select: { id: true, requestId: true },
  });
  if (!report?.requestId) return;

  await prisma.report.update({
    where: { id: report.id },
    data: {
      status: ReportStatus.DISMISSED,
      handledById: admin.id,
      handledAt: new Date(),
    },
  });
  await logAdminAction(admin.id, "DISMISS_REQUEST_REPORT", report.requestId);
  revalidateSitter(report.requestId);
}
