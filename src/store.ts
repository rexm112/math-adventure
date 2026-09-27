import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Grade, QuestionResult, SessionSummary } from './types'

export interface ProfileStats {
  totalPoints: number
  totalQuestions: number
  firstTryCorrect: number
  challengeFirstTry: number
  stars3: number
  sessions: number
  streakBest: number
  /** 练习过的日期（yyyy-mm-dd），用于"坚持天数" */
  dates: string[]
  /** 每主题统计 */
  byTopic: Record<string, { first: number; total: number }>
  /** 最近一局的简要记录 */
  recent: { date: string; grade: Grade; points: number; stars: number; accuracy: number }[]
}

export interface Profile {
  id: string
  name: string
  avatar: string
  grade: Grade
  createdAt: number
  badges: string[]
  stats: ProfileStats
}

export const AVATARS = ['🐰', '🦁', '🐼', '🦊', '🐨', '🐯', '🐸', '🦄', '🐧', '🐤']

function emptyStats(): ProfileStats {
  return { totalPoints: 0, totalQuestions: 0, firstTryCorrect: 0, challengeFirstTry: 0, stars3: 0, sessions: 0, streakBest: 0, dates: [], byTopic: {}, recent: [] }
}

interface AppState {
  profiles: Profile[]
  activeId: string | null
  soundOn: boolean
  addProfile: (name: string, avatar: string, grade: Grade) => Profile
  updateProfile: (id: string, patch: Partial<Pick<Profile, 'name' | 'avatar' | 'grade'>>) => void
  removeProfile: (id: string) => void
  setActive: (id: string | null) => void
  toggleSound: () => void
  finishSession: (profileId: string, summary: Omit<SessionSummary, 'earnedBadges'>) => string[]
  resetAll: () => void
}

const today = () => new Date().toISOString().slice(0, 10)

export const BADGES: { id: string; name: string; emoji: string; desc: string }[] = [
  { id: 'first', name: '初次冒险', emoji: '🌱', desc: '完成第一次练习' },
  { id: 'perfect10', name: '完美一局', emoji: '💯', desc: '一局 10 题全部一次答对' },
  { id: 'brave', name: '挑战者', emoji: '🚀', desc: '一次答对拓展题' },
  { id: 'king10', name: '挑战王者', emoji: '👑', desc: '累计 10 次一次答对拓展题' },
  { id: 'q100', name: '百题斩', emoji: '🏅', desc: '累计完成 100 题' },
  { id: 'q500', name: '五百勇士', emoji: '🎖️', desc: '累计完成 500 题' },
  { id: 'star50', name: '星光闪耀', emoji: '⭐', desc: '累计获得 50 个三星' },
  { id: 'week7', name: '坚持之星', emoji: '📅', desc: '累计 7 天完成练习' },
  { id: 'rich', name: '小富翁', emoji: '💰', desc: '累计获得 1000 分' },
]

function checkBadges(p: Profile, s: ProfileStats, summary: Omit<SessionSummary, 'earnedBadges'>): string[] {
  const earned: string[] = []
  const has = (id: string) => p.badges.includes(id) || earned.includes(id)
  const add = (id: string) => {
    if (!has(id)) earned.push(id)
  }
  const firstTryAll = summary.results.length > 0 && summary.results.every((r) => r.wrongAttempts === 0 && !r.skipped)
  if (s.sessions >= 1) add('first')
  if (firstTryAll) add('perfect10')
  if (summary.results.some((r) => r.difficulty === 'challenge' && r.wrongAttempts === 0)) add('brave')
  if (s.challengeFirstTry >= 10) add('king10')
  if (s.totalQuestions >= 100) add('q100')
  if (s.totalQuestions >= 500) add('q500')
  if (s.stars3 >= 50) add('star50')
  if (s.dates.length >= 7) add('week7')
  if (s.totalPoints >= 1000) add('rich')
  return earned
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeId: null,
      soundOn: true,
      addProfile: (name, avatar, grade) => {
        const p: Profile = { id: `p${Date.now()}`, name, avatar, grade, createdAt: Date.now(), badges: [], stats: emptyStats() }
        set({ profiles: [...get().profiles, p] })
        return p
      },
      updateProfile: (id, patch) =>
        set({ profiles: get().profiles.map((p) => (p.id === id ? { ...p, ...patch } : p)) }),
      removeProfile: (id) => {
        const rest = get().profiles.filter((p) => p.id !== id)
        set({ profiles: rest, activeId: get().activeId === id ? null : get().activeId })
      },
      setActive: (id) => set({ activeId: id }),
      toggleSound: () => set({ soundOn: !get().soundOn }),
      finishSession: (profileId, summary) => {
        const prev = get().profiles
        const beforeBadges = prev.find((x) => x.id === profileId)?.badges ?? []
        const profiles = prev.map((p) => {
          if (p.id !== profileId) return p
          const s: ProfileStats = {
            ...p.stats,
            totalPoints: p.stats.totalPoints + summary.points,
            totalQuestions: p.stats.totalQuestions + summary.total,
            firstTryCorrect: p.stats.firstTryCorrect + summary.firstTryCount,
            challengeFirstTry:
              p.stats.challengeFirstTry +
              summary.results.filter((r) => r.difficulty === 'challenge' && r.wrongAttempts === 0 && !r.skipped).length,
            stars3: p.stats.stars3 + summary.results.filter((r) => r.stars === 3).length,
            sessions: p.stats.sessions + 1,
            streakBest: Math.max(p.stats.streakBest, summary.results.reduce((acc, r) => Math.max(acc, r.stars), 0)),
            dates: p.stats.dates.includes(today()) ? p.stats.dates : [...p.stats.dates, today()],
            byTopic: { ...p.stats.byTopic },
            recent: [
              { date: today(), grade: summary.grade, points: summary.points, stars: summary.stars, accuracy: Math.round((summary.firstTryCount / summary.total) * 100) },
              ...p.stats.recent,
            ].slice(0, 20),
          }
          for (const r of summary.results as QuestionResult[]) {
            const t = (s.byTopic[r.topicId] ??= { first: 0, total: 0 })
            t.total += 1
            if (r.wrongAttempts === 0 && !r.skipped) t.first += 1
          }
          const earned = checkBadges(p, s, summary)
          return { ...p, stats: s, badges: [...p.badges, ...earned] }
        })
        set({ profiles })
        const afterBadges = profiles.find((x) => x.id === profileId)?.badges ?? []
        return afterBadges.filter((b) => !beforeBadges.includes(b))
      },
      resetAll: () => set({ profiles: [], activeId: null }),
    }),
    { name: 'math-adventure-v1' },
  ),
)
