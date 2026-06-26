# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-26

### Added

- Initial release with Indonesian bank holiday data for 2022–2026
- Core API: `getHolidays`, `getHoliday`, `isHoliday`, `checkDate`, `getUpcoming`
- Business day utilities: `isWorkingDay`, `addBusinessDays`, `businessDaysBetween`
- Search, filtering, and date range queries
- CLI: `npx id-bank-holidays today|upcoming|year`
- Zero runtime dependencies
- Data sourced from official Bank Indonesia holiday calendars
- `daysUntil` field on `getUpcoming()` results (mirrors API.co.id `days_until`)

