import { useState } from "react";
import { Navigation, Trash2 } from "lucide-react";
import { haversine, formatDistance, accuracyColor } from "../utils/geo.js";

export default function SpotCard({ spot, currentPosition, onNavigate, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const distance = currentPosition
    ? haversine(currentPosition.lat, currentPosition.lng, spot.lat, spot.lng)
    : null;

  const savedDate = new Date(spot.savedAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="spot-card">
      <div className="spot-info">
        <div className="spot-name">{spot.name}</div>
        <div className="spot-meta">
          <span>{savedDate}</span>
          {spot.accuracy != null && (
            <span style={{ color: accuracyColor(spot.accuracy) }}>±{Math.round(spot.accuracy)} m</span>
          )}
          {distance !== null && (
            <span className="spot-distance">{formatDistance(distance)}</span>
          )}
        </div>
      </div>

      <div className="spot-actions">
        {confirmDelete ? (
          <>
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(spot.id)}>Delete</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(false)}>Cancel</button>
          </>
        ) : (
          <>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate(spot)}>
              <Navigation size={14} />
              Navigate
            </button>
            <button className="icon-btn danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
