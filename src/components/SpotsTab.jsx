import { MapPin, SquareParking, History } from "lucide-react";
import SpotCard from "./SpotCard.jsx";
import { formatAge } from "../utils/geo.js";

export default function SpotsTab({ spots, locationState, onNavigate, onDelete, history, onRestore, onClearHistory }) {
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

        {history.length > 0 && (
          <div className="history-section">
            <div className="history-header">
              <div className="history-header-left">
                <History size={14} color="var(--text-subtle)" />
                <span className="history-title">Recently deleted</span>
              </div>
              <button className="btn-text" onClick={onClearHistory}>Clear</button>
            </div>
            {history.map(spot => (
              <div key={spot.id} className="history-card">
                <div className="history-info">
                  <span className="history-name">{spot.name}</span>
                  <span className="history-meta">Deleted {formatAge(spot.deletedAt)}</span>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => onRestore(spot.id)}>
                  Restore
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
