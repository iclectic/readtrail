import {
  defaultTargetForType,
  goalProgress,
  goalTypeLabel,
  periodBoundsForType,
} from "../../src/domain/goals";

describe("goals", () => {
  test("goalProgress reports completion", () => {
    const result = goalProgress(
      { type: "yearly_books", targetValue: 12 },
      { pagesRead: 0, minutesRead: 0, booksFinished: 12 }
    );
    expect(result.complete).toBe(true);
    expect(result.percent).toBe(100);
  });

  test("daily pages progress", () => {
    const result = goalProgress(
      { type: "daily_pages", targetValue: 20 },
      { pagesRead: 10, minutesRead: 0, booksFinished: 0 }
    );
    expect(result.current).toBe(10);
    expect(result.percent).toBe(50);
    expect(result.complete).toBe(false);
  });

  test("labels and defaults exist for every type", () => {
    expect(goalTypeLabel("weekly_minutes")).toContain("Weekly");
    expect(defaultTargetForType("yearly_books")).toBe(24);
  });

  test("period bounds produce ISO ranges", () => {
    const daily = periodBoundsForType("daily_pages", new Date("2026-06-15T12:00:00.000Z"));
    expect(new Date(daily.periodEnd).getTime()).toBeGreaterThan(
      new Date(daily.periodStart).getTime()
    );
    const yearly = periodBoundsForType("yearly_books", new Date("2026-06-15T12:00:00.000Z"));
    expect(yearly.periodStart).toContain("2026");
  });
});
