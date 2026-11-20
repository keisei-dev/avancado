import 'server-only';

import { ApplyStatus, RequestStatus, ReviewStatus } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma/client';

export type SitterStats = {
  sits: number;
  rating: number | null;
  reviews: number;
};

// Completed sits and average rating for each user
export async function getSitterStats(userIds: string[]): Promise<Record<string, SitterStats>> {
  const ids = [...new Set(userIds)];
  if (ids.length === 0) return {};

  const [sits, reviews] = await Promise.all([
    prisma.sitterApply.groupBy({
      by: ['applicantId'],
      where: {
        applicantId: { in: ids },
        status: ApplyStatus.ACCEPTED,
        request: { status: RequestStatus.DONE },
      },
      _count: { _all: true },
    }),
    prisma.review.findMany({
      where: { revieweeId: { in: ids }, status: ReviewStatus.ACTIVE },
      select: {
        revieweeId: true,
        reviewerId: true,
        rating: true,
        request: { select: { authorId: true } },
      },
    }),
  ]);

  const stats: Record<string, SitterStats> = {};
  for (const id of ids) stats[id] = { sits: 0, rating: null, reviews: 0 };
  for (const row of sits) stats[row.applicantId].sits = row._count._all;
  // Only reviews from owners count toward a sitter's rating
  const totals: Record<string, number> = {};
  for (const row of reviews) {
    if (row.reviewerId !== row.request.authorId) continue;
    stats[row.revieweeId].reviews += 1;
    totals[row.revieweeId] = (totals[row.revieweeId] ?? 0) + row.rating;
  }
  for (const id of ids) {
    const s = stats[id];
    if (s.reviews) s.rating = Math.round((totals[id] / s.reviews) * 10) / 10;
  }
  return stats;
}
