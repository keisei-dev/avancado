import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

// Seed scripts run outside Next.js, so we load .env.local ourselves.
config({ path: ".env.local" });

// We use DIRECT_URL (session pooler, port 5432) for scripts that run once.
const connectionString = process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL is not set. Check your .env.local file.");
}

export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});
