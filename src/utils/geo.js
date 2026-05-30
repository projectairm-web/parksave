export const uid = () => Math.random().toString(36).slice(2, 10);

export function formatAge(savedAt, now = Date.now()) {
  const m = Math.floor((now - savedAt) / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60), rem = m % 60;
  return rem > 0 ? `${h}h ${rem}m ago` : `${h}h ago`;
}

export function formatTimeLeft(expiresAt, now = Date.now()) {
  if (!expiresAt) return null;
  const ms = expiresAt - now;
  if (ms <= 0) return { text: "Expired", color: "var(--danger)" };
  const totalMins = Math.ceil(ms / 60000);
  if (totalMins <= 10) return { text: `${totalMins}m left`, color: "var(--danger)" };
  if (totalMins <= 30) return { text: `${totalMins}m left`, color: "var(--acc-fair)" };
  const h = Math.floor(totalMins / 60), m = totalMins % 60;
  const text = h > 0 ? (m > 0 ? `${h}h ${m}m left` : `${h}h left`) : `${totalMins}m left`;
  return { text, color: "var(--acc-good)" };
}

export function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function bearing(lat1, lng1, lat2, lng2) {
  const toRad = d => d * Math.PI / 180;
  const dLng  = toRad(lng2 - lng1);
  const x = Math.cos(toRad(lat2)) * Math.sin(dLng);
  const y = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
            Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  return (Math.atan2(x, y) * 180 / Math.PI + 360) % 360;
}

export function formatDistance(meters) {
  if (meters < 5)    return "< 5 m";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

export function accuracyColor(accuracy) {
  if (accuracy <= 10) return "var(--acc-good)";
  if (accuracy <= 30) return "var(--acc-fair)";
  return "var(--acc-poor)";
}
