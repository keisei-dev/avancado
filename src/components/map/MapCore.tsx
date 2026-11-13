'use client';

import { useEffect, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Image from 'next/image';
import Link from 'next/link';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { ArrowRight, LocateFixed, Minus, Plus } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { categoryIcon, categoryLabel } from './categories';
import type { MapPlace } from './map-explorer';

const VANCOUVER: [number, number] = [49.2827, -123.1207];

function pinIcon(slug: string, active: boolean) {
  const size = active ? 40 : 30;
  const Icon = categoryIcon(slug);
  const svg = renderToStaticMarkup(<Icon size={active ? 18 : 14} strokeWidth={2.2} />);
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size * 1.2],
    html: `<div class="grid place-items-center rounded-[50%_50%_50%_0] -rotate-45 border-2 border-white shadow-[0_3px_8px_rgba(0,0,0,0.25)] ${
      active ? 'bg-olive-hover' : 'bg-olive'
    }" style="width:${size}px;height:${size}px"><span class="rotate-45 text-white">${svg}</span></div>`,
  });
}

const iconCache = new Map<string, L.DivIcon>();

function icons(slug: string, active: boolean) {
  const key = `${slug}-${active}`;
  if (!iconCache.has(key)) iconCache.set(key, pinIcon(slug, active));
  return iconCache.get(key)!;
}

const userIcon = L.divIcon({
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  html: '<span class="block size-4 rounded-full border-[3px] border-white bg-sky-ink shadow-[0_0_0_6px_rgba(29,74,112,0.2)]"></span>',
});

export default function MapCore({
  places,
  selected,
  onSelect,
}: {
  places: MapPlace[];
  selected?: MapPlace;
  onSelect: (place: MapPlace) => void;
}) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [myLocation, setMyLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const lastSelectedId = useRef<string | undefined>(undefined);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Show every place when the map first opens.
  useEffect(() => {
    if (!map || places.length === 0) return;
    lastSelectedId.current = selected?.id;
    // Wait for the layout so the map knows its real size.
    const timer = setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(
        L.latLngBounds(places.map((p) => [p.latitude, p.longitude])),
        { paddingTopLeft: [60, 60], paddingBottomRight: [60, 170], maxZoom: 14 },
      );
    }, 50);
    return () => clearTimeout(timer);
    // Only on first load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // Glide to a newly selected place.
  useEffect(() => {
    if (!map || !selected || selected.id === lastSelectedId.current) return;
    lastSelectedId.current = selected.id;
    map.flyTo([selected.latitude, selected.longitude], Math.max(map.getZoom(), 14), {
      duration: 0.8,
    });
  }, [map, selected]);

  const findMe = () => {
    if (!navigator.geolocation) {
      setLocationError('Location is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const here: [number, number] = [coords.latitude, coords.longitude];
        setMyLocation(here);
        setLocating(false);
        map?.flyTo(here, 15, { duration: 0.8 });
      },
      () => {
        setLocating(false);
        setLocationError("Couldn't get your location. Check location permissions.");
      },
      { enableHighAccuracy: true },
    );
  };

  if (!isMounted) {
    return <div className="h-full w-full animate-pulse bg-cream" />;
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        ref={setMap}
        center={VANCOUVER}
        zoom={13}
        zoomSnap={0.25}
        zoomControl={false}
        scrollWheelZoom
        className="z-0 h-full w-full bg-white!"
      >
        {/* Light grey tone so the green pins stand out. */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="grayscale"
          opacity={0.7}
        />

        {places.map((place) => {
          const active = selected?.id === place.id;
          return (
            <Marker
              key={place.id}
              position={[place.latitude, place.longitude]}
              icon={icons(place.category.slug, active)}
              zIndexOffset={active ? 1000 : 0}
              title={place.name}
              eventHandlers={{ click: () => onSelect(place) }}
            />
          );
        })}

        {myLocation && <Marker position={myLocation} icon={userIcon} title="You are here" />}
      </MapContainer>

      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <button
          type="button"
          onClick={findMe}
          disabled={locating}
          aria-label="Use my location"
          title="Use my location"
          className={`grid size-[38px] place-items-center rounded-12 border border-line bg-white shadow-card transition-colors hover:bg-ivory disabled:opacity-60 ${
            myLocation ? 'text-olive' : 'text-brown'
          }`}
        >
          <LocateFixed size={18} className={locating ? 'animate-pulse' : ''} aria-hidden="true" />
        </button>
        <div className="flex flex-col overflow-hidden rounded-12 border border-line bg-white shadow-card">
          <button
            type="button"
            onClick={() => map?.zoomIn()}
            aria-label="Zoom in"
            className="grid size-[38px] place-items-center text-brown hover:bg-ivory"
          >
            <Plus size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => map?.zoomOut()}
            aria-label="Zoom out"
            className="grid size-[38px] place-items-center border-t border-line text-brown hover:bg-ivory"
          >
            <Minus size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      {locationError && (
        <div
          role="alert"
          className="absolute top-4 left-4 z-[1000] max-w-[calc(100%-6rem)] rounded-12 border border-coral-line bg-white px-3 py-2 text-sm text-coral shadow-card"
        >
          {locationError}
        </div>
      )}

      {selected && (
        <div className="absolute right-4 bottom-7 left-4 z-[1000] flex gap-4 rounded-2xl bg-white p-3 shadow-raised tablet:left-auto tablet:w-[400px]">
          <div className="relative h-[120px] w-[110px] shrink-0 overflow-hidden rounded-12 bg-cream">
            {selected.imageUrl && (
              <Image src={selected.imageUrl} alt="" fill sizes="110px" className="object-cover" />
            )}
          </div>
          <div className="min-w-0 flex-1 py-1">
            <span className="text-xs font-semibold text-olive-dark">{categoryLabel(selected.category)}</span>
            <h3 className="truncate font-display text-[17px] font-bold text-brown">{selected.name}</h3>
            <p className="truncate text-sm text-muted">{selected.address}</p>
            {selected.openingHours && (
              <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-brown-2">
                <span className="size-2 shrink-0 rounded-full bg-success" aria-hidden="true" />
                {selected.openingHours}
              </p>
            )}
            <Link
              href={`/map/${selected.id}`}
              className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-olive-dark hover:underline"
            >
              View place details
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
