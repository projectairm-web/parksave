import { useState } from "react";
import HomeScreen from "./components/HomeScreen.jsx";
import NavigateScreen from "./components/NavigateScreen.jsx";

export default function App() {
  const [screen,     setScreen]     = useState("home");
  const [targetSpot, setTargetSpot] = useState(null);

  const handleNavigate = (spot) => {
    setTargetSpot(spot);
    setScreen("navigate");
  };

  const handleBack = () => {
    setScreen("home");
    setTargetSpot(null);
  };

  return screen === "navigate" && targetSpot
    ? <NavigateScreen spot={targetSpot} onBack={handleBack} />
    : <HomeScreen onNavigate={handleNavigate} />;
}
