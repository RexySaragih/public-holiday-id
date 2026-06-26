import data2022 from "../data/2022.json" with { type: "json" };
import data2023 from "../data/2023.json" with { type: "json" };
import data2024 from "../data/2024.json" with { type: "json" };
import data2025 from "../data/2025.json" with { type: "json" };
import data2026 from "../data/2026.json" with { type: "json" };
import type {
  CheckDateResult,
  Holiday,
  HolidayType,
  UpcomingHoliday,
  VersionInfo,
  YearData,
  YearSummary,
} from "../types/holiday.js";
import { DEFAULT_UPCOMING_LIMIT } from "./constants.js";
import {
  compareDates,
  dayOfWeek,
  daysBetween,
  getMonthFromDate,
  getYearFromDate,
  isWeekend,
  parseDate,
  today,
} from "./utils.js";

const YEAR_DATA: YearData[] = [
  data2022 as YearData,
  data2023 as YearData,
  data2024 as YearData,
  data2025 as YearData,
  data2026 as YearData,
];

const holidaysByYear = new Map<number, Holiday[]>(
  YEAR_DATA.map((d) => [d.year, d.holidays]),
);

const yearVersions = new Map<number, string>(
  YEAR_DATA.map((d) => [d.year, d.version]),
);

const allHolidays: Holiday[] = YEAR_DATA.flatMap((d) => d.holidays);

const bankHolidayDates = new Set<string>(
  allHolidays
    .filter((h) => h.type === "public" || h.type === "joint")
    .map((h) => h.date),
);

const holidaysByDate = new Map<string, Holiday[]>();
for (const holiday of allHolidays) {
  const existing = holidaysByDate.get(holiday.date) ?? [];
  existing.push(holiday);
  holidaysByDate.set(holiday.date, existing);
}

const PACKAGE_VERSION = "1.0.0";

function isBankHolidayDate(dateStr: string): boolean {
  return bankHolidayDates.has(dateStr);
}

function getHolidaysForDate(dateStr: string): Holiday[] {
  return holidaysByDate.get(dateStr) ?? [];
}

function getBankHolidaysForDate(dateStr: string): Holiday[] {
  return getHolidaysForDate(dateStr).filter(
    (h) => h.type === "public" || h.type === "joint",
  );
}

export function supportedYears(): number[] {
  return YEAR_DATA.map((d) => d.year).sort((a, b) => a - b);
}

export function exists(year: number): boolean {
  return holidaysByYear.has(year);
}

export function getHolidays(year?: number): Holiday[] {
  if (year === undefined) {
    return [...allHolidays];
  }
  const holidays = holidaysByYear.get(year);
  if (!holidays) {
    throw new Error(`No holiday data available for year ${year}`);
  }
  return [...holidays];
}

export function getHoliday(date: string | Date): Holiday | null {
  const dateStr = parseDate(date);
  const bankHolidays = getBankHolidaysForDate(dateStr);
  return bankHolidays[0] ?? null;
}

export function isHoliday(date: string | Date): boolean {
  const dateStr = parseDate(date);
  return isBankHolidayDate(dateStr);
}

export function isBankHoliday(date: string | Date): boolean {
  return isHoliday(date);
}

export function checkDate(date: string | Date): CheckDateResult {
  const dateStr = parseDate(date);
  const bankHolidays = getBankHolidaysForDate(dateStr);
  return {
    date: dateStr,
    dayOfWeek: dayOfWeek(dateStr),
    isHoliday: bankHolidays.length > 0,
    isWeekend: isWeekend(dateStr),
    holidays: getHolidaysForDate(dateStr),
  };
}

export function getUpcoming(limit = DEFAULT_UPCOMING_LIMIT): UpcomingHoliday[] {
  const todayStr = today();
  const seen = new Set<string>();
  const upcoming: UpcomingHoliday[] = [];

  for (const holiday of allHolidays) {
    if (holiday.type === "observance") continue;
    if (compareDates(holiday.date, todayStr) < 0) continue;
    const key = `${holiday.date}:${holiday.name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    upcoming.push({
      ...holiday,
      daysUntil: daysBetween(todayStr, holiday.date),
    });
  }

  return upcoming
    .sort((a, b) => compareDates(a.date, b.date))
    .slice(0, limit);
}

export function nextHoliday(): Holiday | null {
  const todayStr = today();
  let nearest: Holiday | null = null;

  for (const holiday of allHolidays) {
    if (holiday.type === "observance") continue;
    if (compareDates(holiday.date, todayStr) < 0) continue;
    if (!nearest || compareDates(holiday.date, nearest.date) < 0) {
      nearest = holiday;
    }
  }

  return nearest;
}

export function previousHoliday(): Holiday | null {
  const todayStr = today();
  let nearest: Holiday | null = null;

  for (const holiday of allHolidays) {
    if (holiday.type === "observance") continue;
    if (compareDates(holiday.date, todayStr) > 0) continue;
    if (!nearest || compareDates(holiday.date, nearest.date) > 0) {
      nearest = holiday;
    }
  }

  return nearest;
}

export function getYear(year: number): YearSummary {
  const holidays = getHolidays(year);
  return {
    year,
    holidays,
    totalPublic: holidays.filter((h) => h.type === "public").length,
    totalJoint: holidays.filter((h) => h.type === "joint").length,
    totalObservance: holidays.filter((h) => h.type === "observance").length,
  };
}

export function getMonth(year: number, month: number): Holiday[] {
  if (month < 1 || month > 12) {
    throw new Error(`Invalid month: ${month}. Expected 1-12.`);
  }
  const monthStr = String(month).padStart(2, "0");
  return getHolidays(year).filter((h) => h.date.slice(5, 7) === monthStr);
}

export function getByType(type: HolidayType): Holiday[] {
  return allHolidays.filter((h) => h.type === type);
}

export function search(query: string): Holiday[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return [];

  return allHolidays.filter((h) =>
    h.name.toLowerCase().includes(normalized),
  );
}

export function getNames(): string[] {
  const names = new Set<string>();
  for (const holiday of allHolidays) {
    names.add(holiday.name);
  }
  return [...names].sort();
}

export function holidaysBetween(start: string | Date, end: string | Date): Holiday[] {
  const startStr = parseDate(start);
  const endStr = parseDate(end);
  if (compareDates(startStr, endStr) > 0) {
    throw new Error(`Start date ${startStr} must be before or equal to end date ${endStr}`);
  }

  return allHolidays.filter(
    (h) =>
      (h.type === "public" || h.type === "joint") &&
      compareDates(h.date, startStr) >= 0 &&
      compareDates(h.date, endStr) <= 0,
  );
}

export function version(): VersionInfo {
  const years = supportedYears();
  const latestYear = years[years.length - 1];
  const holidayDataVersion = yearVersions.get(latestYear) ?? "unknown";

  return {
    packageVersion: PACKAGE_VERSION,
    holidayDataVersion,
  };
}

export function isBankHolidayDateInternal(dateStr: string): boolean {
  return isBankHolidayDate(dateStr);
}

export { getYearFromDate, getMonthFromDate };
