import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DifficultyMode, Grade, Question, QuestionResult, SessionSummary, WrongEntry } from './types'
import { createSyncGist, findSyncGist, mergeProfiles, pullSync, pushSync } from './lib/sync'

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
  /** 组卷难度档位（旧数据缺省为 standard） */
  difficultyMode?: DifficultyMode
  createdAt: number
  /** 数据更新时间，云同步按它合并 */
  updatedAt?: number
  badges: string[]
  stats: ProfileStats
  /** 错题本（旧数据缺省为空） */
  wrongBook?: WrongEntry[]
}

export interface AppSettings {
  /** 家长配置的 AI（OpenAI 兼容端点）：开放平台或 Coding Plan 均可 */
  aiKey?: string
  aiEndpoint?: string
  /** 兼容旧字段 */
  aiBase?: string
  aiModel?: string
  /** 自动朗读反馈 */
  tts?: boolean
}

export interface SyncCfg {
  token: string
  gistId: string
  lastSync: number
}

export const AVATARS = ['🐰', '🦁', '🐼', '🦊', '🐨', '🐯', '🐸', '🦄', '🐧', '🐤']

function emptyStats(): ProfileStats {
  return { totalPoints: 0, totalQuestions: 0, firstTryCorrect: 0, challengeFirstTry: 0, stars3: 0, sessions: 0, streakBest: 0, dates: [], byTopic: {}, recent: [] }
}

function normalizeProfile(p: Profile): Profile {
  return { ...p, difficultyMode: p.difficultyMode ?? 'standard', updatedAt: p.updatedAt ?? p.createdAt, wrongBook: p.wrongBook ?? [] }
}

interface AppState {
  profiles: Profile[]
  activeId: string | null
  soundOn: boolean
  settings: AppSettings
  syncCfg: SyncCfg | null
  addProfile: (name: string, avatar: string, grade: Grade) => Profile
  updateProfile: (id: string, patch: Partial<Pick<Profile, 'name' | 'avatar' | 'grade' | 'difficultyMode'>>) => void
  removeProfile: (id: string) => void
  setActive: (id: string | null) => void
  toggleSound: () => void
  setSettings: (patch: AppSettings) => void
  finishSession: (profileId: string, summary: Omit<SessionSummary, 'earnedBadges'>, wrongQuestions: Question[]) => string[]
  markExplained: (profileId: string, promptKey: string, pass: boolean) => void
  clearWrongBook: (profileId: string) => void
  /** 从导出文件恢复/合并数据 */
  importProfiles: (profiles: Profile[]) => void
  // 云同步
  setSyncCfg: (cfg: SyncCfg | null) => void
  setupSync: (token: string) => Promise<string>
  syncNow: (dir: 'push' | 'pull') => Promise<string>
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
  { id: 'rich', name: '小富翁', emoji: '💰', desc: '累计获得 2000 分' },
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
  if (s.totalPoints >= 2000) add('rich')
  return earned
}

