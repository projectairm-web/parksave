import { useState } from "react";
import HomeScreen from "./components/HomeScreen.jsx";
import NavigateScreen from "./components/NavigateScreen.jsx";
import { useLocation } from "./hooks/useLocation.js";

export default function App() {
  const [screen,     setScreen]     = useState("home");
  const [targetSpot, setTargetSpot] = useState(null);

  // Single GPS watch for the whole app — no gap when switching screens
  const locationState = useLocation();

  const handleNavigate = (spot) => {
    setTargetSpot(spot);
    setScreen("navigate");
  };

  const handleBack = () => {
    setScreen("home");
    setTargetSpot(null);
  };

  return screen === "navigate" && targetSpot
    ? <NavigateScreen spot={targetSpot} onBack={handleBack} locationState={locationState} />
    : <HomeScreen onNavigate={handleNavigate} locationState={locationState} />;
}
