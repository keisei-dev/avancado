import { prisma } from "../client";
import { dateOnly, dateTime, hhmm, seedUuid } from "./helpers";
import { photos } from "./photos";
import { userId } from "./users";

const pets = [
  {
    key: "sunny",
    owner: "maya",
    species: "DOG",
    name: "Sunny",
    breed: "Golden Retriever",
    birthDate: "2022-03-14",
    weight: 29,
    gender: "MALE",
    isNeutered: true,
    isVaccinated: true,
    imageUrl: photos.dog1,
    notes:
      "Playful, friendly, and happiest on long neighbourhood walks. Loves people, gentle dogs, and a good game of fetch. Allergic to chicken.",
  },
  {
    key: "luna",
    owner: "maya",
    species: "CAT",
    name: "Luna",
    breed: "Domestic Shorthair",
    birthDate: "2023-06-02",
    weight: 4.6,
    gender: "FEMALE",
    isNeutered: true,
    isVaccinated: true,
    imageUrl: photos.cat3,
    notes:
      "Gentle and cuddly once she feels comfortable. Indoor cat who enjoys quiet company and short play sessions.",
  },
  {
    key: "charlie",
    owner: "emily",
    species: "DOG",
    name: "Charlie",
    breed: "Beagle",
    birthDate: "2017-05-10",
    weight: 13,
    gender: "MALE",
    isNeutered: true,
    isVaccinated: false,
    imageUrl: photos.dog1,
    notes:
      "Senior and gentle. Takes a joint supplement with breakfast (in the blue jar). Slow walker who loves to sniff. Pulls toward squirrels.",
  },
  {
    key: "coco",
    owner: "sophia",
    species: "DOG",
    name: "Coco",
    breed: "Poodle",
    birthDate: "2024-04-02",
    weight: 10,
    gender: "FEMALE",
    isNeutered: true,
    isVaccinated: false,
    imageUrl: photos.dog3,
    notes:
      "Friendly with dogs and people. Responds well to treats. Still learning not to jump up to say hello.",
  },
  {
    key: "pepper",
    owner: "lucas",
    species: "CAT",
    name: "Pepper",
    breed: "Domestic Shorthair",
    birthDate: "2020-02-11",
    weight: 5,
    gender: "FEMALE",
    isNeutered: true,
    isVaccinated: false,
    imageUrl: photos.cat2,
    notes:
      "Indoor only, so please keep the balcony door closed. Hides for the first 10 minutes, then wants cuddles. Wet food morning and evening.",
  },
  {
    key: "milo",
    owner: "noah",
    species: "DOG",
    name: "Milo",
    breed: "Labrador Retriever",
    birthDate: "2023-08-19",
    weight: 31,
    gender: "MALE",
    isNeutered: false,
    isVaccinated: false,
    imageUrl: photos.dog5,
    notes:
      "High energy. Fetch is his favourite thing. Strong puller, so use the front-clip harness. Will eat anything off the ground.",
  },
  {
    key: "biscuit",
    owner: "grace",
    species: "DOG",
    name: "Biscuit",
    breed: "Cavalier King Charles Spaniel",
    birthDate: "2021-06-30",
    weight: 8,
    gender: "FEMALE",
    isNeutered: true,
    isVaccinated: false,
    imageUrl: photos.dog4,
    notes:
      "Calm and cuddly. Gets anxious with loud noises. Prefers short evening walks.",
  },
] as const;

export type PetKey = (typeof pets)[number]["key"];

export function petId(key: PetKey): string {
  return seedUuid(`pet:${key}`);
}

// [poop, pee] per day for the last 7 days, oldest first.
const toiletPattern = [
  [2, 4],
  [2, 3],
  [3, 4],
  [2, 4],
  [2, 3],
  [3, 4],
  [2, 3],
] as const;

