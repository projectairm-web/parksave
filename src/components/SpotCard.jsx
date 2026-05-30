import { useState, useEffect } from "react";
import { Navigation, Trash2, Share2 } from "lucide-react";
import { haversine, formatDistance, accuracyColor, formatAge, formatTimeLeft } from "../utils/geo.js";
import { SPOT_TYPES } from "../constants/index.js";

function walkTime(meters) {
  if (meters === null) return null;
  const mins = Math.ceil(meters / 83);
  if (mins < 1) return "< 1 min walk";
  return `~${mins} min walk`;
}

async function shareSpot(spot) {
  const url  = `https://maps.google.com/?q=${spot.lat},${spot.lng}`;
  const text = `My parking spot: ${spot.name}`;
  try {
    if (window.Capacitor?.isNativePlatform?.()) {
      const { Share } = await import("@capacitor/share");
      await Share.share({ title: spot.name, text, url, dialogTitle: "Share parking spot" });
    } else if (navigator.share) {
      await navigator.share({ title: spot.name, text, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  } catch {}
}

export default function SpotCard({ spot, currentPosition, onNavigate, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const distance = currentPosition
    ? haversine(currentPosition.lat, currentPosition.lng, spot.lat, spot.lng)
    : null;

  const timeLeft  = formatTimeLeft(spot.expiresAt, now);
  const spotType  = SPOT_TYPES.find(t => t.id === spot.type);

  return (
    <div className="spot-card">
      {spot.photo && (
        <img src={spot.photo} className="spot-photo" alt="" />
      )}

      <div className="spot-info">
        <div className="spot-name-row">
          <span className="spot-name">{spot.name}</span>
          {spotType && (
            <span className="spot-type-badge">{spotType.emoji} {spotType.label}</span>
          )}
        </div>

        {spot.notes && (
          <div className="spot-notes">{spot.notes}</div>
        )}

        <div className="spot-meta">
          <span className="spot-age">{formatAge(spot.savedAt, now)}</span>
          {spot.accuracy != null && (
            <span style={{ color: accuracyColor(spot.accuracy) }}>±{Math.round(spot.accuracy)}m</span>
          )}
          {distance !== null && (
            <span className="spot-distance">{formatDistance(distance)}</span>
          )}
          {distance !== null && (
            <span className="spot-walk">{walkTime(distance)}</span>
          )}
          {timeLeft && (
            <span style={{ color: timeLeft.color, fontWeight: 600 }}>{timeLeft.text}</span>
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
              Go
            </button>
            <button className="icon-btn" onClick={() => shareSpot(spot)} title="Share location">
              <Share2 size={16} />
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
