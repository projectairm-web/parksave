import { MapPin } from "lucide-react";

export default function PermissionPrompt({ onRetry }) {
  return (
    <div className="permission-prompt">
      <MapPin size={40} color="var(--text-muted)" />
      <p className="permission-title">Location access needed</p>
      <p className="permission-desc">
        ParkSave needs your GPS location to save and navigate to parking spots.
      </p>
      <button className="btn btn-primary" onClick={onRetry}>Allow Location</button>
    </div>
  );
}
