import { prisma } from "../client";
import { dateTime, seedUuid } from "./helpers";
import { petId } from "./pets";
import { userId } from "./users";

const SITTING_MINUTES = 120;

// Neighbourhood of each owner (same areas as the sample requests).
const AREAS = {
  emily: "Kitsilano",
  noah: "Mount Pleasant",
  sophia: "West End",
  lucas: "Commercial Drive",
  grace: "Yaletown",
} as const;

// Completed sittings in the past. "day" = days before the day you run the seed.
const pastSittings = [
  // Maya as the sitter
  {
    sitter: "maya",
    owner: "emily",
    pet: "charlie",
    day: -170,
    rating: 5,
    comment:
      "Thoughtful, punctual, and sent the best updates. Charlie was completely relaxed when we got home.",
  },
  {
    sitter: "maya",
    owner: "noah",
    pet: "milo",
    day: -205,
    rating: 5,
    comment:
      "Milo had a wonderful afternoon. Understood his energy and kept his routine perfectly.",
  },
  {
    sitter: "maya",
    owner: "sophia",
    pet: "coco",
    day: -240,
    rating: 4,
    comment: "Reliable, kind, and very attentive to Coco’s care instructions.",
  },
  // Daniel as the sitter
  {
    sitter: "daniel",
    owner: "sophia",
    pet: "coco",
    day: -60,
    rating: 5,
    comment:
      "Daniel took Coco on a long seawall walk and sent photos the whole time. She came home happy and tired.",
  },
  {
    sitter: "daniel",
    owner: "noah",
    pet: "milo",
    day: -95,
    rating: 5,
    comment:
      "Handled Milo’s energy like a pro. Great communication and right on time.",
  },
  {
    sitter: "daniel",
    owner: "emily",
    pet: "charlie",
    day: -130,
    rating: 4,
    comment:
      "Charlie loved his walk. Daniel stayed a little longer than planned so he could rest.",
  },
  // Ava as the sitter
  {
    sitter: "ava",
    owner: "lucas",
    pet: "pepper",
    day: -75,
    rating: 5,
    comment:
      "Ava was great with Pepper, who usually hides from visitors. Fresh water, clean litter, and a lovely update.",
  },
  {
    sitter: "ava",
    owner: "grace",
    pet: "biscuit",
    day: -110,
    rating: 5,
    comment:
      "Biscuit gets nervous with new people, but Ava made her feel safe right away.",
  },
  {
    sitter: "ava",
    owner: "noah",
    pet: "milo",
    day: -150,
    rating: 4,
    comment:
      "Friendly and reliable. Milo pulled a bit on the leash, but Ava handled it well.",
  },
  // Marcus as the sitter
  {
    sitter: "marcus",
    owner: "noah",
    pet: "milo",
    day: -45,
    rating: 5,
    comment:
      "Marcus is the real deal with big dogs. Milo got his run and came home calm.",
  },
  {
    sitter: "marcus",
    owner: "emily",
    pet: "charlie",
    day: -88,
    rating: 4,
    comment: "Gentle with Charlie and followed his medication notes closely.",
  },
  {
    sitter: "marcus",
    owner: "sophia",
    pet: "coco",
    day: -160,
    rating: 5,
    comment:
      "Coco was happy and well behaved. Marcus even practised her “sit” before dinner.",
  },
  // Liam as the sitter
  {
    sitter: "liam",
    owner: "grace",
    pet: "biscuit",
    day: -52,
    rating: 5,
    comment:
      "Liam kept Biscuit company on a quiet evening and followed all her routines.",
  },
  {
    sitter: "liam",
    owner: "lucas",
    pet: "pepper",
    day: -120,
    rating: 4,
    comment:
      "Pepper is shy, but Liam was patient. Thanks for the daily photos.",
  },
] as const;

export async function seedPastSittings() {
  for (const sitting of pastSittings) {
    // One sitter + one owner is unique in this list, so it makes a stable key.
    const key = `${sitting.sitter}-${sitting.owner}`;
    const requestId = seedUuid(`past-request:${key}`);
    const petName = sitting.pet.charAt(0).toUpperCase() + sitting.pet.slice(1);

    const startAt = dateTime(sitting.day, "10:00");
    const endAt = new Date(startAt.getTime() + SITTING_MINUTES * 60 * 1000);

    const requestData = {
      authorId: userId(sitting.owner),
      petId: petId(sitting.pet),
      title: `Care visit for ${petName}`,
      description: `A completed visit: a walk, a meal and some company for ${petName}.`,
      areaName: AREAS[sitting.owner],
      startAt,
      endAt,
      durationMinutes: SITTING_MINUTES,
      status: "DONE",
    } as const;
    await prisma.sitterRequest.upsert({
      where: { id: requestId },
      update: requestData,
      create: {
        id: requestId,
        ...requestData,
        createdAt: dateTime(sitting.day - 3, "09:00"),
      },
    });

    // The sitter was chosen (ACCEPTED). The request is DONE.
    const applyId = seedUuid(`past-apply:${key}`);
    const applyData = {
      requestId,
      applicantId: userId(sitting.sitter),
      message: "Happy to help!",
      status: "ACCEPTED",
    } as const;
    await prisma.sitterApply.upsert({
      where: { id: applyId },
      update: applyData,
      create: { id: applyId, ...applyData },
    });

    // The owner reviews the sitter the day after the sitting.
    const reviewId = seedUuid(`past-review:${key}`);
    const reviewData = {
      requestId,
      reviewerId: userId(sitting.owner),
      revieweeId: userId(sitting.sitter),
      rating: sitting.rating,
      comment: sitting.comment,
      status: "ACTIVE",
    } as const;
    await prisma.review.upsert({
      where: { id: reviewId },
      update: reviewData,
      create: {
        id: reviewId,
        ...reviewData,
        createdAt: dateTime(sitting.day + 1, "09:30"),
      },
    });
  }

  console.log(
    `Seeded ${pastSittings.length} completed sittings with ${pastSittings.length} reviews.`,
  );
}
