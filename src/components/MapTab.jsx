import { MapPin, SquareParking } from "lucide-react";
import HomeMapView from "./HomeMapView.jsx";

export default function MapTab({ spots, locationState, onNavigate, onSave }) {
  const { position } = locationState;

  return (
    <div className="tab-screen map-tab">
      <header className="app-header">
        <div className="app-brand">
          <SquareParking size={22} color="var(--accent)" />
          <span className="app-name">ParkSave</span>
        </div>
      </header>

      {/* Full-screen map */}
      <div className="map-full">
        <HomeMapView spots={spots} currentPosition={position} onNavigate={onNavigate} />
      </div>

      {/* Floating save button above bottom tabs */}
      <div className="fab-wrap">
        <button className="btn-save" onClick={onSave}>
          <MapPin size={20} />
          Save Parking Spot
        </button>
      </div>
    </div>
  );
}
