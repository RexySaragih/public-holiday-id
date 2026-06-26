import type { DateInput } from "../types/holiday.js";
import {
  DAY_NAMES,
  DAYS_IN_MONTH,
  ISO_DATE_REGEX,
  JAKARTA_TZ,
} from "./constants.js";

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  if (month === 2 && isLeapYear(year)) return 29;
  return DAYS_IN_MONTH[month - 1];
}

export function parseDate(input: DateInput): string {
  if (typeof input === "string") {
    if (!ISO_DATE_REGEX.test(input)) {
      throw new Error(`Invalid date format: ${input}. Expected YYYY-MM-DD.`);
    }
    const [y, m, d] = input.split("-").map(Number);
    validateDateParts(y, m, d);
    return input;
  }

  return formatDateInJakarta(input);
}

export function toISO(input: DateInput): string {
  return parseDate(input);
}

export function formatDateInJakarta(date: Date): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: JAKARTA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

export function today(): string {
  return formatDateInJakarta(new Date());
}

export function tomorrow(): string {
  return addDays(today(), 1);
}

export function yesterday(): string {
  return addDays(today(), -1);
}

export function addDays(dateStr: string, amount: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  let y = year;
  let m = month;
  let d = day + amount;

  while (d > daysInMonth(y, m)) {
    d -= daysInMonth(y, m);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }

  while (d < 1) {
    m -= 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    d += daysInMonth(y, m);
  }

  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function getDayOfWeek(dateStr: string): number {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function dayOfWeek(dateStr: string): string {
  return DAY_NAMES[getDayOfWeek(dateStr)];
}

export function isWeekend(dateStr: string): boolean {
  const dow = getDayOfWeek(dateStr);
  return dow === 0 || dow === 6;
}

export function getYearFromDate(dateStr: string): number {
  return Number(dateStr.slice(0, 4));
}

export function getMonthFromDate(dateStr: string): number {
  return Number(dateStr.slice(5, 7));
}

export function compareDates(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const fromMs = Date.UTC(fy, fm - 1, fd);
  const toMs = Date.UTC(ty, tm - 1, td);
  return Math.round((toMs - fromMs) / MS_PER_DAY);
}

function validateDateParts(year: number, month: number, day: number): void {
  if (month < 1 || month > 12) {
    throw new Error(`Invalid month: ${month}`);
  }
  const maxDay = daysInMonth(year, month);
  if (day < 1 || day > maxDay) {
    throw new Error(`Invalid day: ${day} for ${year}-${month}`);
  }
}
