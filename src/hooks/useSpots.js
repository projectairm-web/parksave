import { useState, useEffect } from "react";
import { STORAGE_KEY } from "../constants/index.js";
import { uid } from "../utils/geo.js";

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function useSpots() {
  const [spots, setSpots] = useState(load);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(spots)); } catch {}
  }, [spots]);

  const addSpot = (name, position) => {
    setSpots(s => [{
      id:       uid(),
      name:     name.trim(),
      lat:      position.lat,
      lng:      position.lng,
      accuracy: position.accuracy,
      savedAt:  Date.now(),
    }, ...s]);
  };

  const deleteSpot = (id) => setSpots(s => s.filter(sp => sp.id !== id));

  return { spots, addSpot, deleteSpot };
}
