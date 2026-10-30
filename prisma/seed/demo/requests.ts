import { prisma } from "../client";
import { dateTime, seedUuid } from "./helpers";
import { petId } from "./pets";
import { userId } from "./users";

const HOUR = 60 * 60 * 1000;

// "day" = days from the day you run the seed. start/end = the sitting time.
// "matched" = the sitter the owner chose (only for MATCHED and DONE requests).
const requests = [
  {
    key: "2408",
    owner: "emily",
    pet: "charlie",
    title: "Weekend walks for my gentle senior beagle",
    area: "Kitsilano",
    day: 10,
    start: "09:00",
    end: "12:00",
    minutes: 180,
    postedHoursAgo: 2,
    status: "OPEN",
    description:
      "Charlie loves calm neighbourhood walks and plenty of sniffing time. I need someone patient who can give his morning medication with breakfast, take him on a relaxed walk, and stay with him until noon.",
    applicants: [
      ["daniel", "Happy to help with Charlie."],
      ["marcus", "I love senior dogs."],
      ["ava", "I can give medication."],
      ["liam", "Free that weekend."],
    ],
  },
  {
    key: "2406",
    owner: "sophia",
    pet: "coco",
    title: "Morning walk near Stanley Park",
    area: "West End",
    day: 14,
    start: "07:30",
    end: "09:00",
    minutes: 90,
    postedHoursAgo: 216,
    status: "OPEN",
    description:
      "Coco needs a brisk morning loop around the seawall while I am at an early appointment. She is friendly with people and other dogs and responds well to treats.",
    applicants: [
      ["daniel", "I run the seawall daily."],
      [
        "maya",
        "Hi Sophia! I walk Sunny on the seawall most mornings and would love to bring Coco along.",
      ],
    ],
  },
  {
    key: "2404",
    owner: "lucas",
    pet: "pepper",
    title: "Cat check-in while I visit family",
    area: "Commercial Drive",
    day: 18,
    start: "08:00",
    end: "18:30",
    minutes: 30,
    postedHoursAgo: 72,
    status: "OPEN",
    description:
      "Pepper needs two daily visits for food, fresh water, litter care, and a little playtime. She is affectionate once she gets comfortable.",
    applicants: [
      ["ava", "Cats are my favourite!"],
      ["marcus", "Can do both visits."],
      ["daniel", "Happy to help."],
    ],
  },
  {
    key: "2401",
    owner: "maya",
    pet: "sunny",
    title: "Help with Sunny after my late meeting",
    area: "Kitsilano",
    day: 7,
    start: "18:00",
    end: "20:00",
    minutes: 120,
    postedHoursAgo: 1,
    status: "OPEN",
    description:
      "I am looking for a nearby neighbour to take Sunny for his evening walk, serve dinner, and keep him company until I return. He walks well on a leash, loves tennis balls, and his food is pre-measured in the pantry.",
    applicants: [
      [
        "daniel",
        "Hi! I’d love to look after Sunny because I walk large dogs every morning near Kitsilano Beach. I can stay until you are home.",
      ],
      [
        "ava",
        "Hello! I have medication experience and I’m free on the evening of June 12. Happy to meet Sunny beforehand.",
      ],
      [
        "marcus",
        "Hi Maya, I do weekend care for active dogs and can bring references. Sunny looks like a sweetheart!",
      ],
    ],
  },
  {
    key: "2407",
    owner: "noah",
    pet: "milo",
    title: "Playful lab needs an afternoon companion",
    area: "Mount Pleasant",
    day: 5,
    start: "13:30",
    end: "17:30",
    minutes: 240,
    postedHoursAgo: 24,
    status: "MATCHED",
    matched: "maya",
    description:
      "Milo is energetic, social, and happiest after a good game of fetch. Looking for someone comfortable with larger dogs to walk, play, and serve his dinner.",
    applicants: [["maya", "Milo sounds like a blast!"]],
  },
  {
    key: "2405",
    owner: "grace",
    pet: "biscuit",
    title: "Quiet company during an evening appointment",
    area: "Yaletown",
    day: -10,
    start: "17:30",
    end: "21:00",
    minutes: 210,
    postedHoursAgo: 400,
    status: "DONE",
    matched: "maya",
    description:
      "Biscuit needed a calm neighbour to keep her company, serve dinner, and take one short evening walk. The sitting was completed successfully.",
    applicants: [["maya", "Happy to keep Biscuit company."]],
  },
  {
    key: "2403",
    owner: "maya",
    pet: "sunny",
    title: "Neighbour needed for Sunny’s Saturday walk",
    area: "Kitsilano",
    day: 3,
    start: "10:00",
    end: "12:00",
    minutes: 120,
    postedHoursAgo: 96,
    status: "MATCHED",
    matched: "daniel",
    description:
      "Sunny needs a relaxed beach walk and play session while I attend an appointment.",
    applicants: [
      [
        "daniel",
        "Hi! I’d love to look after Sunny because I walk large dogs every morning near Kitsilano Beach. I can stay until you are home.",
      ],
      [
        "marcus",
        "Hi Maya, I do weekend care for active dogs and can bring references. Sunny looks like a sweetheart!",
      ],
    ],
  },
  {
    key: "2402",
    owner: "maya",
    pet: "luna",
    title: "Luna’s afternoon check-in",
    area: "Kitsilano",
    day: -40,
    start: "14:00",
    end: "15:00",
    minutes: 60,
    postedHoursAgo: 800,
    status: "DONE",
    matched: "ava",
    description:
      "A neighbour checked Luna’s food, refreshed her water, and spent some quiet playtime with her.",
    applicants: [
      [
        "ava",
        "Hello! I have medication experience and I’m free on the evening of June 12. Happy to meet Sunny beforehand.",
      ],
    ],
  },
] as const;

