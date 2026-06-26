# id-bank-holidays

A lightweight, dependency-free TypeScript library for working with Indonesian public holidays and bank holidays, based on the official [Bank Indonesia Holiday Calendar](https://www.bi.go.id/id/publikasi/kalender/default.aspx).

## Features

- Zero runtime dependencies
- No API key or internet connection required
- Fast in-memory lookups
- Tree-shakable ESM + CJS builds
- TypeScript-first with full type definitions
- Browser and Node.js compatible
- Data sourced from official BI holiday calendars (2022–2026)

## Installation

```bash
npm install id-bank-holidays
```

## Quick Start

```typescript
import {
  isHoliday,
  isWorkingDay,
  getHoliday,
  checkDate,
  addBusinessDays,
  getUpcoming,
} from "id-bank-holidays";

isHoliday("2026-01-01");        // true
isWorkingDay("2026-01-17");     // true (facultative holiday — BI open)
getHoliday("2026-03-21");       // { date: "2026-03-21", name: "Hari Raya Idul Fitri...", ... }
checkDate("2026-12-25");        // { date, dayOfWeek, isHoliday, isWeekend, holidays }
addBusinessDays("2026-12-23", 5); // "2026-12-31"
getUpcoming(5);                 // [{ date, name, type, daysUntil, ... }]
```

## CLI

```bash
npx id-bank-holidays today
npx id-bank-holidays upcoming
npx id-bank-holidays upcoming 5
npx id-bank-holidays year 2026
```

## API Reference

### Holiday Lookups

| Function | Description |
|----------|-------------|
| `getHolidays(year?)` | All holidays, optionally filtered by year |
| `getHoliday(date)` | Single bank holiday for a date, or `null` |
| `isHoliday(date)` | `true` if date is a public or joint holiday |
| `isBankHoliday(date)` | Alias of `isHoliday` |
| `checkDate(date)` | Full date info including all holiday entries |
| `getUpcoming(limit?)` | Nearest upcoming bank holidays with `daysUntil` |
| `nextHoliday()` | Next bank holiday from today |
| `previousHoliday()` | Most recent bank holiday before today |

### Business Days

| Function | Description |
|----------|-------------|
| `isWorkingDay(date)` | `true` if not weekend and not bank holiday |
| `nextWorkingDay(date)` | Next working day after date |
| `previousWorkingDay(date)` | Previous working day before date |
| `addBusinessDays(date, n)` | Add n business days (skips weekends + holidays) |
| `subtractBusinessDays(date, n)` | Subtract n business days |
| `businessDaysBetween(start, end)` | Count working days in range (inclusive) |

### Queries

| Function | Description |
|----------|-------------|
| `getYear(year)` | Year summary with counts by type |
| `getMonth(year, month)` | Holidays in a specific month |
| `getByType(type)` | Filter by `"public"`, `"joint"`, or `"observance"` |
| `search(query)` | Fuzzy name search |
| `getNames()` | All unique holiday names |
| `holidaysBetween(start, end)` | Bank holidays in date range |
| `exists(year)` | Whether data exists for a year |
| `supportedYears()` | `[2022, 2023, 2024, 2025, 2026]` |
| `version()` | Package and data version info |

### Date Utilities

| Function | Description |
|----------|-------------|
| `today()` | Today in Asia/Jakarta as `YYYY-MM-DD` |
| `tomorrow()` / `yesterday()` | Relative dates in Jakarta timezone |
| `parseDate(input)` | Normalize string or Date to `YYYY-MM-DD` |
| `toISO(input)` | Alias of `parseDate` |
| `formatDate(input)` | Human-readable formatted date |

## Holiday Types

| Type | BI Status | Affects `isHoliday` | Affects `isWorkingDay` |
|------|-----------|----------------------|------------------------|
| `public` | BI Tutup | Yes | Yes |
| `joint` | Cuti Bersama (BI Tutup) | Yes | Yes |
| `observance` | Hari Libur Fakultatif (BI buka) | No | No |

## Use Cases

### Payroll calculations

```typescript
import { businessDaysBetween } from "id-bank-holidays";

const workDays = businessDaysBetween("2026-06-01", "2026-06-30");
const dailyRate = monthlySalary / workDays;
```

### Banking cut-off dates

```typescript
import { previousWorkingDay } from "id-bank-holidays";

const cutOff = previousWorkingDay("2026-03-20"); // before Idul Fitri joint leave
```

### Invoice due dates

```typescript
import { addBusinessDays } from "id-bank-holidays";

const dueDate = addBusinessDays(invoiceDate, 30);
```

### Scheduling / booking blackout dates

```typescript
import { getHolidays, isHoliday } from "id-bank-holidays";

const blocked = getHolidays(2026)
  .filter((h) => h.type !== "observance")
  .map((h) => h.date);
```

### Cron jobs that skip holidays

```typescript
import { isWorkingDay, today } from "id-bank-holidays";

if (isWorkingDay(today())) {
  runDailyJob();
}
```

### HR leave calculations

```typescript
import { businessDaysBetween } from "id-bank-holidays";

const leaveDays = businessDaysBetween("2026-07-01", "2026-07-10");
```

## Data Sources

Holiday data is manually maintained from official Bank Indonesia calendar PDFs. See [data/sources.md](data/sources.md) for per-year SKB references.

## Updating Holiday Data

1. Wait for BI to publish the new calendar PDF
2. Update the corresponding `data/YYYY.json` file
3. Run tests: `npm test`
4. Bump version per semver:
   - **Patch**: corrections to existing year
   - **Minor**: new year added
   - **Major**: breaking API or data format changes

## License

MIT
