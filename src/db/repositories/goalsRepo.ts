import type { Goal, GoalType } from "../../domain/types";
import { mapGoal } from "../mappers";
import { runQuery, runWrite } from "../sqlite";

export async function createGoal(input: {
  id: string;
  type: GoalType;
  targetValue: number;
  periodStart: string;
  periodEnd?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}): Promise<Goal> {
  const now = new Date().toISOString();
  const goal: Goal = {
    id: input.id,
    type: input.type,
    targetValue: input.targetValue,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd ?? null,
    isActive: input.isActive ?? true,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  };
  await runWrite(
    `INSERT INTO goals
      (id, type, targetValue, periodStart, periodEnd, isActive, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      goal.id,
      goal.type,
      goal.targetValue,
      goal.periodStart,
      goal.periodEnd,
      goal.isActive ? 1 : 0,
      goal.createdAt,
      goal.updatedAt,
    ]
  );
  return goal;
}

export async function updateGoal(
  id: string,
  patch: Partial<Omit<Goal, "id" | "createdAt">>
): Promise<Goal | null> {
  const existing = await getGoalById(id);
  if (!existing) return null;
  const next: Goal = {
    ...existing,
    ...patch,
    updatedAt: patch.updatedAt ?? new Date().toISOString(),
  };
  await runWrite(
    `UPDATE goals SET
      type = ?, targetValue = ?, periodStart = ?, periodEnd = ?, isActive = ?, updatedAt = ?
     WHERE id = ?;`,
    [
      next.type,
      next.targetValue,
      next.periodStart,
      next.periodEnd,
      next.isActive ? 1 : 0,
      next.updatedAt,
      next.id,
    ]
  );
  return next;
}

export async function deleteGoal(id: string): Promise<boolean> {
  const result = await runWrite(`DELETE FROM goals WHERE id = ?;`, [id]);
  return result.changes > 0;
}

export async function getGoalById(id: string): Promise<Goal | null> {
  const rows = await runQuery<Parameters<typeof mapGoal>[0]>(
    `SELECT id, type, targetValue, periodStart, periodEnd, isActive, createdAt, updatedAt
     FROM goals WHERE id = ? LIMIT 1;`,
    [id]
  );
  return rows[0] ? mapGoal(rows[0]) : null;
}

export async function getActiveGoals(): Promise<Goal[]> {
  const rows = await runQuery<Parameters<typeof mapGoal>[0]>(
    `SELECT id, type, targetValue, periodStart, periodEnd, isActive, createdAt, updatedAt
     FROM goals WHERE isActive = 1 ORDER BY createdAt DESC;`
  );
  return rows.map(mapGoal);
}

export async function getAllGoals(): Promise<Goal[]> {
  const rows = await runQuery<Parameters<typeof mapGoal>[0]>(
    `SELECT id, type, targetValue, periodStart, periodEnd, isActive, createdAt, updatedAt
     FROM goals ORDER BY createdAt DESC;`
  );
  return rows.map(mapGoal);
}
