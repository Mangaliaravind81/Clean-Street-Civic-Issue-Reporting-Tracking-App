
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

function MapClick({ coords, setCoords, onLocationChange }) {
  const map = useMapEvents({
    click(e) {
      const clicked = {
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      };

      setCoords(clicked);
      onLocationChange(clicked);
      map.setView([clicked.lat, clicked.lng], 14); // MOVE MAP
    },
  });

  return null;
}

function Recenter({ coords }) {
  const map = useMap();

  useEffect(() => {
    if (coords) {
      map.setView([coords.lat, coords.lng], 14);
    }
  }, [coords]);

  return null;
}

export default function MapComponent({ onLocationChange }) {
  const [coords, setCoords] = useState(null);
  const [userCoords, setUserCoords] = useState(null);

  // INITIAL USER LOCATION
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const userLoc = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };

      setCoords(userLoc);
      setUserCoords(userLoc);
      onLocationChange(userLoc);
    });
  }, []);

  if (!coords) return <p>Loading map...</p>;

  return (
    <div style={{ position: "relative", height: "100%" }}>
      <MapContainer
        center={[coords.lat, coords.lng]}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* CLICK HANDLER */}
        <MapClick
          coords={coords}
          setCoords={setCoords}
          onLocationChange={onLocationChange}
        />

        {/* MARKER */}
        <Marker position={[coords.lat, coords.lng]} />

        <Recenter coords={coords} />
      </MapContainer>

      {/* MY LOCATION BUTTON */}
      <button
        onClick={() => {
          setCoords(userCoords);
          onLocationChange(userCoords);
        }}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "white",
          padding: "6px 10px",
          borderRadius: "5px",
          boxShadow: "0 2px 6px rgba(0,0,0,.3)",
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        📍 My Location
      </button>
    </div>
  );
}
