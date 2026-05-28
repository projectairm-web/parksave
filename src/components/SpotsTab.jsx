import { MapPin, SquareParking } from "lucide-react";
import SpotCard from "./SpotCard.jsx";

export default function SpotsTab({ spots, locationState, onNavigate, onDelete }) {
  const { position } = locationState;

  return (
    <div className="tab-screen spots-tab">
      <header className="app-header">
        <div className="app-brand">
          <SquareParking size={22} color="var(--accent)" />
          <span className="app-name">ParkSave</span>
        </div>
        <span className="spot-count">{spots.length} spot{spots.length !== 1 ? "s" : ""}</span>
      </header>

      <div className="spot-list">
        {spots.length === 0 ? (
          <div className="empty-state">
            <MapPin size={40} color="var(--text-subtle)" />
            <p className="empty-title">No saved spots yet</p>
            <p className="empty-sub">Go to the Map tab and tap "Save Parking Spot"</p>
          </div>
        ) : (
          spots.map(spot => (
            <SpotCard
              key={spot.id}
              spot={spot}
              currentPosition={position}
              onNavigate={onNavigate}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
