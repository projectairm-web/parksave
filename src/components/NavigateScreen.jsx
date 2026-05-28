import { ArrowLeft, MapPin } from "lucide-react";
import MapView from "./MapView.jsx";
import CompassArrow from "./CompassArrow.jsx";
import PermissionPrompt from "./PermissionPrompt.jsx";
import { useCompass } from "../hooks/useCompass.js";
import { haversine, bearing, formatDistance } from "../utils/geo.js";
import { ARRIVED_THRESHOLD_M } from "../constants/index.js";

export default function NavigateScreen({ spot, onBack, locationState }) {
  const { position, error: gpsError, requestPermission } = locationState;
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
        {distance !== null && (
          <span className="nav-topbar-dist">{formatDistance(distance)}</span>
        )}
      </div>

      {gpsError === "denied" ? (
        <div className="nav-content">
          <PermissionPrompt onRetry={requestPermission} />
        </div>
      ) : (
        <>
          <div className="map-wrap">
            <MapView currentPosition={position} spot={spot} />
            {arrived && (
              <div className="arrived-overlay">
                <div className="arrived-icon">✓</div>
                <div className="arrived-text">You&apos;re here!</div>
              </div>
            )}
          </div>

          <div className="nav-bottom-bar">
            <CompassArrow
              rotation={rotation}
              unavailable={!compassSupported || heading === null}
              size={72}
            />
            <div className="nav-bottom-info">
              <div className="nav-distance-lg">
                {distance !== null ? formatDistance(distance) : "Getting fix…"}
              </div>
              <div className="nav-coords">
                {spot.lat.toFixed(5)}, {spot.lng.toFixed(5)}
              </div>
              {!compassSupported && (
                <div className="compass-note">Compass unavailable</div>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  );
}