function toiletLogs(petKey: PetKey, scale: number) {
  return toiletPattern.flatMap(([poop, pee], index) => {
    const day = index - 6;
    const poopRows = Array.from(
      { length: Math.max(1, Math.round(poop * scale)) },
      (_, n) => ({
        id: seedUuid(`toilet:${petKey}:${index}:poop:${n}`),
        petId: petId(petKey),
        type: "POOP" as const,
        loggedAt: dateTime(day, hhmm(7 + n * 5, 15)),
        notes: null,
      }),
    );
    const peeRows = Array.from(
      { length: Math.max(1, Math.round(pee * scale)) },
      (_, n) => ({
        id: seedUuid(`toilet:${petKey}:${index}:pee:${n}`),
        petId: petId(petKey),
        type: "PEE" as const,
        loggedAt: dateTime(day, hhmm(8 + n * 4, 40)),
        notes: null,
      }),
    );
    return [...poopRows, ...peeRows];
  });
}

export async function seedPets() {
  for (const pet of pets) {
    const data = {
      ownerId: userId(pet.owner),
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      birthDate: new Date(pet.birthDate),
      weight: pet.weight,
      gender: pet.gender,
      isNeutered: pet.isNeutered,
      isVaccinated: pet.isVaccinated,
      notes: pet.notes,
      imageUrl: pet.imageUrl,
    };
    await prisma.pet.upsert({
      where: { id: petId(pet.key) },
      update: data,
      create: { id: petId(pet.key), ...data },
    });
  }

  // Health logs only for Maya's two pets (the "My Pets" demo).
  await prisma.petToiletLog.createMany({
    data: [...toiletLogs("sunny", 1), ...toiletLogs("luna", 0.7)],
    skipDuplicates: true,
  });

  await prisma.petFoodLog.createMany({
    data: [
      {
        id: seedUuid("food:1"),
        petId: petId("sunny"),
        foodName: "Salmon kibble",
        amount: 1.5,
        unit: "cups",
        eatenAt: dateTime(0, "08:00"),
        notes: "Ate everything",
      },
      {
        id: seedUuid("food:2"),
        petId: petId("sunny"),
        foodName: "Salmon kibble",
        amount: 1.5,
        unit: "cups",
        eatenAt: dateTime(-1, "18:00"),
        notes: null,
      },
      {
        id: seedUuid("food:3"),
        petId: petId("sunny"),
        foodName: "Dental chew",
        amount: 1,
        unit: "treats",
        eatenAt: dateTime(-1, "20:30"),
        notes: null,
      },
      {
        id: seedUuid("food:4"),
        petId: petId("luna"),
        foodName: "Sensitive formula",
        amount: 40,
        unit: "g",
        eatenAt: dateTime(0, "07:30"),
        notes: "Left a little",
      },
      {
        id: seedUuid("food:5"),
        petId: petId("luna"),
        foodName: "Wet food, tuna",
        amount: 1,
        unit: "pouches",
        eatenAt: dateTime(-1, "17:30"),
        notes: null,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.petWeightLog.createMany({
    data: [
      {
        id: seedUuid("weight:1"),
        petId: petId("sunny"),
        weight: 28.2,
        measuredOn: dateOnly(-120),
      },
      {
        id: seedUuid("weight:2"),
        petId: petId("sunny"),
        weight: 28.6,
        measuredOn: dateOnly(-90),
      },
      {
        id: seedUuid("weight:3"),
        petId: petId("sunny"),
        weight: 28.9,
        measuredOn: dateOnly(-60),
      },
      {
        id: seedUuid("weight:4"),
        petId: petId("sunny"),
        weight: 28.7,
        measuredOn: dateOnly(-30),
      },
      {
        id: seedUuid("weight:5"),
        petId: petId("sunny"),
        weight: 29.0,
        measuredOn: dateOnly(-3),
      },
      {
        id: seedUuid("weight:6"),
        petId: petId("luna"),
        weight: 4.3,
        measuredOn: dateOnly(-120),
      },
      {
        id: seedUuid("weight:7"),
        petId: petId("luna"),
        weight: 4.4,
        measuredOn: dateOnly(-60),
      },
      {
        id: seedUuid("weight:8"),
        petId: petId("luna"),
        weight: 4.6,
        measuredOn: dateOnly(-5),
      },
    ],
    skipDuplicates: true,
  });

  await prisma.petVaccine.createMany({
    data: [
      {
        id: seedUuid("vaccine:1"),
        petId: petId("sunny"),
        vaccineName: "DHPP booster",
        administeredOn: dateOnly(-300),
        nextDueOn: dateOnly(65),
        notes: "Harbour Pet Clinic",
      },
      {
        id: seedUuid("vaccine:2"),
        petId: petId("sunny"),
        vaccineName: "Rabies",
        administeredOn: dateOnly(-400),
        nextDueOn: dateOnly(700),
        notes: "3-year vaccine",
      },
      {
        id: seedUuid("vaccine:3"),
        petId: petId("luna"),
        vaccineName: "FVRCP booster",
        administeredOn: dateOnly(-280),
        nextDueOn: dateOnly(85),
        notes: "Harbour Pet Clinic",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.petVetVisit.createMany({
    data: [
      {
        id: seedUuid("vet:1"),
        petId: petId("sunny"),
        visitedOn: dateOnly(-40),
        clinicName: "Harbour Pet Clinic",
        reason: "Annual wellness exam",
        notes: "All good. Weight on target.",
      },
      {
        id: seedUuid("vet:2"),
        petId: petId("sunny"),
        visitedOn: dateOnly(-150),
        clinicName: "Harbour Pet Clinic",
        reason: "Itchy skin and paws",
        notes: "Switched to salmon kibble. Resolved.",
      },
      {
        id: seedUuid("vet:3"),
        petId: petId("luna"),
        visitedOn: dateOnly(-70),
        clinicName: "Harbour Pet Clinic",
        reason: "Reduced appetite",
        notes: "Dental check. Symptoms resolved.",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.petWalkLog.createMany({
    data: [
      {
        id: seedUuid("walk:1"),
        petId: petId("sunny"),
        startedAt: dateTime(-6, "07:30"),
        durationMinutes: 32,
        distanceKm: 2.4,
        notes: null,
      },
      {
        id: seedUuid("walk:2"),
        petId: petId("sunny"),
        startedAt: dateTime(-5, "07:45"),
        durationMinutes: 45,
        distanceKm: 3.5,
        notes: null,
      },
      {
        id: seedUuid("walk:3"),
        petId: petId("sunny"),
        startedAt: dateTime(-4, "18:10"),
        durationMinutes: 28,
        distanceKm: 2.0,
        notes: "Rainy",
      },
      {
        id: seedUuid("walk:4"),
        petId: petId("sunny"),
        startedAt: dateTime(-3, "07:20"),
        durationMinutes: 58,
        distanceKm: 4.6,
        notes: "Spanish Banks",
      },
      {
        id: seedUuid("walk:5"),
        petId: petId("sunny"),
        startedAt: dateTime(-2, "07:30"),
        durationMinutes: 42,
        distanceKm: 3.2,
        notes: null,
      },
      {
        id: seedUuid("walk:6"),
        petId: petId("sunny"),
        startedAt: dateTime(-1, "09:00"),
        durationMinutes: 64,
        distanceKm: 5.1,
        notes: "Long beach walk",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.emergencyContact.createMany({
    data: [
      {
        id: seedUuid("emergency:1"),
        petId: petId("sunny"),
        clinicName: "Harbour Pet Clinic",
        phone: "+1 604 555 0188",
        address: "1285 W Pender Street, Vancouver",
        notes: "Regular vet",
      },
      {
        id: seedUuid("emergency:2"),
        petId: petId("sunny"),
        clinicName: "Vancouver Animal Emergency (24h)",
        phone: "+1 604 555 0911",
        address: null,
        notes: "After hours",
      },
      {
        id: seedUuid("emergency:3"),
        petId: petId("luna"),
        clinicName: "Harbour Pet Clinic",
        phone: "+1 604 555 0188",
        address: "1285 W Pender Street, Vancouver",
        notes: "Regular vet",
      },
    ],
    skipDuplicates: true,
  });

  console.log(
    `Seeded ${pets.length} pets with health logs for Sunny and Luna.`,
  );
}
