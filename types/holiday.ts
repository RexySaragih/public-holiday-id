export type HolidayType = "public" | "joint" | "observance";

export interface Holiday {
  date: string;
  name: string;
  type: HolidayType;
  isJointHoliday: boolean;
  isObservance: boolean;
}

export interface UpcomingHoliday extends Holiday {
  daysUntil: number;
}

export interface YearData {
  year: number;
  version: string;
  holidays: Holiday[];
}

export interface CheckDateResult {
  date: string;
  dayOfWeek: string;
  isHoliday: boolean;
  isWeekend: boolean;
  holidays: Holiday[];
}

export interface YearSummary {
  year: number;
  holidays: Holiday[];
  totalPublic: number;
  totalJoint: number;
  totalObservance: number;
}

export interface VersionInfo {
  packageVersion: string;
  holidayDataVersion: string;
}

export type DateInput = string | Date;
