import { useState, useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { haversine } from "../utils/geo.js";

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

const REROUTE_THRESHOLD_M = 30;

async function fetchWalkingRoute(fromLat, fromLng, toLat, toLng) {
  const url =
    `https://routing.openstreetmap.de/routed-foot/route/v1/foot/` +
    `${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.length) return null;
    return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  } finally {
    clearTimeout(timer);
  }
}

export default function MapView({ currentPosition, spot }) {
  const containerRef    = useRef(null);
  const mapRef          = useRef(null);
  const currentMkrRef   = useRef(null);
  const spotMkrRef      = useRef(null);
  const routeLayerRef   = useRef(null);
  const fallbackLineRef = useRef(null);
  const fittedRef       = useRef(false);
  const lastFetchPosRef = useRef(null);
  const fetchingRef     = useRef(false);
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
      L.control.zoom({ position: "bottomleft" }).addTo(map);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(map);

      map.attributionControl.setPrefix("");
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
      routeLayerRef.current = null;
      fallbackLineRef.current = null;
      fittedRef.current     = false;
      lastFetchPosRef.current = null;
      fetchingRef.current   = false;
      setMapReady(false);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Update current position + walking route ─────────────── */
  useEffect(() => {
    if (!mapReady || !mapRef.current || !currentPosition) return;

    import("leaflet").then(async ({ default: L }) => {
      if (!mapRef.current) return;
      const map    = mapRef.current;
      const latlng = [currentPosition.lat, currentPosition.lng];
      const spotLL = [spot.lat, spot.lng];

      // Move or create current-position marker
      if (!currentMkrRef.current) {
        currentMkrRef.current = L.marker(latlng, { icon: makeCurrentIcon(L) }).addTo(map);
      } else {
        currentMkrRef.current.setLatLng(latlng);
      }

      // Fit both markers into view on the first GPS fix
      if (!fittedRef.current) {
        map.fitBounds([latlng, spotLL], { padding: [60, 60], maxZoom: 17 });
        fittedRef.current = true;
      }

      // Slide the fallback line endpoint as the user walks (smooth while route loads)
      if (fallbackLineRef.current) {
        fallbackLineRef.current.setLatLngs([latlng, spotLL]);
      }

      // Check if we need to (re-)fetch the walking route
      const last = lastFetchPosRef.current;
      const moved = last
        ? haversine(currentPosition.lat, currentPosition.lng, last.lat, last.lng) > REROUTE_THRESHOLD_M
        : true;

      if (!moved || fetchingRef.current) return;

      fetchingRef.current     = true;
      lastFetchPosRef.current = { lat: currentPosition.lat, lng: currentPosition.lng };

      // Show a dashed straight line as a placeholder while the route is loading
      if (!routeLayerRef.current && !fallbackLineRef.current) {
        fallbackLineRef.current = L.polyline([latlng, spotLL], {
          color: "#2ECC71", weight: 3, dashArray: "8 10", opacity: 0.55,
        }).addTo(map);
      }

      try {
        const coords = await fetchWalkingRoute(
          currentPosition.lat, currentPosition.lng,
          spot.lat, spot.lng,
        );

        if (!mapRef.current) return; // unmounted while fetching

        if (coords) {
          // Replace fallback with the real route
          if (fallbackLineRef.current) {
            fallbackLineRef.current.remove();
            fallbackLineRef.current = null;
          }
          if (!routeLayerRef.current) {
            routeLayerRef.current = L.polyline(coords, {
              color: "#2ECC71", weight: 4, opacity: 0.9,
            }).addTo(map);
          } else {
            routeLayerRef.current.setLatLngs(coords);
          }
        }
      } catch {
        // Network/timeout error — reset so the next position update retries
        lastFetchPosRef.current = null;
      } finally {
        fetchingRef.current = false;
      }
    });
  }, [currentPosition, mapReady]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={containerRef} className="map-container" />;
}
