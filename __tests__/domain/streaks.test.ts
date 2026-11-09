import { calculateStreak, readingCalendar, uniqueReadingDays } from "../../src/domain/streaks";

describe("streaks", () => {
  test("uniqueReadingDays normalises timestamps", () => {
    const days = uniqueReadingDays([
      "2026-03-01T08:00:00.000Z",
      "2026-03-01T22:00:00.000Z",
      "2026-03-02T01:00:00.000Z",
    ]);
    expect(days.size).toBeGreaterThanOrEqual(2);
  });

  test("calculateStreak counts consecutive days and allows today gap", () => {
    const now = new Date("2026-03-05T15:00:00.000Z");
    // Build local day keys relative to `now` by using local midday dates
    const day = (offset: number) => {
      const d = new Date(now);
      d.setHours(12, 0, 0, 0);
      d.setDate(d.getDate() + offset);
      return d.toISOString();
    };

    const timestamps = [day(-1), day(-2), day(-3)];
    const streak = calculateStreak(timestamps, now);
    expect(streak.current).toBe(3);
    expect(streak.longest).toBeGreaterThanOrEqual(3);
  });

  test("readingCalendar counts per day in month", () => {
    const now = new Date(2026, 2, 10, 12);
    const stamps = [
      new Date(2026, 2, 1, 9).toISOString(),
      new Date(2026, 2, 1, 18).toISOString(),
      new Date(2026, 2, 2, 9).toISOString(),
    ];
    const cal = readingCalendar(stamps, now.getFullYear(), 3);
    expect(Object.values(cal).reduce((a, b) => a + b, 0)).toBe(3);
  });
});
