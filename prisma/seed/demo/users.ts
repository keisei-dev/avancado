import { prisma } from "../client";
import { photos } from "./photos";
import { seedUuid } from "./helpers";

// Profile texts come from the UI reference data, so the screens match the prototype.
// Every user has every field (null or [] when empty). TypeScript needs the same
// keys on each item to let us read user.bio etc. in the loop below.
const demoUsers = [
  {
    key: "maya",
    name: "Maya Thompson",
    avatar: photos.avatar1,
    verified: true,
    since: 2022,
    area: "Kitsilano",
    bio: "Pet parent to Sunny and Luna, and an experienced weekend sitter. I love long seawall walks, enrichment games, and helping nervous pets feel at home.",
    experience:
      "Five years of weekend sitting for dogs and cats of all sizes. I'm comfortable giving medication, doing overnight stays, and settling in nervous rescues.",
    careSpecies: ["DOG", "CAT"],
    certificate: { name: "Pet First Aid", issuedBy: "St. John Ambulance" },
  },
  {
    key: "admin",
    name: "Avancado Admin",
    avatar: null,
    verified: false,
    since: 2021,
    area: null,
    bio: null,
    experience: null,
    careSpecies: [],
    certificate: null,
  },
  {
    key: "daniel",
    name: "Daniel Kim",
    avatar: photos.avatar2,
    verified: true,
    since: 2021,
    area: "Kitsilano",
    bio: "Morning runner and big-dog fan. I walk large breeds most mornings near Kits Beach and I am happy to send photo updates.",
    experience:
      "Daily walks for large, high-energy dogs. I can do early mornings and I send a photo update after every walk.",
    careSpecies: ["DOG"],
    certificate: { name: "Canine First Aid & CPR", issuedBy: "Red Cross" },
  },
  {
    key: "ava",
    name: "Ava Brooks",
    avatar: photos.avatar3,
    verified: true,
    since: 2023,
    area: "Coal Harbour",
    bio: "Vet-clinic receptionist with medication experience. Cats are my favourite, but I have never met a dog I did not like.",
    experience:
      "I work at a vet clinic, so I'm used to pills, eye drops and insulin. Happy with shy cats and senior pets.",
    careSpecies: ["CAT", "DOG"],
    certificate: null,
  },
  {
    key: "marcus",
    name: "Marcus Chen",
    avatar: photos.avatar4,
    verified: true,
    since: 2023,
    area: "Mount Pleasant",
    bio: "Weekend dog walker for active breeds. References available on request.",
    experience:
      "Weekend walks for active breeds, usually 1–2 hours on the trails. References from past owners on request.",
    careSpecies: ["DOG"],
    certificate: null,
  },
  {
    key: "liam",
    name: "Liam Nguyen",
    avatar: photos.avatar6,
    verified: true,
    since: 2024,
    area: "Kitsilano",
    bio: "Border collie dad. Usually at the beach with a ball launcher.",
    experience: "Mostly beach play and fetch sessions for energetic dogs.",
    careSpecies: ["DOG"],
    certificate: null,
  },
  {
    key: "ethan",
    name: "Ethan Wilson",
    avatar: photos.avatar2,
    verified: false,
    since: 2025,
    area: "Grandview",
    bio: "Cat person living near Commercial Drive.",
    experience: null,
    careSpecies: [],
    certificate: null,
  },
  {
    key: "emily",
    name: "Emily Carter",
    avatar: null,
    verified: true,
    since: 2022,
    area: "Kitsilano",
    bio: "Senior beagle owner.",
    experience:
      "Gentle care for older dogs: slow walks, feeding schedules and medication reminders.",
    careSpecies: ["DOG"],
    certificate: null,
  },
  {
    key: "noah",
    name: "Noah Williams",
    avatar: photos.avatar4,
    verified: true,
    since: 2023,
    area: "Mount Pleasant",
    bio: "Lab owner and weekend hiker.",
    experience: "Weekend hikes and drop-in visits for friendly dogs.",
    careSpecies: ["DOG"],
    certificate: null,
  },
  {
    key: "sophia",
    name: "Sophia Lee",
    avatar: photos.avatar5,
    verified: true,
    since: 2022,
    area: "West End",
    bio: "Goldendoodle mom.",
    experience:
      "Drop-in visits and overnight stays for dogs and cats in the West End.",
    careSpecies: ["DOG", "CAT"],
    certificate: null,
  },
  {
    key: "grace",
    name: "Grace Park",
    avatar: null,
    verified: true,
    since: 2024,
    area: "Yaletown",
    bio: "Cavalier owner who works evenings.",
    experience:
      "I work from home in Yaletown and I'm happy to do weekday drop-ins and short walks for small dogs.",
    careSpecies: ["DOG"],
    certificate: null,
  },
  {
    key: "lucas",
    name: "Lucas Martin",
    avatar: null,
    verified: true,
    since: 2024,
    area: "Commercial Drive",
    bio: "Cat dad to Pepper.",
    experience: null,
    careSpecies: [],
    certificate: null,
  },
] as const;

export type DemoUserKey = (typeof demoUsers)[number]["key"];

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function authId(name: "SEED_MAYA_AUTH_ID" | "SEED_ADMIN_AUTH_ID"): string {
  const value = process.env[name];
  if (!value || !UUID_PATTERN.test(value)) {
    throw new Error(
      `${name} is missing or is not a UUID. Copy the "User UID" from Supabase > Authentication > Users into .env.local.`,
    );
  }
  return value;
}

/** Maya and Admin use their real Supabase Auth ids. The others get a made-up id. */
export function userId(key: DemoUserKey): string {
  if (key === "maya") return authId("SEED_MAYA_AUTH_ID");
  if (key === "admin") return authId("SEED_ADMIN_AUTH_ID");
  return seedUuid(`user:${key}`);
}

export async function seedUsers() {
  for (const user of demoUsers) {
    const id = userId(user.key);
    const data = {
      email: `${user.key}@seed.avancado.test`,
      name: user.name,
      image: user.avatar,
      role: user.key === "admin" ? ("ADMIN" as const) : ("USER" as const),
      accountStatus: "ACTIVE" as const,
      isVerified: user.verified,
      // Profile fields (My Profile > Community / Experience tabs).
      areaName: user.area,
      bio: user.bio,
      sittingExperience: user.experience,
      // "as const" makes the array read-only; Prisma wants a normal array, so we copy it.
      careSpecies: [...user.careSpecies],
      certificateName: user.certificate?.name ?? null,
      certificateIssuedBy: user.certificate?.issuedBy ?? null,
    };
    const joinedAt = new Date(Date.UTC(user.since, 0, 15));

    await prisma.user.upsert({
      where: { id },
      update: data,
      create: { id, ...data, termsAcceptedAt: joinedAt, createdAt: joinedAt },
    });
  }

  // Every verified user gets one approved ID check, reviewed by the admin.
  // documentPath is null because ID files are deleted after review.
  const verifiedUsers = demoUsers.filter((user) => user.verified);
  await prisma.idVerification.createMany({
    data: verifiedUsers.map((user) => ({
      id: seedUuid(`verification:${user.key}`),
      userId: userId(user.key),
      documentType: "BCID" as const,
      documentPath: null,
      status: "APPROVED" as const,
      reviewedById: userId("admin"),
      reviewedAt: new Date(Date.UTC(user.since, 0, 20)),
      submittedAt: new Date(Date.UTC(user.since, 0, 18)),
    })),
    skipDuplicates: true,
  });

  console.log(
    `Seeded ${demoUsers.length} demo users and ${verifiedUsers.length} ID verifications.`,
  );
}
