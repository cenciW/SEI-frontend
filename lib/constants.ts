// Validation ranges for input fields
export const VALIDATION_RANGES = {
  MOISTURE: { MIN: 0, MAX: 100 },
  RAIN: { MIN: 0 },
  TEMPERATURE: { MIN: -50, MAX: 60 },
  HUMIDITY: { MIN: 0, MAX: 100 },
  POT_SIZE: { MIN: 0 },
} as const;

// Notification display timeouts in milliseconds
export const NOTIFICATION_TIMEOUTS = {
  ERROR: 8000,
  SUCCESS: 5000,
  VALIDATION_ERROR: 5000,
} as const;

// API base URL
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
