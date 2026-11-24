import { prisma } from "@/lib/prisma/client";

export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export async function getVerificationStatus(userId: string, isVerified: boolean) {
  const latest = await prisma.idVerification.findFirst({
    where: { userId },
    orderBy: { submittedAt: "desc" },
    select: { status: true, rejectionReason: true },
  });

  let status: VerificationStatus = "unverified";

  if (isVerified) {
    status = "verified";
  } else if (latest?.status === "PENDING") {
    status = "pending";
  } else if (latest?.status === "REJECTED") {
    status = "rejected";
  }

  return { status, rejectionReason: latest?.rejectionReason ?? null };
}
