import { useState } from "react";
import { X, MapPin, Loader } from "lucide-react";
import { MAX_NAME_LENGTH } from "../constants/index.js";
import { accuracyColor } from "../utils/geo.js";

export default function SaveModal({ position, loading, error, spots, onSave, onClose, onRetryPermission }) {
  const [name, setName] = useState("");

  const duplicate = spots.some(s => s.name.toLowerCase() === name.trim().toLowerCase());
  // Block only when we have no position — "unavailable" error still allows save once GPS arrives
  const canSave   = name.trim().length > 0 && !loading && !!position && !duplicate;

  const submit = (e) => {
    e.preventDefault();
    if (canSave) onSave(name.trim(), position);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Save Parking Spot</span>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {error === "denied" ? (
          <div className="modal-body">
            <p style={{ color: "var(--text-muted)", lineHeight: 1.5 }}>
              Location permission denied. Please allow location access to save spots.
            </p>
            <button className="btn btn-primary" onClick={onRetryPermission}>Retry Permission</button>
          </div>
        ) : (
          <form className="modal-body" onSubmit={submit}>
            {loading ? (
              <div className="gps-loading">
                <Loader size={20} className="spin" color="var(--accent)" />
                <span>Getting GPS fix…</span>
              </div>
            ) : position ? (
              <div className="gps-ok">
                <MapPin size={14} color={accuracyColor(position.accuracy)} />
                <span style={{ color: accuracyColor(position.accuracy), fontSize: 13 }}>
                  ±{Math.round(position.accuracy)} m accuracy
                </span>
              </div>
            ) : null}

            <label className="field-label">Spot name</label>
            <input
              className="field-input"
              value={name}
              onChange={e => setName(e.target.value.slice(0, MAX_NAME_LENGTH))}
              placeholder="e.g. Mall, Airport, Station"
              autoFocus
              maxLength={MAX_NAME_LENGTH}
            />
            {duplicate && (
              <p className="field-error">You already have a spot named "{name.trim()}"</p>
            )}
            <div className="char-count">{name.length} / {MAX_NAME_LENGTH}</div>

            <button className="btn btn-primary" type="submit" disabled={!canSave}>
              Save Spot
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
