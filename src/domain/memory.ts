/**
 * Lightweight spaced-repetition helpers for Reading Memory.
 * Based on a simplified SM-2 style schedule. Never fabricates book quotations.
 */

export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

export type MemorySchedule = {
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  nextReviewAt: string;
  lastReviewedAt: string;
};

const MIN_EASE = 1.3;

export function initialMemorySchedule(now: Date = new Date()): MemorySchedule {
  return {
    intervalDays: 0,
    easeFactor: 2.5,
    repetitions: 0,
    nextReviewAt: now.toISOString(),
    lastReviewedAt: now.toISOString(),
  };
}

/**
 * Advance a note's review schedule after the user rates recall quality (0–5).
 * Quality ≤ 2 resets the learning streak.
 */
export function scheduleAfterReview(
  current: Pick<MemorySchedule, "intervalDays" | "easeFactor" | "repetitions">,
  quality: ReviewQuality,
  now: Date = new Date()
): MemorySchedule {
  let { intervalDays, easeFactor, repetitions } = current;

  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.max(1, Math.round(intervalDays * easeFactor));
    }
    repetitions += 1;
  }

  easeFactor = Math.max(
    MIN_EASE,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const next = new Date(now);
  next.setHours(9, 0, 0, 0);
  next.setDate(next.getDate() + intervalDays);

  return {
    intervalDays,
    easeFactor: Math.round(easeFactor * 100) / 100,
    repetitions,
    nextReviewAt: next.toISOString(),
    lastReviewedAt: now.toISOString(),
  };
}

export function isDueForReview(
  nextReviewAt: string | null | undefined,
  now: Date = new Date()
): boolean {
  if (!nextReviewAt) return true;
  const due = new Date(nextReviewAt);
  if (Number.isNaN(due.getTime())) return true;
  return due.getTime() <= now.getTime();
}

export function sortMemoryQueue<T extends { nextReviewAt: string | null; updatedAt: string }>(
  notes: T[],
  now: Date = new Date()
): T[] {
  return [...notes].sort((a, b) => {
    const aDue = isDueForReview(a.nextReviewAt, now) ? 0 : 1;
    const bDue = isDueForReview(b.nextReviewAt, now) ? 0 : 1;
    if (aDue !== bDue) return aDue - bDue;
    const aTime = a.nextReviewAt ? new Date(a.nextReviewAt).getTime() : 0;
    const bTime = b.nextReviewAt ? new Date(b.nextReviewAt).getTime() : 0;
    if (aTime !== bTime) return aTime - bTime;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}
