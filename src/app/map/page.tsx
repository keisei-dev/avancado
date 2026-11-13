import { Suspense } from 'react';
import { prisma } from '@/lib/prisma/client';
import { MapExplorer } from '@/components/map/map-explorer';

async function MapContent() {
  const [categories, rawPlaces] = await Promise.all([
    prisma.placeCategory.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.place.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
      include: { category: true },
    }),
  ]);

  const places = rawPlaces.map((place) => ({
    id: place.id,
    name: place.name,
    address: place.address,
    latitude: Number(place.latitude),
    longitude: Number(place.longitude),
    imageUrl: place.imageUrl,
    openingHours: place.openingHours,
    category: { name: place.category.name, slug: place.category.slug },
  }));

  return (
    <MapExplorer
      categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
      places={places}
    />
  );
}

export default function MapPage() {
  return (
    <Suspense
      fallback={<div className="flex-1 animate-pulse bg-cream" role="status" aria-label="Loading map" />}
    >
      <MapContent />
    </Suspense>
  );
}
