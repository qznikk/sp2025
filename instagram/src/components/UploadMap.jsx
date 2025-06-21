import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Naprawa ikon Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function LocationSelector({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function UploadMap({ selectedLat, selectedLng, onSelect }) {
  const defaultPosition = [52.2297, 21.0122]; // Warszawa

  return (
    <MapContainer
      center={selectedLat && selectedLng ? [selectedLat, selectedLng] : defaultPosition}
      zoom={6}
      scrollWheelZoom={true}
      style={{ height: "300px", width: "100%", marginTop: "1rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationSelector onSelect={onSelect} />
      {selectedLat && selectedLng && (
        <Marker position={[selectedLat, selectedLng]} />
      )}
    </MapContainer>
  );
}
