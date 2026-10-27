// Notion flow: Map: Explore map
// TODO: implement

'use client';

import dynamic from 'next/dynamic';

const PetMap = dynamic(() => import('@/components/map/MapContainer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400">
      Loading Pet Map... 🐾
    </div>
  ),
});

export default function MapPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-8">
      <h1 className="text-2xl font-bold">Explore map</h1>
      <PetMap />
    </main>
  );
}