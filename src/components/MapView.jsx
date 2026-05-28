import { useState, useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

function makeSpotIcon(L) {
  return L.divIcon({
    html: `<div class="map-pin-spot"><span>P</span></div>`,
    className: "",
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}

function makeCurrentIcon(L) {
  return L.divIcon({
    html: `<div class="map-pin-current"><div class="map-pin-pulse"></div></div>`,
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

export default function MapView({ currentPosition, spot }) {
  const containerRef  = useRef(null);
  const mapRef        = useRef(null);
  const currentMkrRef = useRef(null);
  const spotMkrRef    = useRef(null);
  const polylineRef   = useRef(null);
  const fittedRef     = useRef(false);
  const [mapReady, setMapReady] = useState(false);

  /* ── Init map + spot marker once ───────────────────────── */
  useEffect(() => {
    let cancelled = false;
    import("leaflet").then(({ default: L }) => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(map);

      // Spot marker is static — place it immediately
      spotMkrRef.current = L.marker([spot.lat, spot.lng], { icon: makeSpotIcon(L) }).addTo(map);
      map.setView([spot.lat, spot.lng], 16);

      mapRef.current = map;
      setMapReady(true);
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current        = null;
      currentMkrRef.current = null;
      spotMkrRef.current    = null;
      polylineRef.current   = null;
      fittedRef.current     = false;
      setMapReady(false);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Update current position + polyline ─────────────────── */
  useEffect(() => {
    if (!mapReady || !mapRef.current || !currentPosition) return;

    import("leaflet").then(({ default: L }) => {
      if (!mapRef.current) return;
      const map    = mapRef.current;
      const latlng = [currentPosition.lat, currentPosition.lng];
      const spotLL = [spot.lat, spot.lng];

      // Current position marker
      if (!currentMkrRef.current) {
        currentMkrRef.current = L.marker(latlng, { icon: makeCurrentIcon(L) }).addTo(map);
      } else {
        currentMkrRef.current.setLatLng(latlng);
      }

      // Dashed line between current and spot
      if (!polylineRef.current) {
        polylineRef.current = L.polyline([latlng, spotLL], {
          color: "#2ECC71", weight: 3, dashArray: "8 10", opacity: 0.85,
        }).addTo(map);
      } else {
        polylineRef.current.setLatLngs([latlng, spotLL]);
      }

      // Fit to show both markers on first GPS fix
      if (!fittedRef.current) {
        map.fitBounds([latlng, spotLL], { padding: [60, 60], maxZoom: 17 });
        fittedRef.current = true;
      }
    });
  }, [currentPosition, mapReady]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={containerRef} className="map-container" />;
}
