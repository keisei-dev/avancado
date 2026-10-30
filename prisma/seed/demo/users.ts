import { prisma } from "../client";
import { photos } from "./photos";
import { seedUuid } from "./helpers";

const demoUsers = [
  {
    key: "maya",
    name: "Maya Thompson",
    avatar: photos.avatar1,
    verified: true,
    since: 2022,
  },
  {
    key: "admin",
    name: "Avancado Admin",
    avatar: null,
    verified: false,
    since: 2021,
  },
  {
    key: "daniel",
    name: "Daniel Kim",
    avatar: photos.avatar2,
    verified: true,
    since: 2021,
  },
  {
    key: "ava",
    name: "Ava Brooks",
    avatar: photos.avatar3,
    verified: true,
    since: 2023,
  },
  {
    key: "marcus",
    name: "Marcus Chen",
    avatar: photos.avatar4,
    verified: true,
    since: 2023,
  },
  {
    key: "liam",
    name: "Liam Nguyen",
    avatar: photos.avatar6,
    verified: true,
    since: 2024,
  },
  {
    key: "ethan",
    name: "Ethan Wilson",
    avatar: photos.avatar2,
    verified: false,
    since: 2025,
  },
  {
    key: "emily",
    name: "Emily Carter",
    avatar: null,
    verified: true,
    since: 2022,
  },
  {
    key: "noah",
    name: "Noah Williams",
    avatar: photos.avatar4,
    verified: true,
    since: 2023,
  },
  {
    key: "sophia",
    name: "Sophia Lee",
    avatar: photos.avatar5,
    verified: true,
    since: 2022,
  },
  {
    key: "grace",
    name: "Grace Park",
    avatar: null,
    verified: true,
    since: 2024,
  },
  {
    key: "lucas",
    name: "Lucas Martin",
    avatar: null,
    verified: true,
    since: 2024,
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
