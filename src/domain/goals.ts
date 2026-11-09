import type { Goal, GoalType } from "./types";

export interface GoalProgressInput {
  pagesRead: number;
  minutesRead: number;
  booksFinished: number;
}

export function goalProgress(
  goal: Pick<Goal, "type" | "targetValue">,
  input: GoalProgressInput
): { current: number; target: number; percent: number; complete: boolean } {
  const current = valueForGoalType(goal.type, input);
  const target = Math.max(0, goal.targetValue);
  const percent =
    target === 0 ? 100 : Math.min(100, Math.round((current / target) * 100));
  return {
    current,
    target,
    percent,
    complete: target > 0 ? current >= target : current > 0,
  };
}

export function valueForGoalType(type: GoalType, input: GoalProgressInput): number {
  switch (type) {
    case "daily_pages":
    case "weekly_pages":
      return Math.max(0, input.pagesRead);
    case "daily_minutes":
    case "weekly_minutes":
      return Math.max(0, input.minutesRead);
    case "monthly_books":
    case "yearly_books":
      return Math.max(0, input.booksFinished);
    default:
      return 0;
  }
}

export function goalTypeLabel(type: GoalType): string {
  switch (type) {
    case "daily_pages":
      return "Daily pages";
    case "daily_minutes":
      return "Daily reading time";
    case "weekly_pages":
      return "Weekly pages";
    case "weekly_minutes":
      return "Weekly reading time";
    case "monthly_books":
      return "Monthly books";
    case "yearly_books":
      return "Annual books";
    default:
      return type;
  }
}

export function defaultTargetForType(type: GoalType): number {
  switch (type) {
    case "daily_pages":
      return 20;
    case "daily_minutes":
      return 30;
    case "weekly_pages":
      return 100;
    case "weekly_minutes":
      return 210;
    case "monthly_books":
      return 2;
    case "yearly_books":
      return 24;
    default:
      return 1;
  }
}

export function periodBoundsForType(
  type: GoalType,
  now: Date = new Date()
): { periodStart: string; periodEnd: string } {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);

  if (type.startsWith("daily")) {
    end.setDate(end.getDate() + 1);
  } else if (type.startsWith("weekly")) {
    const day = start.getDay(); // 0 Sunday
    const mondayOffset = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + mondayOffset);
    end.setTime(start.getTime());
    end.setDate(end.getDate() + 7);
  } else if (type.startsWith("monthly")) {
    start.setDate(1);
    end.setMonth(start.getMonth() + 1, 1);
  } else {
    start.setMonth(0, 1);
    end.setFullYear(start.getFullYear() + 1, 0, 1);
  }

  return {
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
  };
}
