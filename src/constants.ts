export const JAKARTA_TZ = "Asia/Jakarta";
export const DEFAULT_UPCOMING_LIMIT = 10;
export const WEEKEND_DAYS = [0, 6] as const;

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;
