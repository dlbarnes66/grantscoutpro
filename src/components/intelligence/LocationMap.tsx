"use client"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type LocationMapProps = {
  lat: number | null;
  lng: number | null;
  label?: string;
};

export default function LocationMap({ lat, lng, label }: LocationMapProps) {
  // If geocoding failed or no coordinates yet
  if (!lat || !lng) {
    return (
      <div className="h-40 bg-gray-100 rounded flex items-center justify-center text-gray-500">
        No map data available
      </div>
    );
  }

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={11}
      scrollWheelZoom={false}
      className="h-40 rounded"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[lat, lng]}>
        <Popup>{label ?? "Location"}</Popup>
      </Marker>
    </MapContainer>
  );
}
