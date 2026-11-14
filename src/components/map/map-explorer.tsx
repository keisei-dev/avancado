'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, MapPin } from 'lucide-react';
import { SearchField } from '@/components/ui/search-field';
import { categoryLabel } from './categories';

export type MapCategory = { name: string; slug: string };

export type MapPlace = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  imageUrl: string | null;
  openingHours: string | null;
  category: MapCategory;
};

const MapCore = dynamic(() => import('./map-core'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-cream" />,
});

export function MapExplorer({
  categories,
  places,
}: {
  categories: MapCategory[];
  places: MapPlace[];
}) {
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(places[0]?.id);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return places.filter((place) => {
      if (category !== 'all' && place.category.slug !== category) return false;
      if (!q) return true;
      return `${place.name} ${place.address} ${place.category.name}`.toLowerCase().includes(q);
    });
  }, [places, category, query]);

  const selected = filtered.find((p) => p.id === selectedId) ?? filtered[0];

  const chooseCategory = (slug: string) => {
    setCategory(slug);
    const first = places.find((p) => slug === 'all' || p.category.slug === slug);
    if (first) setSelectedId(first.id);
  };

  const chips = [{ name: 'All', slug: 'all' }, ...categories.map((c) => ({ name: categoryLabel(c), slug: c.slug }))];

  return (
    <main className="flex flex-1 flex-col tablet:h-[calc(100dvh-65px)] tablet:flex-none tablet:flex-row tablet:overflow-hidden">
      <section className="flex flex-col border-line bg-ivory tablet:min-h-0 tablet:w-[360px] tablet:shrink-0 tablet:border-r wide:w-[420px]">
        <div className="border-b border-line px-5 pt-6 pb-4">
          <h1 className="mb-3 text-2xl font-display font-bold tracking-[-0.02em] leading-[1.2] text-brown">
            Pet-friendly map
          </h1>
          <SearchField
            label="Search places"
            placeholder="Search places"
            value={query}
            onValueChange={setQuery}
            className="bg-white"
          />
          <div
            role="tablist"
            aria-label="Categories"
            className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {chips.map(({ name, slug }) => {
              const active = slug === category;
              return (
                <button
                  key={slug}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => chooseCategory(slug)}
                  className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                    active
                      ? 'border-olive-dark bg-olive-dark text-white'
                      : 'border-line-strong bg-white text-brown hover:border-beige'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 space-y-2 p-3 tablet:min-h-0 tablet:overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-1 px-2 py-10 text-center">
              <MapPin size={18} className="mb-1 text-olive" aria-hidden="true" />
              <p className="text-[15px] font-bold text-brown">No places found</p>
              <p className="text-[13px] text-muted">
                {query.trim() ? `Nothing matches “${query.trim()}”.` : 'No places in this category yet.'}{' '}
                Try another category or search.
              </p>
            </div>
          ) : (
            filtered.map((place) => {
              const active = selected?.id === place.id;
              return (
                <div
                  key={place.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={active}
                  onClick={() => setSelectedId(place.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedId(place.id);
                    }
                  }}
                  className={`flex cursor-pointer items-center gap-3.5 rounded-2xl border bg-white p-2.5 transition-shadow hover:shadow-card focus-visible:outline-none focus-visible:shadow-focus ${
                    active ? 'border-olive ring-2 ring-sage' : 'border-line'
                  }`}
                >
                  <div className="relative size-[72px] shrink-0 overflow-hidden rounded-12 bg-cream">
                    {place.imageUrl && (
                      <Image src={place.imageUrl} alt="" fill sizes="72px" className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-display text-[15px] font-semibold text-brown">
                      {place.name}
                    </h3>
                    <p className="truncate text-[13px] text-muted">
                      {categoryLabel(place.category)} · {place.address.split(',')[0]}
                    </p>
                  </div>
                  <Link
                    href={`/map/${place.id}`}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Open ${place.name} details`}
                    className="grid size-9 shrink-0 place-items-center rounded-full text-brown-2 hover:bg-cream hover:text-brown"
                  >
                    <ChevronRight size={18} aria-hidden="true" />
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </section>

      <div className="relative h-[480px] tablet:h-auto tablet:flex-1">
        <MapCore places={filtered} selected={selected} onSelect={(p) => setSelectedId(p.id)} />
      </div>
    </main>
  );
}
