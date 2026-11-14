import { renderToStaticMarkup } from 'react-dom/server';
import L from 'leaflet';
import { categoryIcon } from './categories';

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

export function placePin(slug: string, active: boolean) {
  const key = `${slug}-${active}`;
  if (!iconCache.has(key)) iconCache.set(key, pinIcon(slug, active));
  return iconCache.get(key)!;
}

export const userPin = L.divIcon({
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  html: '<span class="block size-4 rounded-full border-[3px] border-white bg-sky-ink shadow-[0_0_0_6px_rgba(29,74,112,0.2)]"></span>',
});

export const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
