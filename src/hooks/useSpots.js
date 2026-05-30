import { useState, useEffect } from "react";
import { STORAGE_KEY, HISTORY_KEY, HISTORY_MAX } from "../constants/index.js";
import { uid } from "../utils/geo.js";
import { scheduleExpiryNotification, cancelExpiryNotification } from "../utils/notifications.js";

function load(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function useSpots() {
  const [spots,   setSpots]   = useState(() => load(STORAGE_KEY));
  const [history, setHistory] = useState(() => load(HISTORY_KEY));

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(spots)); } catch {}
  }, [spots]);

  useEffect(() => {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch {}
  }, [history]);

  const addSpot = ({ name, position, type = null, notes = null, photo = null, expiresAt = null }) => {
    const notifId = expiresAt ? ((Date.now() % 2_000_000_000) + 1) : null;
    const spot = {
      id:       uid(),
      name:     name.trim(),
      lat:      position.lat,
      lng:      position.lng,
      accuracy: position.accuracy,
      savedAt:  Date.now(),
      type,
      notes:    notes?.trim() || null,
      photo,
      expiresAt,
      notifId,
    };
    if (expiresAt) scheduleExpiryNotification(spot);
    setSpots(s => [spot, ...s]);
  };

  const deleteSpot = (id) => {
    const spot = spots.find(sp => sp.id === id);
    if (!spot) return;
    if (spot.notifId) cancelExpiryNotification(spot.notifId);
    setHistory(h => [{ ...spot, deletedAt: Date.now() }, ...h].slice(0, HISTORY_MAX));
    setSpots(s => s.filter(sp => sp.id !== id));
  };

  const restoreSpot = (id) => {
    const spot = history.find(s => s.id === id);
    if (!spot) return;
    setHistory(h => h.filter(s => s.id !== id));
    // Restore without timer — it's likely expired
    setSpots(s => [{ ...spot, expiresAt: null, notifId: null, deletedAt: undefined }, ...s]);
  };

  const clearHistory = () => setHistory([]);

  return { spots, addSpot, deleteSpot, history, restoreSpot, clearHistory };
}
