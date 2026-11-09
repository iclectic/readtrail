import type { Achievement } from "../../domain/types";
import { mapAchievement } from "../mappers";
import { runQuery, runWrite } from "../sqlite";

export async function unlockAchievement(input: {
  id: string;
  key: string;
  title: string;
  description: string;
  unlockedAt?: string;
}): Promise<Achievement> {
  const achievement: Achievement = {
    id: input.id,
    key: input.key,
    title: input.title,
    description: input.description,
    unlockedAt: input.unlockedAt ?? new Date().toISOString(),
  };
  await runWrite(
    `INSERT OR IGNORE INTO achievements (id, key, title, description, unlockedAt)
     VALUES (?, ?, ?, ?, ?);`,
    [
      achievement.id,
      achievement.key,
      achievement.title,
      achievement.description,
      achievement.unlockedAt,
    ]
  );
  return achievement;
}

export async function getAchievementByKey(key: string): Promise<Achievement | null> {
  const rows = await runQuery<Parameters<typeof mapAchievement>[0]>(
    `SELECT id, key, title, description, unlockedAt FROM achievements WHERE key = ? LIMIT 1;`,
    [key]
  );
  return rows[0] ? mapAchievement(rows[0]) : null;
}

export async function getAllAchievements(): Promise<Achievement[]> {
  const rows = await runQuery<Parameters<typeof mapAchievement>[0]>(
    `SELECT id, key, title, description, unlockedAt FROM achievements ORDER BY unlockedAt DESC;`
  );
  return rows.map(mapAchievement);
}
