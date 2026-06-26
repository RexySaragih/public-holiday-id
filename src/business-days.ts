import { isBankHolidayDateInternal } from "./holidays.js";
import { addDays, compareDates, isWeekend, parseDate } from "./utils.js";

function isNonWorkingDay(dateStr: string): boolean {
  return isWeekend(dateStr) || isBankHolidayDateInternal(dateStr);
}

export function isWorkingDay(date: string | Date): boolean {
  const dateStr = parseDate(date);
  return !isNonWorkingDay(dateStr);
}

export function nextWorkingDay(date: string | Date): string {
  let current = addDays(parseDate(date), 1);
  while (isNonWorkingDay(current)) {
    current = addDays(current, 1);
  }
  return current;
}

export function previousWorkingDay(date: string | Date): string {
  let current = addDays(parseDate(date), -1);
  while (isNonWorkingDay(current)) {
    current = addDays(current, -1);
  }
  return current;
}

export function addBusinessDays(date: string | Date, amount: number): string {
  if (!Number.isInteger(amount)) {
    throw new Error(`Amount must be an integer, got ${amount}`);
  }
  if (amount === 0) return parseDate(date);

  const direction = amount > 0 ? 1 : -1;
  let remaining = Math.abs(amount);
  let current = parseDate(date);

  while (remaining > 0) {
    current = addDays(current, direction);
    if (!isNonWorkingDay(current)) {
      remaining -= 1;
    }
  }

  return current;
}

export function subtractBusinessDays(date: string | Date, amount: number): string {
  return addBusinessDays(date, -amount);
}

export function businessDaysBetween(
  start: string | Date,
  end: string | Date,
): number {
  const startStr = parseDate(start);
  const endStr = parseDate(end);

  if (compareDates(startStr, endStr) > 0) {
    throw new Error(`Start date ${startStr} must be before or equal to end date ${endStr}`);
  }

  let count = 0;
  let current = startStr;

  while (compareDates(current, endStr) <= 0) {
    if (!isNonWorkingDay(current)) {
      count += 1;
    }
    current = addDays(current, 1);
  }

  return count;
}
