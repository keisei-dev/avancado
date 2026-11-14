'use client';

import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { placePin, TILE_ATTRIBUTION, TILE_URL } from './pins';

export default function MiniMapCore({
  latitude,
  longitude,
  slug,
  name,
}: {
  latitude: number;
  longitude: number;
  slug: string;
  name: string;
}) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={13}
      zoomControl={false}
      scrollWheelZoom={false}
      className="z-0 h-full w-full bg-white!"
    >
      <TileLayer
        attribution={TILE_ATTRIBUTION}
        url={TILE_URL}
        className="grayscale"
        opacity={0.7}
      />
      <Marker position={[latitude, longitude]} icon={placePin(slug, true)} title={name} />
    </MapContainer>
  );
}
