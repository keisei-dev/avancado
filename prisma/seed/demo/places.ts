import { prisma } from "../client";
import { dateTime, seedUuid } from "./helpers";
import { photos } from "./photos";

// category = the slug of a PlaceCategory. updatedDaysAgo is how old the info is.
const places = [
  {
    key: "spanish-banks",
    category: "parks",
    name: "Spanish Banks Off-Leash",
    address: "4801 NW Marine Drive",
    latitude: 49.2766,
    longitude: -123.2139,
    hours: "Open 6 AM – 10 PM",
    phone: null,
    image: photos.spot1,
    updatedDaysAgo: 1,
    description:
      "A long stretch of sandy beach where dogs can run off-leash year-round. Low tide opens up huge tidal flats for zoomies, and there are water fountains and waste-bag stations along the path. Parking fills up early on sunny weekends.",
  },
  {
    key: "juniper-cafe",
    category: "food-drink",
    name: "Juniper Cafe & Bistro",
    address: "Main Street, Vancouver",
    latitude: 49.263,
    longitude: -123.1008,
    hours: "Open 8 AM – 6 PM",
    phone: "604-555-0142",
    image: photos.spot2,
    updatedDaysAgo: 4,
    description:
      "A cozy neighbourhood cafe with a covered, dog-friendly patio. Staff keep water bowls and house-made biscuits behind the counter.",
  },
  {
    key: "breka",
    category: "food-drink",
    name: "Breka Bakery & Café",
    address: "740 W Hastings St, Vancouver",
    latitude: 49.2851,
    longitude: -123.1153,
    hours: "Open 24 hours",
    phone: null,
    image: photos.spot4,
    updatedDaysAgo: 0,
    description:
      "Round-the-clock bakery with sidewalk seating where leashed dogs are welcome. A handy stop before or after a downtown walk.",
  },
  {
    key: "east-van-brewing",
    category: "food-drink",
    name: "East Van Brewing Co.",
    address: "Commercial Drive",
    latitude: 49.2722,
    longitude: -123.0695,
    hours: "Open 12 PM – 11 PM",
    phone: "604-555-0187",
    image: photos.spot5,
    updatedDaysAgo: 12,
    description:
      "Tasting room that welcomes well-behaved dogs inside. Water bowls by the door.",
  },
  {
    key: "pet-pantry",
    category: "shops",
    name: "The Pet Pantry",
    address: "West 4th Avenue",
    latitude: 49.2683,
    longitude: -123.16,
    hours: "Open 10 AM – 7 PM",
    phone: "604-555-0119",
    image: photos.dog2,
    updatedDaysAgo: 2,
    description:
      "Independent pet-supply shop with a self-serve dog wash in the back.",
  },
  {
    key: "harbour-clinic",
    category: "vets",
    name: "Harbour Pet Clinic",
    address: "Coal Harbour",
    latitude: 49.289,
    longitude: -123.124,
    hours: "Open 24 hours · Emergency",
    phone: "604-555-0188",
    image: photos.spot3,
    updatedDaysAgo: 7,
    description:
      "Full-service veterinary clinic with a 24-hour emergency line.",
  },
  {
    key: "burrard-hotel",
    category: "stays",
    name: "The Burrard Hotel",
    address: "Downtown Vancouver",
    latitude: 49.2796,
    longitude: -123.1287,
    hours: "Check-in from 3 PM",
    phone: null,
    image: photos.spot6,
    updatedDaysAgo: 30,
    description:
      "Boutique hotel with pet-friendly rooms and a courtyard. No pet fee for stays over two nights.",
  },
  // Old on purpose: the app shows an "info may be out of date" note after 180 days.
  {
    key: "pacific-spirit",
    category: "trails",
    name: "Pacific Spirit Trail",
    address: "Pacific Spirit Regional Park",
    latitude: 49.255,
    longitude: -123.208,
    hours: "Open dawn to dusk",
    phone: null,
    image: photos.spot7,
    updatedDaysAgo: 220,
    description:
      "Shaded forest trails with several off-leash loops. Check signage: some trails require leashes.",
  },
] as const;

export async function seedPlaces() {
  const categories = await prisma.placeCategory.findMany();
  const categoryIds = new Map(categories.map((c) => [c.slug, c.id]));

  for (const place of places) {
    const id = seedUuid(`place:${place.key}`);
    const categoryId = categoryIds.get(place.category);
    if (!categoryId) {
      throw new Error(
        `Category "${place.category}" not found. Run npm run db:seed first.`,
      );
    }
    const updatedAt = dateTime(-place.updatedDaysAgo, "12:00");

    // Prisma cannot write the PostGIS "location" column, so we use raw SQL.
    // We also set "updatedAt" ourselves (it is a Prisma feature, not a DB default).
    await prisma.$executeRaw`
      INSERT INTO "Place"
        ("id", "categoryId", "name", "description", "address", "latitude", "longitude",
         "location", "openingHours", "phone", "imageUrl", "status", "updatedAt")
      VALUES
        (${id}::uuid, ${categoryId}::uuid, ${place.name}, ${place.description}, ${place.address},
         ${place.latitude}::numeric, ${place.longitude}::numeric,
         ST_SetSRID(ST_MakePoint(${place.longitude}::float8, ${place.latitude}::float8), 4326)::geography,
         ${place.hours}, ${place.phone}::text, ${place.image}, 'ACTIVE'::"PlaceStatus",
         ${updatedAt}::timestamptz)
      ON CONFLICT ("id") DO UPDATE SET
        "categoryId" = EXCLUDED."categoryId",
        "name" = EXCLUDED."name",
        "description" = EXCLUDED."description",
        "address" = EXCLUDED."address",
        "latitude" = EXCLUDED."latitude",
        "longitude" = EXCLUDED."longitude",
        "location" = EXCLUDED."location",
        "openingHours" = EXCLUDED."openingHours",
        "phone" = EXCLUDED."phone",
        "imageUrl" = EXCLUDED."imageUrl",
        "updatedAt" = EXCLUDED."updatedAt"
    `;
  }

  console.log(`Seeded ${places.length} places.`);
}
