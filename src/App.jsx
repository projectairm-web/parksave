import { useState } from "react";
import MapTab        from "./components/MapTab.jsx";
import SpotsTab      from "./components/SpotsTab.jsx";
import NavigateScreen from "./components/NavigateScreen.jsx";
import BottomTabs    from "./components/BottomTabs.jsx";
import SaveModal     from "./components/SaveModal.jsx";
import { useLocation } from "./hooks/useLocation.js";
import { useSpots }    from "./hooks/useSpots.js";

export default function App() {
  const [tab,         setTab]         = useState("map");       // "map" | "spots"
  const [navigateTo,  setNavigateTo]  = useState(null);        // spot | null
  const [showSave,    setShowSave]    = useState(false);

  const locationState              = useLocation();
  const { spots, addSpot, deleteSpot } = useSpots();

  const handleSave = (name, pos) => {
    addSpot(name, pos);
    setShowSave(false);
  };

  // Full-screen navigate overlay
  if (navigateTo) {
    return (
      <NavigateScreen
        spot={navigateTo}
        onBack={() => setNavigateTo(null)}
        locationState={locationState}
      />
    );
  }

  return (
    <div className="screen">
      {/* Tab content */}
      {tab === "map" ? (
        <MapTab
          spots={spots}
          locationState={locationState}
          onNavigate={setNavigateTo}
          onSave={() => setShowSave(true)}
        />
      ) : (
        <SpotsTab
          spots={spots}
          locationState={locationState}
          onNavigate={setNavigateTo}
          onDelete={deleteSpot}
        />
      )}

      {/* Bottom tab bar */}
      <BottomTabs active={tab} onChange={setTab} spotCount={spots.length} />

      {/* Save modal */}
      {showSave && (
        <SaveModal
          position={locationState.position}
          loading={locationState.loading}
          error={locationState.error}
          spots={spots}
          onSave={handleSave}
          onClose={() => setShowSave(false)}
          onRetryPermission={locationState.requestPermission}
        />
      )}
    </div>
  );
}
