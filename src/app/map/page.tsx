import { Suspense } from 'react';
import Image from 'next/image';
import { prisma } from "@/lib/prisma/client";
import PetMap from '@/components/map/MapContainer';

async function MapContent() {
  const categories = await prisma.placeCategory.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  const rawPlaces = await prisma.place.findMany({
    include: {
      category: true,
    },
  });

  const places = rawPlaces.map((place) => ({
    ...place,
    latitude: place.latitude ? Number(place.latitude) : null,
    longitude: place.longitude ? Number(place.longitude) : null,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 h-[600px] overflow-y-auto">
        <div className="flex gap-2 overflow-x-auto pb-2 shrink-0 scrollbar-none">
          <span className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-semibold cursor-pointer shrink-0">All</span>
          {categories.map((cat) => (
            <span key={cat.id} className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold cursor-pointer shrink-0 whitespace-nowrap hover:bg-slate-200">
              {cat.name}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {places.map((place) => (
            <div key={place.id} className="p-3 border border-slate-100 rounded-xl hover:shadow-md transition cursor-pointer bg-slate-50 flex gap-3 items-center">
              {place.imageUrl ? (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-200">
                  <Image src={place.imageUrl} alt={place.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg bg-slate-200 shrink-0 flex items-center justify-center text-xs text-slate-400">
                  🐾
                </div>
              )}
              <div className="overflow-hidden">
                <h3 className="font-bold text-sm text-slate-800 truncate">{place.name}</h3>
                <p className="text-xs text-slate-500 mt-1 truncate">{place.address}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2">
        <PetMap places={places} />
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-8">
      <h1 className="text-2xl font-bold">Explore map</h1>
      <Suspense fallback={<div className="w-full h-[600px] bg-slate-100 rounded-2xl animate-pulse flex items-center justify-center text-slate-400 font-medium">Loading Map Data... 🐾</div>}>
        <MapContent />
      </Suspense>
    </main>
  );
}