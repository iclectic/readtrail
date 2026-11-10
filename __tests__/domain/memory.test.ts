import {
  initialMemorySchedule,
  isDueForReview,
  scheduleAfterReview,
  sortMemoryQueue,
} from "../../src/domain/memory";

describe("reading memory schedule", () => {
  test("initial schedule is due immediately", () => {
    const now = new Date("2026-03-01T12:00:00.000Z");
    const schedule = initialMemorySchedule(now);
    expect(schedule.intervalDays).toBe(0);
    expect(isDueForReview(schedule.nextReviewAt, now)).toBe(true);
  });

  test("good recall advances interval", () => {
    const now = new Date("2026-03-01T12:00:00.000Z");
    const first = scheduleAfterReview(
      { intervalDays: 0, easeFactor: 2.5, repetitions: 0 },
      4,
      now
    );
    expect(first.repetitions).toBe(1);
    expect(first.intervalDays).toBe(1);

    const second = scheduleAfterReview(first, 5, now);
    expect(second.repetitions).toBe(2);
    expect(second.intervalDays).toBe(6);
  });

  test("failed recall resets repetitions", () => {
    const next = scheduleAfterReview(
      { intervalDays: 10, easeFactor: 2.5, repetitions: 4 },
      1,
      new Date("2026-03-01T12:00:00.000Z")
    );
    expect(next.repetitions).toBe(0);
    expect(next.intervalDays).toBe(1);
  });

  test("sortMemoryQueue puts due items first", () => {
    const now = new Date("2026-03-10T12:00:00.000Z");
    const sorted = sortMemoryQueue(
      [
        {
          nextReviewAt: "2026-03-20T09:00:00.000Z",
          updatedAt: "2026-03-01T00:00:00.000Z",
          id: "later",
        },
        {
          nextReviewAt: "2026-03-01T09:00:00.000Z",
          updatedAt: "2026-03-02T00:00:00.000Z",
          id: "due",
        },
      ],
      now
    );
    expect(sorted[0]?.id).toBe("due");
  });
});
