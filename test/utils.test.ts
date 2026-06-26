import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { today, tomorrow, yesterday, parseDate } from "../src/index.js";
import { addDays } from "../src/utils.js";

describe("Date Utilities", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-26T15:00:00+07:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return today in Jakarta timezone", () => {
    expect(today()).toBe("2026-06-26");
  });

  it("should return tomorrow in Jakarta timezone", () => {
    expect(tomorrow()).toBe("2026-06-27");
  });

  it("should return yesterday in Jakarta timezone", () => {
    expect(yesterday()).toBe("2026-06-25");
  });

  it("should handle Jakarta midnight boundary", () => {
    vi.setSystemTime(new Date("2026-06-26T00:30:00+07:00"));
    expect(today()).toBe("2026-06-26");
  });

  it("should parse ISO date strings", () => {
    expect(parseDate("2026-01-01")).toBe("2026-01-01");
  });

  it("should reject invalid date format", () => {
    expect(() => parseDate("01-01-2026")).toThrow("Invalid date format");
  });

  it("should add days correctly across month boundary", () => {
    expect(addDays("2026-01-30", 3)).toBe("2026-02-02");
  });

  it("should add days correctly across year boundary", () => {
    expect(addDays("2025-12-31", 1)).toBe("2026-01-01");
  });

  it("should handle leap year February", () => {
    expect(addDays("2024-02-28", 1)).toBe("2024-02-29");
    expect(addDays("2024-02-29", 1)).toBe("2024-03-01");
  });
});
