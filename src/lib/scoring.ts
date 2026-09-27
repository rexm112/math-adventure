import type { Difficulty, QuestionResult } from '../types'

/** 各难度基础分 */
export const BASE_POINTS: Record<Difficulty, number> = {
  easy: 10,
  medium: 20,
  hard: 30,
  challenge: 50,
}

export const DIFF_LABEL: Record<Difficulty, { name: string; emoji: string; cls: string }> = {
  easy: { name: '简单', emoji: '🌱', cls: 'diff-easy' },
  medium: { name: '中等', emoji: '🍀', cls: 'diff-medium' },
  hard: { name: '困难', emoji: '🔥', cls: 'diff-hard' },
  challenge: { name: '拓展', emoji: '🚀', cls: 'diff-challenge' },
}

/**
 * 星级规则（对孩子简单可解释）：
 * - 一次答对且没主动看提示 → 3 星
 * - 错 1 次或看了 1 条提示 → 2 星
 * - 其他 → 1 星
 */
export function starsFor(wrongAttempts: number, proactiveHints: number): number {
  if (wrongAttempts === 0 && proactiveHints === 0) return 3
  if (wrongAttempts <= 1 && proactiveHints <= 1) return 2
  return 1
}

/** 单题得分 = 基础分 × 星级系数（3星 100%，2星 70%，1星 40%），拓展题3星额外 +20 */
export function pointsFor(difficulty: Difficulty, stars: number): number {
  const factor = stars === 3 ? 1 : stars === 2 ? 0.7 : 0.4
  let p = Math.round(BASE_POINTS[difficulty] * factor)
  if (difficulty === 'challenge' && stars === 3) p += 20
  return p
}

/** 连续 3 题一次答对，奖励 10 分（streak 为当前连对数，返回本题追加奖励） */
export function streakBonus(streakAfterFirstTry: number): number {
  return streakAfterFirstTry > 0 && streakAfterFirstTry % 3 === 0 ? 10 : 0
}

export const LEVELS = [
  { min: 0, title: '数学萌新', emoji: '🐣' },
  { min: 100, title: '计算小能手', emoji: '🐝' },
  { min: 250, title: '思维探险家', emoji: '🧭' },
  { min: 500, title: '解题高手', emoji: '🥋' },
  { min: 1000, title: '数学达人', emoji: '🚀' },
  { min: 2000, title: '冒险明星', emoji: '🌟' },
  { min: 3500, title: '数学之王', emoji: '👑' },
]

export function levelOf(points: number) {
  let idx = 0
  for (let i = 0; i < LEVELS.length; i++) if (points >= LEVELS[i].min) idx = i
  const cur = LEVELS[idx]
  const next = LEVELS[idx + 1]
  const progress = next ? (points - cur.min) / (next.min - cur.min) : 1
  return { level: idx + 1, ...cur, next, progress: Math.min(1, progress) }
}

export function accuracyOf(results: QuestionResult[]): number {
  const first = results.filter((r) => r.stars > 0 && r.wrongAttempts === 0).length
  return results.length ? Math.round((first / results.length) * 100) : 0
}
