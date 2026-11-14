'use client';

import dynamic from 'next/dynamic';

export const PlaceMiniMap = dynamic(() => import('./mini-map-core'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-cream" />,
});
