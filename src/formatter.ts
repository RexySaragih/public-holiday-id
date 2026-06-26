import type { DateInput } from "../types/holiday.js";
import { parseDate, dayOfWeek } from "./utils.js";

export function formatDate(input: DateInput, locale = "id-ID"): string {
  const dateStr = parseDate(input);
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export { parseDate, toISO, today, tomorrow, yesterday } from "./utils.js";

export function formatDateShort(input: DateInput): string {
  const dateStr = parseDate(input);
  return `${dayOfWeek(dateStr)}, ${dateStr}`;
}
