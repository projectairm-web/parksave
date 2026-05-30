import { useState } from "react";
import { X, MapPin, Loader, Camera } from "lucide-react";
import { MAX_NAME_LENGTH, MAX_NOTES_LENGTH, SPOT_TYPES, TIMER_PRESETS } from "../constants/index.js";
import { accuracyColor } from "../utils/geo.js";
import { capturePhoto } from "../utils/camera.js";

export default function SaveModal({ position, loading, error, spots, onSave, onClose, onRetryPermission }) {
  const [name,      setName]      = useState("");
  const [type,      setType]      = useState(null);
  const [notes,     setNotes]     = useState("");
  const [photo,     setPhoto]     = useState(null);
  const [timerMins, setTimerMins] = useState(0);
  const [capturing, setCapturing] = useState(false);

  const duplicate = spots.some(s => s.name.toLowerCase() === name.trim().toLowerCase());
  const canSave   = name.trim().length > 0 && !loading && !!position && !duplicate;

  const handlePhoto = async () => {
    setCapturing(true);
    const dataUrl = await capturePhoto();
    setCapturing(false);
    if (dataUrl) setPhoto(dataUrl);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!canSave) return;
    // Compute expiresAt at submit time so the full duration is preserved
    const expiresAt = timerMins > 0 ? Date.now() + timerMins * 60 * 1000 : null;
    onSave({ name: name.trim(), position, type, notes: notes.trim() || null, photo, expiresAt });
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

            {/* GPS status */}
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

            {/* Name */}
            <label className="field-label">Spot name</label>
            <input
              className="field-input"
              value={name}
              onChange={e => setName(e.target.value.slice(0, MAX_NAME_LENGTH))}
              placeholder="e.g. Mall, Airport, Station"
              autoFocus
              maxLength={MAX_NAME_LENGTH}
            />
            {duplicate && <p className="field-error">You already have a spot named "{name.trim()}"</p>}
            <div className="char-count">{name.length} / {MAX_NAME_LENGTH}</div>

            {/* Type */}
            <label className="field-label">Type</label>
            <div className="type-picker">
              {SPOT_TYPES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`type-btn${type === t.id ? " active" : ""}`}
                  onClick={() => setType(v => v === t.id ? null : t.id)}
                >
                  <span className="type-emoji">{t.emoji}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Notes */}
            <label className="field-label">Notes <span className="field-optional">(optional)</span></label>
            <input
              className="field-input"
              value={notes}
              onChange={e => setNotes(e.target.value.slice(0, MAX_NOTES_LENGTH))}
              placeholder="Level 3, Row B, near elevator…"
              maxLength={MAX_NOTES_LENGTH}
            />

            {/* Photo */}
            <label className="field-label">Photo <span className="field-optional">(optional)</span></label>
            <div className="photo-row">
              {photo ? (
                <>
                  <img src={photo} className="photo-thumb-modal" alt="spot" />
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPhoto(null)}>
                    Remove
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handlePhoto}
                  disabled={capturing}
                  style={{ width: "auto", padding: "0 14px", gap: 6 }}
                >
                  <Camera size={15} />
                  {capturing ? "Opening camera…" : "Take Photo"}
                </button>
              )}
            </div>

            {/* Timer */}
            <label className="field-label">Parking timer</label>
            <div className="timer-picker">
              {TIMER_PRESETS.map(p => (
                <button
                  key={p.minutes}
                  type="button"
                  className={`timer-btn${timerMins === p.minutes ? " active" : ""}`}
                  onClick={() => setTimerMins(p.minutes)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button className="btn btn-primary" type="submit" disabled={!canSave}>
              Save Spot
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
