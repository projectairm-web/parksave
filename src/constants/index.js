export const STORAGE_KEY         = "parksave-spots-v1";
export const HISTORY_KEY         = "parksave-history-v1";
export const MAX_NAME_LENGTH     = 32;
export const MAX_NOTES_LENGTH    = 100;
export const ARRIVED_THRESHOLD_M = 10;
export const HISTORY_MAX         = 10;

export const SPOT_TYPES = [
  { id: "street",  label: "Street",  emoji: "🛣️" },
  { id: "garage",  label: "Garage",  emoji: "🏢" },
  { id: "lot",     label: "Lot",     emoji: "🅿️" },
  { id: "private", label: "Private", emoji: "🏠" },
];

export const TIMER_PRESETS = [
  { label: "None", minutes: 0   },
  { label: "30m",  minutes: 30  },
  { label: "1h",   minutes: 60  },
  { label: "2h",   minutes: 120 },
  { label: "4h",   minutes: 240 },
];
