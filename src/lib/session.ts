import { ALL_TOPICS } from '../generators'
import type { Difficulty, DifficultyMode, Grade, QuestionKind, Rng, SessionQuestion, TopicDef } from '../types'
import { makeRng } from './rng'

export const SESSION_SIZE = 10

/**
 * 难度档位组卷方案（每局固定 10 题）：
 * - 标准：3易+2中+4难+1拓展（默认，适合低年级/起步）
 * - 进阶：1易+2中+5难+2拓展
 * - 挑战：2中+5难+3拓展（哥哥模式）
 */
export const MODE_PLANS: Record<DifficultyMode, Difficulty[]> = {
  standard: ['easy', 'easy', 'easy', 'medium', 'medium', 'hard', 'hard', 'hard', 'hard', 'challenge'],
  advanced: ['easy', 'medium', 'medium', 'hard', 'hard', 'hard', 'hard', 'hard', 'challenge', 'challenge'],
  challenge: ['medium', 'medium', 'hard', 'hard', 'hard', 'hard', 'hard', 'challenge', 'challenge', 'challenge'],
}

export interface BuildOptions {
  grade: Grade
  /** 指定专项 topicId；缺省为综合练习 */
  topicId?: string
  /** 难度档位，默认标准 */
  mode?: DifficultyMode
  seed?: number
}

/** 从年级 + 范围中挑选可用主题（含难度过滤回退） */
function poolFor(grade: Grade, topicId?: string): TopicDef[] {
  let pool = ALL_TOPICS.filter((t) => t.grade === grade)
  if (topicId) {
    const one = pool.filter((t) => t.id === topicId)
    if (one.length) pool = one
  }
  return pool
}

function pickGen(pool: TopicDef[], diff: Difficulty, kind: QuestionKind | null, excludeIds: string[], rng: Rng): TopicDef | null {
  const hasDiff = (t: TopicDef) => t.difficulties.includes(diff)
  const byKind = (list: TopicDef[]) => (kind ? list.filter((t) => t.kind === kind) : list)
  // 优先级：难度+题型 > 题型（就近难度）> 难度（不限题型）> 任意
  let cands = byKind(pool.filter(hasDiff))
  if (!cands.length) cands = byKind(pool)
  if (!cands.length) cands = pool.filter(hasDiff)
  if (!cands.length) cands = pool
  const fresh = cands.filter((t) => !excludeIds.includes(t.id))
  if (fresh.length) return rng.pick(fresh)
  return rng.pick(cands)
}

const ORDER: Difficulty[] = ['easy', 'medium', 'hard', 'challenge']

function nearestDiff(diffs: Difficulty[], target: Difficulty): Difficulty {
  const ti = ORDER.indexOf(target)
  return diffs.reduce((best, cur) => (Math.abs(ORDER.indexOf(cur) - ti) < Math.abs(ORDER.indexOf(best) - ti) ? cur : best), diffs[0])
}

/**
 * 组一局 10 题：
 * - 3 年级及以上保证至少 2 道应用题；1-2 年级至少 1 道情景应用
 * - 相邻题尽量不同主题；同局内避免完全重复题干
 */
export function buildSession(opts: BuildOptions): SessionQuestion[] {
  const rng = makeRng(opts.seed)
  const pool = poolFor(opts.grade, opts.topicId)
  if (!pool.length) throw new Error(`no topics for grade ${opts.grade}`)

  // 难度按档位出，题目顺序打乱（简单题不至于全挤在前面）
  const plan = rng.shuffle(MODE_PLANS[opts.mode ?? 'standard'])

  const needWord = opts.grade >= 3 ? 2 : 1
  const wordTopics = pool.filter((t) => t.kind === 'word')
  const wordSlots: number[] = []
  if (wordTopics.length) {
    // 有中等难度应用题：1 中等 + 1 困难；否则两道都从困难槽出（不打乱难度配比）
    const candSlots = plan.map((d, i) => ({ d, i })).filter((x) => x.d !== 'challenge')
    const mediums = candSlots.filter((x) => x.d === 'medium')
    const hards = rng.shuffle(candSlots.filter((x) => x.d === 'hard'))
    const hasMediumWord = wordTopics.some((t) => t.difficulties.includes('medium'))
    if (hasMediumWord && mediums.length) wordSlots.push(rng.pick(mediums).i)
    while (wordSlots.length < needWord && hards.length) {
      const next = hards.find((x) => !wordSlots.includes(x.i))
      if (!next) break
      wordSlots.push(next.i)
    }
    if (wordSlots.length < needWord && hasMediumWord) {
      const m = mediums.find((x) => !wordSlots.includes(x.i))
      if (m) wordSlots.push(m.i)
    }
  }

  const questions: SessionQuestion[] = []
  const prompts = new Set<string>()
  let lastTopic = ''
  for (let i = 0; i < SESSION_SIZE; i++) {
    const diff = plan[i]
    const wantWord = wordSlots.includes(i)
    let q: import('../types').Question | null = null
    for (let tries = 0; tries < 24 && !q; tries++) {
      const exclude = tries < 8 ? [lastTopic] : []
      const gen = pickGen(pool, diff, wantWord ? 'word' : null, exclude, rng)
      if (!gen) break
      let cand: import('../types').Question | null = null
      for (let k = 0; k < 8; k++) {
        const actualDiff = gen.difficulties.includes(diff) ? diff : nearestDiff(gen.difficulties, diff)
        const c = gen.gen(actualDiff, rng)
        if (!prompts.has(c.prompt)) {
          cand = c
          break
        }
      }
      if (cand) {
        q = cand
        lastTopic = gen.id
      }
    }
    if (!q) {
      // 极端回退：任意可用生成器 + 就近难度
      const gen = pickGen(pool, diff, null, [], rng) ?? pool[0]
      const fallbackDiff = gen.difficulties.includes(diff) ? diff : nearestDiff(gen.difficulties, diff)
      q = gen.gen(fallbackDiff, rng)
      lastTopic = gen.id
    }
    // 主题信息（id/名称/题型）以注册表为准
    const topic = pool.find((t) => t.id === lastTopic)
    q.topicId = topic?.id ?? pool[0].id
    q.topicName = topic?.name ?? pool[0].name
    q.kind = topic?.kind ?? pool[0].kind
    prompts.add(q.prompt)
    questions.push({ ...q, no: i + 1 })
  }
  return questions
}
