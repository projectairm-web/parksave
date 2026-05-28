import { useState, useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

function makeSpotIcon(L) {
  return L.divIcon({
    html: `<div class="map-pin-spot"><span>P</span></div>`,
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -22],
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

export default function HomeMapView({ spots, currentPosition, onNavigate }) {
  const containerRef  = useRef(null);
  const mapRef        = useRef(null);
  const markersRef    = useRef({});
  const currentMkrRef = useRef(null);
  const fittedRef     = useRef(false);
  const [mapReady, setMapReady] = useState(false);

  // Keep a ref to latest onNavigate so popup buttons always call the current version
  const onNavigateRef = useRef(onNavigate);
  useEffect(() => { onNavigateRef.current = onNavigate; }, [onNavigate]);

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

      map.attributionControl.setPrefix("");
      map.setView([45.0, 9.0], 5);
      mapRef.current = map;
      setMapReady(true);
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

  /* ── Sync spot markers ──────────────────────────────────── */
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

        // Popup with spot name + Navigate button
        const popupContent = document.createElement("div");
        popupContent.innerHTML = `
          <div style="text-align:center;padding:4px 2px">
            <b style="font-size:14px;display:block;margin-bottom:8px">${spot.name}</b>
            <button
              id="nav-${spot.id}"
              style="background:#2ECC71;color:#000;border:none;padding:7px 18px;
                     border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;">
              Navigate
            </button>
          </div>`;
        popupContent.querySelector(`#nav-${spot.id}`)
          .addEventListener("click", () => onNavigateRef.current?.(spot));

        const marker = L.marker([spot.lat, spot.lng], { icon: makeSpotIcon(L) })
          .addTo(map)
          .bindPopup(popupContent, { closeButton: false, minWidth: 140 });

        marker.on("click", () => marker.openPopup());
        markersRef.current[spot.id] = marker;
      });

      // Fit to show all spots — only once
      if (spots.length > 0 && !fittedRef.current) {
        const bounds = L.latLngBounds(spots.map(s => [s.lat, s.lng]));
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 17 });
        fittedRef.current = true;
      }
    });
  }, [spots, mapReady]);

  /* ── Sync current position ──────────────────────────────── */
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

      // If no spots yet, center on user
      if (spots.length === 0 && !fittedRef.current) {
        mapRef.current.setView(latlng, 16);
        fittedRef.current = true;
      }
    });
  }, [currentPosition, mapReady, spots.length]);

  return <div ref={containerRef} className="map-fill" />;
}
