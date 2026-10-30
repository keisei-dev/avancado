import { prisma } from "../client";
import { seedUuid } from "./helpers";
import { userId } from "./users";

const MINUTE = 60 * 1000;

// Each report points to exactly one target (post, request or place).
const reports = [
  {
    key: "1",
    reporter: "grace",
    target: "request",
    targetKey: "2408",
    reason: "Spam",
    minutesAgo: 90,
  },
  {
    key: "2",
    reporter: "maya",
    target: "post",
    targetKey: "3",
    reason: "Inappropriate content",
    minutesAgo: 1500,
  },
  {
    key: "3",
    reporter: "liam",
    target: "place",
    targetKey: "east-van-brewing",
    reason: "No longer pet-friendly",
    minutesAgo: 1600,
  },
] as const;

export async function seedReports() {
  for (const report of reports) {
    const id = seedUuid(`report:${report.key}`);

    // Fill only the one target column that matches (the database checks this).
    const targetColumn =
      report.target === "post"
        ? { postId: seedUuid(`post:${report.targetKey}`) }
        : report.target === "request"
          ? { requestId: seedUuid(`request:${report.targetKey}`) }
          : { placeId: seedUuid(`place:${report.targetKey}`) };

    const data = {
      reporterId: userId(report.reporter),
      reason: report.reason,
      status: "OPEN",
      ...targetColumn,
    } as const;

    await prisma.report.upsert({
      where: { id },
      update: data,
      create: {
        id,
        ...data,
        createdAt: new Date(Date.now() - report.minutesAgo * MINUTE),
      },
    });
  }

  console.log(`Seeded ${reports.length} reports.`);
}
