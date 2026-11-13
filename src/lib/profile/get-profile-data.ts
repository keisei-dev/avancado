import { prisma } from "@/lib/prisma/client";

// Loads everything a profile page shows, for any user.
// viewerId = who is looking (used for the "liked" heart on posts).
export async function getProfileData(userId: string, viewerId: string) {
    const user = await prisma.user.findFirst({
        where: { id: userId, accountStatus: "ACTIVE" },
        select: {
            id: true, name: true, image: true, isVerified: true,
            accountStatus: true, createdAt: true, areaName: true, bio: true,
            careSpecies: true, certificateName: true, certificateIssuedBy: true,
            sittingExperience: true,
        },
    });
    if (!user) return null; // not found, or suspended

    // Only reviews they got as a sitter (not as an owner)
    const sitterReviewWhere = {
        revieweeId: userId,
        status: "ACTIVE" as const,
        request: { authorId: { not: userId } },
    };

    // Fetch reviews for the user as a sitter
    const reviews = await prisma.review.findMany({
        where: sitterReviewWhere,
        orderBy: { createdAt: "desc" },
        select: {
            id: true, rating: true, comment: true, createdAt: true,
            reviewer: { select: { name: true, image: true } },
        },
    });

    const sitterRating = await prisma.review.aggregate({ where: sitterReviewWhere, _avg: { rating: true }, _count: { _all: true } });
    const pets = await prisma.pet.findMany({
        where: { ownerId: userId },
        orderBy: { name: "asc" },
        select: {
            id: true, name: true, species: true, breed: true, birthDate: true,
            weight: true, gender: true, isNeutered: true, notes: true, imageUrl: true,
        },
    });

    const postRows = await prisma.communityPost.findMany({
        where: { authorId: userId, status: { not: "HIDDEN" } },
        include: {
            author: { select: { id: true, name: true, image: true, isVerified: true } },
            likes: { where: { userId: viewerId }, select: { userId: true } }, // viewer, not owner
        },
        orderBy: { createdAt: "desc" },
    });
    const completedSits = await prisma.sitterApply.count({
        where: { applicantId: userId, status: "ACCEPTED", request: { status: "DONE" } },
    });

    return { user, reviews, sitterRating, pets, postRows, completedSits };
}