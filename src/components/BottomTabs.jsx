import { Map, List } from "lucide-react";

export default function BottomTabs({ active, onChange, spotCount }) {
  const tabs = [
    { id: "map",   icon: <Map   size={22} />, label: "Map"   },
    { id: "spots", icon: <List  size={22} />, label: `Spots${spotCount > 0 ? ` (${spotCount})` : ""}` },
  ];

  return (
    <nav className="bottom-tabs">
      {tabs.map(t => (
        <button
          key={t.id}
          className={`bottom-tab${active === t.id ? " active" : ""}`}
          onClick={() => onChange(t.id)}
        >
          {t.icon}
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
