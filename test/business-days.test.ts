import { describe, it, expect } from "vitest";
import {
  isWorkingDay,
  nextWorkingDay,
  previousWorkingDay,
  addBusinessDays,
  subtractBusinessDays,
  businessDaysBetween,
} from "../src/index.js";

describe("Business Day Calculations", () => {
  describe("when checking working days", () => {
    it("should return false for weekends", () => {
      expect(isWorkingDay("2026-06-06")).toBe(false); // Saturday
      expect(isWorkingDay("2026-06-07")).toBe(false); // Sunday
    });

    it("should return false for public holidays", () => {
      expect(isWorkingDay("2026-01-01")).toBe(false);
    });

    it("should return false for joint holidays", () => {
      expect(isWorkingDay("2026-02-16")).toBe(false);
    });

    it("should return true for facultative holidays on weekdays", () => {
      expect(isWorkingDay("2026-04-08")).toBe(true);
    });

    it("should return true for regular weekdays", () => {
      expect(isWorkingDay("2026-06-10")).toBe(true);
    });
  });

  describe("when finding next working day", () => {
    it("should skip weekend from Friday", () => {
      expect(nextWorkingDay("2026-06-05")).toBe("2026-06-08");
    });

    it("should skip holiday", () => {
      expect(nextWorkingDay("2025-12-24")).toBe("2025-12-29");
    });
  });

  describe("when finding previous working day", () => {
    it("should skip weekend from Monday", () => {
      expect(previousWorkingDay("2026-06-08")).toBe("2026-06-05");
    });
  });

  describe("when adding business days", () => {
    it("should skip weekends and holidays", () => {
      const result = addBusinessDays("2026-02-02", 5);
      expect(result).toBe("2026-02-09");
    });

    it("should handle zero days", () => {
      expect(addBusinessDays("2026-06-10", 0)).toBe("2026-06-10");
    });

    it("should handle negative days via subtract", () => {
      const result = subtractBusinessDays("2026-06-10", 3);
      expect(isWorkingDay(result)).toBe(true);
    });
  });

  describe("when counting business days between dates", () => {
    it("should count inclusive business days", () => {
      const count = businessDaysBetween("2026-06-08", "2026-06-12");
      expect(count).toBe(5);
    });

    it("should exclude holidays in range", () => {
      const count = businessDaysBetween("2026-05-28", "2026-06-05");
      expect(count).toBeLessThan(7);
    });

    it("should throw when start is after end", () => {
      expect(() => businessDaysBetween("2026-12-31", "2026-01-01")).toThrow();
    });
  });
});