function bump(updated: number): number {
  const now = Date.now()
  return now > updated ? now : updated + 1
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeId: null,
      soundOn: true,
      settings: {},
      syncCfg: null,

      addProfile: (name, avatar, grade) => {
        const p: Profile = { id: `p${Date.now()}`, name, avatar, grade, difficultyMode: 'standard', createdAt: Date.now(), updatedAt: Date.now(), badges: [], stats: emptyStats(), wrongBook: [] }
        set({ profiles: [...get().profiles, p] })
        void maybeAutoPush(get, set)
        return p
      },

      updateProfile: (id, patch) => {
        set({ profiles: get().profiles.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: bump(p.updatedAt ?? p.createdAt) } : p)) })
        void maybeAutoPush(get, set)
      },

      removeProfile: (id) => {
        const rest = get().profiles.filter((p) => p.id !== id)
        set({ profiles: rest, activeId: get().activeId === id ? null : get().activeId })
        void maybeAutoPush(get, set)
      },

      setActive: (id) => set({ activeId: id }),
      toggleSound: () => set({ soundOn: !get().soundOn }),
      setSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),

      finishSession: (profileId, summary, wrongQuestions) => {
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
          // 错题入本：同题（按题干）只累计次数；答对并讲清思路才算攻克
          const wrongBook = [...(p.wrongBook ?? [])]
          for (const wq of wrongQuestions) {
            const hit = wrongBook.find((e) => e.q.prompt === wq.prompt)
            if (hit) {
              hit.wrongCount += 1
              hit.lastWrongAt = Date.now()
              hit.mastered = false
              hit.q = wq
            } else {
              wrongBook.push({ q: wq, wrongCount: 1, lastWrongAt: Date.now(), mastered: false, explainAttempts: 0 })
            }
          }
          // 错题本最多留 60 条：优先清掉已攻克的最旧条目
          while (wrongBook.length > 60) {
            const idx = wrongBook.findIndex((e) => e.mastered)
            if (idx >= 0) wrongBook.splice(idx, 1)
            else wrongBook.shift()
          }
          const earned = checkBadges(p, s, summary)
          return { ...p, stats: s, wrongBook, badges: [...p.badges, ...earned], updatedAt: bump(p.updatedAt ?? p.createdAt) }
        })
        set({ profiles })
        void maybeAutoPush(get, set)
        const afterBadges = profiles.find((x) => x.id === profileId)?.badges ?? []
        return afterBadges.filter((b) => !beforeBadges.includes(b))
      },

      markExplained: (profileId, promptKey, pass) => {
        set({
          profiles: get().profiles.map((p) => {
            if (p.id !== profileId) return p
            const wrongBook = (p.wrongBook ?? []).map((e) => {
              if (e.q.prompt !== promptKey) return e
              return { ...e, explainAttempts: e.explainAttempts + 1, mastered: pass ? true : e.mastered }
            })
            return { ...p, wrongBook, updatedAt: bump(p.updatedAt ?? p.createdAt) }
          }),
        })
        void maybeAutoPush(get, set)
      },

      clearWrongBook: (profileId) => {
        set({ profiles: get().profiles.map((p) => (p.id === profileId ? { ...p, wrongBook: [], updatedAt: bump(p.updatedAt ?? p.createdAt) } : p)) })
      },

      importProfiles: (incoming) => {
        const merged = mergeProfiles(get().profiles, incoming.map((x) => normalizeProfile(x)))
        set({ profiles: merged })
        void maybeAutoPush(get, set)
      },

      // ---------- 云同步 ----------
      setSyncCfg: (cfg) => set({ syncCfg: cfg }),

      setupSync: async (token) => {
        // 先找已有的同步仓库（换设备粘同一个 token 即可接上），没有才新建
        const existing = await findSyncGist(token)
        if (existing) {
          let merged = 0
          try {
            const remote = await pullSync(token, existing)
            merged = mergeProfiles(get().profiles, remote.profiles ?? []).length
            set({ profiles: mergeProfiles(get().profiles, remote.profiles ?? []) })
          } catch {
            /* 云端数据暂时读不到也不影响绑定 */
          }
          set({ syncCfg: { token, gistId: existing, lastSync: Date.now() } })
          return `已连接到云端仓库 ✓（共 ${merged} 位小勇士，已合并到本机）`
        }
        const gistId = await createSyncGist(token, get().profiles)
        set({ syncCfg: { token, gistId, lastSync: Date.now() } })
        return `已创建云端仓库并上传 ✓（Gist ID：${gistId.slice(0, 8)}…）`
      },

      syncNow: async (dir) => {
        const cfg = get().syncCfg
        if (!cfg) throw new Error('请先在设置里配置云同步')
        if (dir === 'push') {
          await pushSync(cfg.token, cfg.gistId, get().profiles)
          set({ syncCfg: { ...cfg, lastSync: Date.now() } })
          return '已上传云端 ✓'
        }
        const remote = await pullSync(cfg.token, cfg.gistId)
        const merged = mergeProfiles(get().profiles, remote.profiles ?? [])
        set({ profiles: merged, syncCfg: { ...cfg, lastSync: Date.now() } })
        return `已从云端合并 ✓（共 ${merged.length} 位小勇士）`
      },

      resetAll: () => set({ profiles: [], activeId: null }),
    }),
    {
      name: 'math-adventure-v1',
      // 旧版本数据兼容：补齐新增字段
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AppState>
        return {
          ...current,
          ...p,
          profiles: (p.profiles ?? []).map((x) => normalizeProfile(x as Profile)),
        }
      },
    },
  ),
)

/** 配置过同步时，数据变化后自动上传（失败静默，下次再试） */
async function maybeAutoPush(get: () => AppState, set: (partial: Partial<AppState>) => void) {
  const cfg = get().syncCfg
  if (!cfg) return
  try {
    await pushSync(cfg.token, cfg.gistId, get().profiles)
    set({ syncCfg: { ...cfg, lastSync: Date.now() } })
  } catch {
    /* 网络不佳时跳过，等下一次数据变化或手动同步 */
  }
}

/** 挑选错题重练题目：未攻克优先，错得多的优先，最多 10 题 */
export function pickReviewQuestions(profile: Profile, limit = 10): Question[] {
  const entries = [...(profile.wrongBook ?? [])]
    .filter((e) => !e.mastered)
    .sort((a, b) => b.wrongCount - a.wrongCount || b.lastWrongAt - a.lastWrongAt)
    .slice(0, limit)
  return entries.map((e) => e.q)
}
