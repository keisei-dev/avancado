'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const oliveIcon = L.divIcon({
  className: 'custom-olive-marker',
  html: `<div style="background-color: #65a30d; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function MapController({ center, zoom, shouldFly }: { center: [number, number]; zoom: number; shouldFly: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!map || typeof map.flyTo !== 'function' || !shouldFly) return;

    const timer = setTimeout(() => {
      try {
        map.flyTo(center, zoom, {
          duration: 1.5,
        });
      } catch (e) {
        console.error("Map flyTo error:", e);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [center, zoom, map, shouldFly]);

  return null;
}

export default function MapCore({ places = [] }: { places: any[] }) {
  const defaultCoords: [number, number] = [49.2827, -123.1207];

  const [currentCoords, setCurrentCoords] = useState<[number, number]>(defaultCoords);
  const [currentZoom, setCurrentZoom] = useState<number>(15);
  const [isLocated, setIsLocated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shouldFly, setShouldFly] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-[600px] bg-slate-100 rounded-2xl animate-pulse flex items-center justify-center text-slate-400 font-medium">
        Loading Map... 🐾
      </div>
    );
  }

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Current location is not supported by your browser.");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentCoords([latitude, longitude]);
        setCurrentZoom(16);
        setIsLocated(true);
        setShouldFly(true);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        alert("Failed to get your location. Please check location permissions.");
        setLoading(false);
      },
      { enableHighAccuracy: true },
    );
  };

  return (
    <div className="w-full h-[600px] relative rounded-2xl overflow-hidden shadow-md">
      <button
        onClick={handleGetCurrentLocation}
        disabled={loading}
        className="absolute top-4 right-4 z-[1000] bg-white hover:bg-slate-50 text-slate-800 px-4 py-2 rounded-xl shadow-lg font-semibold text-sm flex items-center gap-2 border border-slate-200 transition-all disabled:opacity-50"
      >
        {loading ? "Locating... ⏳" : "📍 Find My Location"}
      </button>

      <MapContainer
        center={defaultCoords}
        zoom={currentZoom}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%" }}
        className="z-0"
      >
        <MapController center={currentCoords} zoom={currentZoom} shouldFly={shouldFly} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={currentCoords} icon={defaultIcon}>
          <Popup>
            <div className="p-1 text-center">
              <h3 className="font-bold text-base">
                {isLocated ? "📍 Your Current Location" : "📍 Vancouver Center"}
              </h3>
              <p className="text-sm text-gray-600">
                {isLocated ? "You are here!" : "Pet Spot Map"}
              </p>
            </div>
          </Popup>
        </Marker>

        {places.map((place: any) => {
          if (!place.latitude || !place.longitude) return null;
          return (
            <Marker 
              key={place.id} 
              position={[Number(place.latitude), Number(place.longitude)]} 
              icon={oliveIcon}
            >
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold text-sm">{place.name}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">{place.address}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}