import { useState, useEffect, useRef } from "react";

export function useCompass() {
  const [heading,   setHeading]   = useState(null);
  const [supported, setSupported] = useState(true);
  const prevRef  = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (typeof DeviceOrientationEvent === "undefined") {
      setSupported(false);
      return;
    }

    const handler = (e) => {
      clearTimeout(timerRef.current);
      let raw = null;
      if (typeof e.webkitCompassHeading === "number") {
        raw = e.webkitCompassHeading;
      } else if (typeof e.alpha === "number") {
        raw = (360 - e.alpha) % 360;
      }
      if (raw === null) return;
      // Re-enable if the 5s timeout had already fired (e.g. slow device wake)
      setSupported(true);
      const prev     = prevRef.current ?? raw;
      const smoothed = 0.85 * prev + 0.15 * raw;
      prevRef.current = smoothed;
      setHeading(smoothed);
    };

    const init = async () => {
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        try {
          const res = await DeviceOrientationEvent.requestPermission();
          if (res !== "granted") { setSupported(false); return; }
        } catch { setSupported(false); return; }
      }
      window.addEventListener("deviceorientation", handler, true);
      timerRef.current = setTimeout(() => setSupported(false), 5000);
    };

    init();
    return () => {
      window.removeEventListener("deviceorientation", handler, true);
      clearTimeout(timerRef.current);
    };
  }, []);

  return { heading, supported };
}
