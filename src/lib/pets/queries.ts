import "server-only";

import { prisma } from "@/lib/prisma/client";
import type { PetDetail, PetSummary } from "./types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Prisma returns Decimal and Date objects. Turn them into plain values.
type DecimalLike = { toNumber(): number };
const toNumber = (value: DecimalLike) => value.toNumber();
const toNumberOrNull = (value: DecimalLike | null) =>
  value ? value.toNumber() : null;
const toDay = (date: Date) => date.toISOString().slice(0, 10);
const toDayOrNull = (date: Date | null) => (date ? toDay(date) : null);

/** The owner's active pets, oldest first (for the sidebar). */
export async function getMyPets(ownerId: string): Promise<PetSummary[]> {
  return prisma.pet.findMany({
    where: { ownerId, status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      species: true,
      breed: true,
      imageUrl: true,
    },
  });
}

/** One active pet of the owner with every health log (newest first). */
export async function getMyPetDetail(
  ownerId: string,
  petId: string,
): Promise<PetDetail | null> {
  // A wrong id format would make Prisma throw, so check it first.
  if (!UUID.test(petId)) return null;

  const pet = await prisma.pet.findFirst({
    where: { id: petId, ownerId, status: "ACTIVE" },
    include: {
      weightLogs: { orderBy: { measuredOn: "desc" } },
      vaccines: { orderBy: { administeredOn: "desc" } },
      vetVisits: { orderBy: { visitedOn: "desc" } },
      foodLogs: { orderBy: { eatenAt: "desc" } },
      walkLogs: { orderBy: { startedAt: "desc" } },
      toiletLogs: { orderBy: { loggedAt: "desc" } },
      emergencyContacts: { orderBy: { clinicName: "asc" } },
    },
  });
  if (!pet) return null;

  return {
    pet: {
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      imageUrl: pet.imageUrl,
      birthDate: toDayOrNull(pet.birthDate),
      weight: toNumberOrNull(pet.weight),
      gender: pet.gender,
      isNeutered: pet.isNeutered,
      isVaccinated: pet.isVaccinated,
      notes: pet.notes,
      updatedAt: pet.updatedAt.toISOString(),
    },
    logs: {
      weight: pet.weightLogs.map((log) => ({
        id: log.id,
        weight: toNumber(log.weight),
        measuredOn: toDay(log.measuredOn),
      })),
      vaccine: pet.vaccines.map((log) => ({
        id: log.id,
        vaccineName: log.vaccineName,
        administeredOn: toDay(log.administeredOn),
        nextDueOn: toDayOrNull(log.nextDueOn),
        notes: log.notes,
      })),
      vet: pet.vetVisits.map((log) => ({
        id: log.id,
        visitedOn: toDay(log.visitedOn),
        clinicName: log.clinicName,
        reason: log.reason,
        notes: log.notes,
      })),
      food: pet.foodLogs.map((log) => ({
        id: log.id,
        foodName: log.foodName,
        amount: toNumberOrNull(log.amount),
        unit: log.unit,
        eatenAt: log.eatenAt.toISOString(),
        notes: log.notes,
      })),
      walk: pet.walkLogs.map((log) => ({
        id: log.id,
        startedAt: log.startedAt.toISOString(),
        durationMinutes: log.durationMinutes,
        distanceKm: toNumberOrNull(log.distanceKm),
        notes: log.notes,
      })),
      toilet: pet.toiletLogs.map((log) => ({
        id: log.id,
        type: log.type,
        loggedAt: log.loggedAt.toISOString(),
        notes: log.notes,
      })),
      emergency: pet.emergencyContacts.map((contact) => ({
        id: contact.id,
        clinicName: contact.clinicName,
        phone: contact.phone,
        address: contact.address,
        notes: contact.notes,
      })),
    },
  };
}
