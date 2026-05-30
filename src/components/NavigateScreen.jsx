import { useEffect, useRef, useState } from "react";
import { ArrowLeft, MapPin, Trash2, Navigation } from "lucide-react";
import MapView from "./MapView.jsx";
import CompassArrow from "./CompassArrow.jsx";
import PermissionPrompt from "./PermissionPrompt.jsx";
import { useCompass } from "../hooks/useCompass.js";
import { haversine, bearing, formatDistance, formatTimeLeft } from "../utils/geo.js";
import { ARRIVED_THRESHOLD_M } from "../constants/index.js";

function openGoogleMaps(spot, position) {
  const params = new URLSearchParams({
    api: "1",
    destination: `${spot.lat},${spot.lng}`,
    travelmode: "walking",
  });
  if (position) params.set("origin", `${position.lat},${position.lng}`);
  window.open(`https://www.google.com/maps/dir/?${params}`, "_blank");
}

function TimerBadge({ expiresAt }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);
  const tl = formatTimeLeft(expiresAt, now);
  if (!tl) return null;
  return <span className="nav-timer-badge" style={{ color: tl.color }}>{tl.text}</span>;
}

export default function NavigateScreen({ spot, onBack, onDelete, locationState }) {
  const { position, error: gpsError, requestPermission } = locationState;
  const { heading, supported: compassSupported } = useCompass();
  const arrivedFiredRef = useRef(false);

  let distance = null;
  let rotation = 0;
  let arrived  = false;

  if (position) {
    distance = haversine(position.lat, position.lng, spot.lat, spot.lng);
    const dir = bearing(position.lat, position.lng, spot.lat, spot.lng);
    rotation  = heading !== null ? (dir - heading + 360) % 360 : dir;
    arrived   = distance < ARRIVED_THRESHOLD_M;
  }

  // Haptic feedback on arrival
  useEffect(() => {
    if (arrived && !arrivedFiredRef.current) {
      arrivedFiredRef.current = true;
      (async () => {
        try {
          if (window.Capacitor?.isNativePlatform?.()) {
            const mod = await import("@capacitor/haptics");
            await mod.Haptics.impact({ style: mod.ImpactStyle.Heavy });
          } else {
            navigator.vibrate?.([200, 100, 200]);
          }
        } catch {}
      })();
    }
    if (!arrived) arrivedFiredRef.current = false;
  }, [arrived]);

  const handleDelete = () => {
    onDelete(spot.id);
    onBack();
  };

  return (
    <div className="screen navigate-screen">

      <div className="nav-topbar">
        <button className="icon-btn" onClick={onBack}><ArrowLeft size={20} /></button>
        <div className="nav-title">
          <MapPin size={14} color="var(--accent)" />
          {spot.name}
        </div>
        <div className="nav-topbar-right">
          {distance !== null && (
            <span className="nav-topbar-dist">{formatDistance(distance)}</span>
          )}
          {spot.expiresAt && <TimerBadge expiresAt={spot.expiresAt} />}
        </div>
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
                <div className="arrived-actions">
                  <button className="btn btn-danger arrived-delete" onClick={handleDelete}>
                    <Trash2 size={15} />
                    Remove spot
                  </button>
                  <button className="btn btn-ghost arrived-keep" onClick={onBack}>
                    Keep it
                  </button>
                </div>
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
              <button
                className="btn-open-maps"
                onClick={() => openGoogleMaps(spot, position)}
              >
                <Navigation size={14} />
                Open in Google Maps
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