// Sample review text written for this seed (the prototype has no sitter reviews).
const reviews = [
  {
    key: "2402-maya-ava",
    request: "2402",
    reviewer: "maya",
    reviewee: "ava",
    rating: 5,
    comment:
      "Ava was wonderful with Luna. She sent a photo update and left everything tidy.",
  },
  {
    key: "2402-ava-maya",
    request: "2402",
    reviewer: "ava",
    reviewee: "maya",
    rating: 5,
    comment:
      "Maya’s instructions were clear and Luna was relaxed the whole visit.",
  },
  {
    key: "2405-grace-maya",
    request: "2405",
    reviewer: "grace",
    reviewee: "maya",
    rating: 5,
    comment:
      "Maya kept Biscuit calm and followed every note. Highly recommended.",
  },
  {
    key: "2405-maya-grace",
    request: "2405",
    reviewer: "maya",
    reviewee: "grace",
    rating: 5,
    comment: "Biscuit is a sweetheart and Grace was easy to coordinate with.",
  },
] as const;

export async function seedRequests() {
  let applicationCount = 0;

  for (const request of requests) {
    const id = seedUuid(`request:${request.key}`);
    const data = {
      authorId: userId(request.owner),
      petId: petId(request.pet),
      title: request.title,
      description: request.description,
      areaName: request.area,
      startAt: dateTime(request.day, request.start),
      endAt: dateTime(request.day, request.end),
      durationMinutes: request.minutes,
      status: request.status,
    };
    await prisma.sitterRequest.upsert({
      where: { id },
      update: data,
      create: {
        id,
        ...data,
        createdAt: new Date(Date.now() - request.postedHoursAgo * HOUR),
      },
    });

    // Open request: everyone is PENDING.
    // Matched/done request: the chosen sitter is ACCEPTED, the others REJECTED.
    const matched = "matched" in request ? request.matched : null;
    for (const [applicantKey, message] of request.applicants) {
      const status =
        matched === null
          ? "PENDING"
          : applicantKey === matched
            ? "ACCEPTED"
            : "REJECTED";
      const applyId = seedUuid(`apply:${request.key}:${applicantKey}`);
      const applyData = {
        requestId: id,
        applicantId: userId(applicantKey),
        message,
        status,
      } as const;
      await prisma.sitterApply.upsert({
        where: { id: applyId },
        update: applyData,
        create: { id: applyId, ...applyData },
      });
      applicationCount += 1;
    }
  }

  for (const review of reviews) {
    const id = seedUuid(`review:${review.key}`);
    const data = {
      requestId: seedUuid(`request:${review.request}`),
      reviewerId: userId(review.reviewer),
      revieweeId: userId(review.reviewee),
      rating: review.rating,
      comment: review.comment,
      status: "ACTIVE",
    } as const;
    await prisma.review.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }

  console.log(
    `Seeded ${requests.length} sitter requests, ${applicationCount} applications and ${reviews.length} reviews.`,
  );
}
