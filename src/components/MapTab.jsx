import { useState } from "react";
import { MapPin, SquareParking, LocateFixed } from "lucide-react";
import HomeMapView from "./HomeMapView.jsx";

export default function MapTab({ spots, locationState, onNavigate, onSave }) {
  const { position } = locationState;
  const [recenterTick, setRecenterTick] = useState(0);

  return (
    <div className="tab-screen map-tab">

      {/* Map fills the entire screen area */}
      <div className="map-full">
        <HomeMapView
          spots={spots}
          currentPosition={position}
          onNavigate={onNavigate}
          recenterTick={recenterTick}
        />
      </div>

      {/* Frosted header overlaid on map */}
      <header className="map-overlay-header">
        <div className="app-brand">
          <SquareParking size={20} color="var(--accent)" />
          <span className="app-name">ParkSave</span>
        </div>
        {spots.length > 0 && (
          <span className="spot-count">{spots.length} spot{spots.length !== 1 ? "s" : ""}</span>
        )}
      </header>

      {/* Recenter button — top right corner */}
      {position && (
        <button
          className="btn-recenter"
          onClick={() => setRecenterTick(t => t + 1)}
          title="Center on my location"
        >
          <LocateFixed size={18} />
        </button>
      )}

      {/* Bottom gradient scrim + save button */}
      <div className="map-bottom-overlay">
        <button className="btn-save" onClick={onSave}>
          <MapPin size={20} />
          Save Parking Spot
        </button>
      </div>

    </div>
  );
}
