import {
  checkDate,
  getHolidays,
  getUpcoming,
  today,
} from "../src/index.js";

const [, , command, ...args] = process.argv;

function printUsage(): void {
  console.log(`Usage:
  id-bank-holidays today
  id-bank-holidays upcoming [limit]
  id-bank-holidays year <year>`);
}

function formatHolidayLine(holiday: { date: string; name: string; type: string }): string {
  return `${holiday.date}  ${holiday.name}  (${holiday.type})`;
}

switch (command) {
  case "today": {
    const dateStr = today();
    const result = checkDate(dateStr);
    console.log(`Date: ${result.date} (${result.dayOfWeek})`);
    console.log(`Holiday: ${result.isHoliday ? "Yes" : "No"}`);
    console.log(`Weekend: ${result.isWeekend ? "Yes" : "No"}`);
    if (result.holidays.length > 0) {
      console.log("Holidays:");
      for (const h of result.holidays) {
        console.log(`  - ${h.name} (${h.type})`);
      }
    }
    break;
  }
  case "upcoming": {
    const limit = args[0] ? Number(args[0]) : 10;
    const holidays = getUpcoming(limit);
    if (holidays.length === 0) {
      console.log("No upcoming holidays found.");
      break;
    }
    for (const h of holidays) {
      console.log(formatHolidayLine(h));
    }
    break;
  }
  case "year": {
    const year = Number(args[0]);
    if (!year || Number.isNaN(year)) {
      console.error("Error: year argument is required.");
      printUsage();
      process.exit(1);
    }
    try {
      const holidays = getHolidays(year).filter((h) => h.type !== "observance");
      if (holidays.length === 0) {
        console.log(`No holidays found for ${year}.`);
        break;
      }
      for (const h of holidays) {
        console.log(formatHolidayLine(h));
      }
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
    break;
  }
  default:
    printUsage();
    process.exit(command ? 1 : 0);
}
