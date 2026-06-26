import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getHolidays,
  getHoliday,
  isHoliday,
  isBankHoliday,
  checkDate,
  getUpcoming,
  nextHoliday,
  previousHoliday,
  getYear,
  getMonth,
  getByType,
  search,
  getNames,
  exists,
  supportedYears,
  holidaysBetween,
  version,
} from "../src/index.js";
import data2022 from "../data/2022.json";
import data2023 from "../data/2023.json";
import data2024 from "../data/2024.json";
import data2025 from "../data/2025.json";
import data2026 from "../data/2026.json";
import { daysBetween } from "../src/utils.js";

const ALL_YEAR_DATA = [data2022, data2023, data2024, data2025, data2026];

describe("Holiday Data Integrity", () => {
  for (const yearData of ALL_YEAR_DATA) {
    describe(`year ${yearData.year}`, () => {
      it("should have matching year field", () => {
        expect(yearData.year).toBe(Number(yearData.year));
        for (const h of yearData.holidays) {
          expect(h.date.startsWith(String(yearData.year))).toBe(true);
        }
      });

      it("should have ISO-8601 compliant dates", () => {
        for (const h of yearData.holidays) {
          expect(h.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }
      });

      it("should have unique date+name combinations", () => {
        const seen = new Set<string>();
        for (const h of yearData.holidays) {
          const key = `${h.date}:${h.name}`;
          expect(seen.has(key)).toBe(false);
          seen.add(key);
        }
      });

      it("should have valid holiday types", () => {
        for (const h of yearData.holidays) {
          expect(["public", "joint", "observance"]).toContain(h.type);
        }
      });

      it("should match snapshot", () => {
        expect(yearData).toMatchSnapshot();
      });
    });
  }
});

describe("Holiday Lookups", () => {
  it("should return holidays for a specific year", () => {
    const holidays = getHolidays(2026);
    expect(holidays.length).toBeGreaterThan(0);
    expect(holidays.every((h) => h.date.startsWith("2026"))).toBe(true);
  });

  it("should throw for unsupported year", () => {
    expect(() => getHolidays(2019)).toThrow("No holiday data available");
  });

  it("should get a specific holiday by date", () => {
    const holiday = getHoliday("2026-01-01");
    expect(holiday).not.toBeNull();
    expect(holiday?.name).toContain("Tahun Baru");
  });

  it("should return null for non-holiday date", () => {
    expect(getHoliday("2026-06-10")).toBeNull();
  });

  it("should detect bank holidays", () => {
    expect(isHoliday("2026-01-01")).toBe(true);
    expect(isBankHoliday("2026-01-01")).toBe(true);
  });

  it("should not treat facultative holidays as bank holidays", () => {
    expect(isHoliday("2026-01-17")).toBe(false);
  });

  it("should check date with full details", () => {
    const result = checkDate("2026-03-21");
    expect(result.date).toBe("2026-03-21");
    expect(result.isHoliday).toBe(true);
    expect(result.holidays.length).toBeGreaterThan(0);
  });

  it("should return supported years", () => {
    expect(supportedYears()).toEqual([2022, 2023, 2024, 2025, 2026]);
  });

  it("should check year existence", () => {
    expect(exists(2026)).toBe(true);
    expect(exists(2028)).toBe(false);
  });
});

describe("Upcoming and Navigation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T10:00:00+07:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return upcoming holidays with daysUntil", () => {
    const upcoming = getUpcoming(5);
    expect(upcoming.length).toBeLessThanOrEqual(5);
    expect(upcoming.every((h) => h.date >= "2026-06-01")).toBe(true);
    expect(upcoming.every((h) => h.type !== "observance")).toBe(true);
    expect(upcoming.every((h) => h.daysUntil >= 0)).toBe(true);
    expect(upcoming.every((h) => h.daysUntil === daysBetween("2026-06-01", h.date))).toBe(true);
  });

  it("should return zero daysUntil for holidays today", () => {
    vi.setSystemTime(new Date("2026-06-01T10:00:00+07:00"));
    const upcoming = getUpcoming(20);
    const todayHoliday = upcoming.find((h) => h.date === "2026-06-01");
    if (todayHoliday) {
      expect(todayHoliday.daysUntil).toBe(0);
    }
  });

  it("should find next holiday", () => {
    const next = nextHoliday();
    expect(next).not.toBeNull();
    expect(next!.date >= "2026-06-01").toBe(true);
  });

  it("should find previous holiday", () => {
    const prev = previousHoliday();
    expect(prev).not.toBeNull();
    expect(prev!.date <= "2026-06-01").toBe(true);
  });
});

describe("Year and Month Queries", () => {
  it("should return year summary", () => {
    const summary = getYear(2026);
    expect(summary.year).toBe(2026);
    expect(summary.totalPublic).toBeGreaterThan(0);
    expect(summary.totalJoint).toBeGreaterThan(0);
    expect(summary.totalObservance).toBeGreaterThan(0);
  });

  it("should return holidays for a month", () => {
    const jan = getMonth(2026, 1);
    expect(jan.every((h) => h.date.startsWith("2026-01"))).toBe(true);
  });

  it("should filter by type", () => {
    const publicHolidays = getByType("public");
    expect(publicHolidays.every((h) => h.type === "public")).toBe(true);
  });
});

describe("Search and Names", () => {
  it("should search holidays by name", () => {
    const results = search("Natal");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((h) => h.name.toLowerCase().includes("natal"))).toBe(true);
  });

  it("should return unique holiday names", () => {
    const names = getNames();
    expect(names.length).toBe(new Set(names).size);
    expect(names).toEqual([...names].sort());
  });
});

describe("Date Range Queries", () => {
  it("should return holidays between dates", () => {
    const holidays = holidaysBetween("2026-01-01", "2026-01-31");
    expect(holidays.every((h) => h.date >= "2026-01-01" && h.date <= "2026-01-31")).toBe(true);
    expect(holidays.every((h) => h.type !== "observance")).toBe(true);
  });

  it("should throw when start is after end", () => {
    expect(() => holidaysBetween("2026-12-31", "2026-01-01")).toThrow();
  });
});

describe("Version", () => {
  it("should return version info", () => {
    const v = version();
    expect(v.packageVersion).toBe("1.0.0");
    expect(v.holidayDataVersion).toBe("2026.1");
  });
});
