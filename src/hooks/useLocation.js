import { useState, useEffect, useRef } from "react";

function isNative() {
  return typeof window !== "undefined" && window.Capacitor?.isNativePlatform?.();
}

async function clearWatch(watchId) {
  if (watchId == null) return;
  if (isNative()) {
    const { Geolocation } = await import("@capacitor/geolocation");
    Geolocation.clearWatch({ id: watchId });
  } else {
    navigator.geolocation?.clearWatch(watchId);
  }
}

export function useLocation() {
  const [position, setPosition] = useState(null);
  const [error,    setError]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const watchRef = useRef(null);

  const startWatch = async () => {
    // Always clear any existing watch before starting a new one
    await clearWatch(watchRef.current);
    watchRef.current = null;

    setLoading(true);
    setError(null);

    if (isNative()) {
      const { Geolocation } = await import("@capacitor/geolocation");
      try {
        const perm = await Geolocation.checkPermissions();
        if (perm.location === "denied") {
          setError("denied"); setLoading(false); return;
        }
        if (perm.location !== "granted") {
          await Geolocation.requestPermissions();
        }
        watchRef.current = await Geolocation.watchPosition(
          { enableHighAccuracy: true, timeout: 10000 },
          (pos, err) => {
            if (err) { setError("unavailable"); setLoading(false); return; }
            setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
            setLoading(false);
          }
        );
      } catch {
        setError("unavailable"); setLoading(false);
      }
    } else {
      if (!navigator.geolocation) { setError("unavailable"); setLoading(false); return; }
      watchRef.current = navigator.geolocation.watchPosition(
        pos => {
          setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
          setLoading(false);
        },
        () => { setError("unavailable"); setLoading(false); },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  const requestPermission = async () => {
    if (isNative()) {
      const { Geolocation } = await import("@capacitor/geolocation");
      await Geolocation.requestPermissions();
    }
    startWatch();
  };

  useEffect(() => {
    startWatch();
    return () => { clearWatch(watchRef.current); };
  }, []);

  return { position, error, loading, requestPermission };
}
