'use client';

import dynamic from 'next/dynamic';

interface Place {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  address?: string | null;
  imageUrl?: string | null;
  [key: string]: unknown;
}

const MapCore = dynamic(() => import('./MapCore'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-slate-100 rounded-2xl animate-pulse flex items-center justify-center text-slate-400 font-medium">
      Loading Map... 🐾
    </div>
  ),
});

export default function PetMap({ places = [] }: { places?: Place[] }) {
  return <MapCore places={places} />;
}