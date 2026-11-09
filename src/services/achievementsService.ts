import { createId } from "../domain";
import type { Book, ProgressEntry, ReadingSession } from "../domain/types";
import { getAchievementByKey, unlockAchievement } from "../db";
import { calculateStreak } from "../domain/streaks";

type AchievementDef = {
  key: string;
  title: string;
  description: string;
  test: (ctx: {
    books: Book[];
    entries: ProgressEntry[];
    sessions: ReadingSession[];
  }) => boolean;
};

const DEFINITIONS: AchievementDef[] = [
  {
    key: "first_book",
    title: "First steps",
    description: "Added your first book to the library.",
    test: ({ books }) => books.length >= 1,
  },
  {
    key: "first_session",
    title: "Clocked in",
    description: "Completed your first reading session.",
    test: ({ sessions }) => sessions.some((s) => s.endedAt != null),
  },
  {
    key: "finish_one",
    title: "Finisher",
    description: "Finished your first book.",
    test: ({ books }) => books.some((b) => b.status === "finished"),
  },
  {
    key: "finish_five",
    title: "Shelf clearer",
    description: "Finished five books.",
    test: ({ books }) => books.filter((b) => b.status === "finished").length >= 5,
  },
  {
    key: "streak_7",
    title: "Week of words",
    description: "Maintained a seven-day reading streak.",
    test: ({ entries, sessions }) => {
      const timestamps = [
        ...entries.map((e) => e.createdAt),
        ...sessions.map((s) => s.startedAt),
      ];
      return calculateStreak(timestamps).current >= 7;
    },
  },
];

export async function evaluateAchievements(ctx: {
  books: Book[];
  entries: ProgressEntry[];
  sessions: ReadingSession[];
}): Promise<{ newlyUnlocked: string[] }> {
  const newlyUnlocked: string[] = [];

  for (const def of DEFINITIONS) {
    if (!def.test(ctx)) continue;
    const existing = await getAchievementByKey(def.key);
    if (existing) continue;
    await unlockAchievement({
      id: createId("achievement"),
      key: def.key,
      title: def.title,
      description: def.description,
    });
    newlyUnlocked.push(def.key);
  }

  return { newlyUnlocked };
}
