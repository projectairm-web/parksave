import { useState, useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

function makeSpotIcon(L) {
  return L.divIcon({
    html: `<div class="map-pin-spot"><span>P</span></div>`,
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
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

export default function HomeMapView({ spots, currentPosition }) {
  const containerRef  = useRef(null);
  const mapRef        = useRef(null);
  const markersRef    = useRef({});
  const currentMkrRef = useRef(null);
  const fittedRef     = useRef(false);
  const [mapReady, setMapReady] = useState(false); // triggers dependent effects after async init

  /* ── Init map once ──────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    import("leaflet").then(({ default: L }) => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(map);

      map.setView([45.0, 9.0], 5);
      mapRef.current = map;
      setMapReady(true); // signals spots + position effects to run
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current        = null;
      markersRef.current    = {};
      currentMkrRef.current = null;
      fittedRef.current     = false;
      setMapReady(false);
    };
  }, []);

  /* ── Sync spot markers (runs after mapReady flips to true) ── */
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    import("leaflet").then(({ default: L }) => {
      if (!mapRef.current) return;
      const map = mapRef.current;

      // Remove markers for deleted spots
      Object.keys(markersRef.current).forEach(id => {
        if (!spots.find(s => s.id === id)) {
          markersRef.current[id].remove();
          delete markersRef.current[id];
        }
      });

      // Add markers for new spots
      spots.forEach(spot => {
        if (markersRef.current[spot.id]) return;
        const marker = L.marker([spot.lat, spot.lng], { icon: makeSpotIcon(L) })
          .addTo(map)
          .bindPopup(`<b style="font-size:13px">${spot.name}</b>`, { closeButton: false });
        marker.on("click", () => marker.openPopup());
        markersRef.current[spot.id] = marker;
      });

      // Fit bounds to show all spots — only once
      if (spots.length > 0 && !fittedRef.current) {
        const bounds = L.latLngBounds(spots.map(s => [s.lat, s.lng]));
        map.fitBounds(bounds, { padding: [48, 48], maxZoom: 17 });
        fittedRef.current = true;
      }
    });
  }, [spots, mapReady]); // mapReady in deps ensures this runs after map is created

  /* ── Sync current position (runs after mapReady flips) ───── */
  useEffect(() => {
    if (!mapReady || !mapRef.current || !currentPosition) return;

    import("leaflet").then(({ default: L }) => {
      if (!mapRef.current) return;
      const latlng = [currentPosition.lat, currentPosition.lng];

      if (!currentMkrRef.current) {
        currentMkrRef.current = L.marker(latlng, { icon: makeCurrentIcon(L), zIndexOffset: -1 })
          .addTo(mapRef.current);
      } else {
        currentMkrRef.current.setLatLng(latlng);
      }

      // If no spots, center on user position
      if (spots.length === 0) {
        mapRef.current.setView(latlng, 16);
      }
    });
  }, [currentPosition, mapReady, spots.length]);

  return <div ref={containerRef} className="home-map-container" />;
}
