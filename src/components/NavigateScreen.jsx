import { ArrowLeft, MapPin } from "lucide-react";
import CompassArrow from "./CompassArrow.jsx";
import PermissionPrompt from "./PermissionPrompt.jsx";
import { useLocation } from "../hooks/useLocation.js";
import { useCompass } from "../hooks/useCompass.js";
import { haversine, bearing, formatDistance } from "../utils/geo.js";
import { ARRIVED_THRESHOLD_M } from "../constants/index.js";

export default function NavigateScreen({ spot, onBack }) {
  const { position, error: gpsError, loading, requestPermission } = useLocation();
  const { heading, supported: compassSupported } = useCompass();

  let distance = null;
  let rotation = 0;
  let arrived  = false;

  if (position) {
    distance = haversine(position.lat, position.lng, spot.lat, spot.lng);
    const dir = bearing(position.lat, position.lng, spot.lat, spot.lng);
    rotation  = heading !== null ? (dir - heading + 360) % 360 : dir;
    arrived   = distance < ARRIVED_THRESHOLD_M;
  }

  return (
    <div className="screen navigate-screen">
      <div className="nav-topbar">
        <button className="icon-btn" onClick={onBack}><ArrowLeft size={20} /></button>
        <div className="nav-title">
          <MapPin size={14} color="var(--accent)" />
          {spot.name}
        </div>
        <div style={{ width: 36 }} />
      </div>

      <div className="nav-content">
        {gpsError === "denied" ? (
          <PermissionPrompt onRetry={requestPermission} />
        ) : loading ? (
          <p className="nav-loading">Getting GPS fix…</p>
        ) : arrived ? (
          <div className="arrived">
            <div className="arrived-icon">✓</div>
            <div className="arrived-text">You&apos;re here!</div>
          </div>
        ) : (
          <>
            <CompassArrow
              rotation={rotation}
              unavailable={!compassSupported || heading === null}
              size={240}
            />
            <div className="nav-distance">
              {distance !== null ? formatDistance(distance) : "—"}
            </div>
            {!compassSupported && (
              <p className="compass-note">
                Compass unavailable — arrow points toward spot from North
              </p>
            )}
            <div className="nav-coords">
              {spot.lat.toFixed(5)}, {spot.lng.toFixed(5)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
