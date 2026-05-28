import { useState } from "react";
import { MapPin, SquareParking } from "lucide-react";
import SpotCard from "./SpotCard.jsx";
import SaveModal from "./SaveModal.jsx";
import HomeMapView from "./HomeMapView.jsx";
import { useSpots } from "../hooks/useSpots.js";

export default function HomeScreen({ onNavigate, locationState }) {
  const [showSave, setShowSave] = useState(false);
  const { position, error, loading, requestPermission } = locationState;
  const { spots, addSpot, deleteSpot } = useSpots();

  const handleSave = (name, pos) => {
    addSpot(name, pos);
    setShowSave(false);
  };

  return (
    <div className="screen home-screen">
      <header className="app-header">
        <div className="app-brand">
          <SquareParking size={22} color="var(--accent)" />
          <span className="app-name">ParkSave</span>
        </div>
        <span className="spot-count">{spots.length} spot{spots.length !== 1 ? "s" : ""}</span>
      </header>

      {/* Map — always visible, shows spots + current position */}
      <HomeMapView spots={spots} currentPosition={position} />

      {/* Spot list */}
      <div className="spot-list">
        {spots.length === 0 ? (
          <div className="empty-state">
            <MapPin size={36} color="var(--text-subtle)" />
            <p className="empty-title">No saved spots yet</p>
            <p className="empty-sub">Tap the button below to save your parking location</p>
          </div>
        ) : (
          spots.map(spot => (
            <SpotCard
              key={spot.id}
              spot={spot}
              currentPosition={position}
              onNavigate={onNavigate}
              onDelete={deleteSpot}
            />
          ))
        )}
      </div>

      <div className="save-btn-wrap">
        <button className="btn-save" onClick={() => setShowSave(true)}>
          <MapPin size={20} />
          Save Parking Spot
        </button>
      </div>

      {showSave && (
        <SaveModal
          position={position}
          loading={loading}
          error={error}
          spots={spots}
          onSave={handleSave}
          onClose={() => setShowSave(false)}
          onRetryPermission={requestPermission}
        />
      )}
    </div>
  );
}
