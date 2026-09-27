import type { Answer, AnswerType, Difficulty, FigureSpec, Grade, Question, QuestionKind, Rng } from '../types'

let seq = 0
export function nextId(topicId: string): string {
  return `${topicId}-${Date.now().toString(36)}-${++seq}`
}

export interface QInput {
  prompt: string
  answer: Answer
  hints: string[]
  concept: string
  figure?: FigureSpec
  choices?: string[]
  unit?: string
  requireReduced?: boolean
}

function inferType(answer: Answer, choices?: string[]): AnswerType {
  if (choices) return 'choice'
  if (typeof answer === 'number') return 'number'
  if (typeof answer === 'string') return 'compare'
  if ('a' in answer) return 'ratio'
  return 'fraction'
}

export function makeQ(
  meta: { id: string; name: string; grade: Grade; kind: QuestionKind },
  d: Difficulty,
  input: QInput,
): Question {
  const { prompt, answer, hints, concept, figure, choices, unit, requireReduced } = input
  return {
    id: nextId(meta.id),
    topicId: meta.id,
    topicName: meta.name,
    grade: meta.grade,
    difficulty: d,
    kind: meta.kind,
    answerType: inferType(answer, choices),
    prompt,
    figure,
    choices,
    answer,
    unit,
    hints,
    concept,
    requireReduced,
    allowDecimal: typeof answer === 'number' && !Number.isInteger(answer),
    allowNegative: typeof answer === 'number' && answer < 0,
  }
}

/** 生成选择题：正确项 + 干扰项，去重后打乱 */
export function choicesOf(rng: Rng, correct: string, wrongs: string[]): { choices: string[]; answer: number } {
  const uniq: string[] = []
  for (const w of wrongs) if (w !== correct && !uniq.includes(w)) uniq.push(w)
  const all = rng.shuffle([correct, ...uniq])
  return { choices: all, answer: all.indexOf(correct) }
}

export function numChoices(rng: Rng, correct: number, wrongs: number[]) {
  return choicesOf(rng, String(correct), wrongs.map(String))
}

// ---------- 渐进式提示脚手架 ----------
// 设计原则：概念 → 条件梳理 → 思路 → 列式 → 首步结果，最后一步永远留给学生完成

export interface HintSteps {
  concept: string
  knowns?: string[]
  ask?: string
  method: string
  setup: string
  /** 首步中间结果（不含最终答案） */
  first?: string
}

export function solveHints(s: HintSteps): string[] {
  const hs: string[] = [`想一想：这道题考的是「${s.concept}」。先把题目中的数字和问题圈出来。`]
  if (s.knowns?.length) hs.push(`梳理条件：${s.knowns.join('；')}。要求的是：${s.ask}。`)
  hs.push(`思路：${s.method}`)
  hs.push(`试着这样做：${s.setup}`)
  if (s.first) hs.push(`${s.first}。最后一步留给你自己算！`)
  return hs
}

export function calcHints(concept: string, method: string, setup: string, first?: string): string[] {
  return solveHints({ concept, method, setup, first })
}

// ---------- 中文数字 / 乘法口诀 ----------
const CN = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']

export function cnNum(n: number): string {
  if (n < 10) return CN[n]
  if (n === 10) return '十'
  if (n < 20) return '十' + CN[n % 10]
  const t = Math.floor(n / 10)
  const o = n % 10
  return CN[t] + '十' + (o ? CN[o] : '')
}

/** 3×4 → "三四十二"（乘法口诀） */
export function koujue(a: number, b: number): string {
  const p = a * b
  const prod = p < 10 ? '得' + CN[p] : cnNum(p)
  return `${CN[a]}${CN[b]}${prod}`
}

// ---------- 常用素材 ----------
export const ITEM_POOL = [
  { e: '🍎', name: '苹果' },
  { e: '⭐', name: '星星' },
  { e: '🐟', name: '小鱼' },
  { e: '🌻', name: '小花' },
  { e: '⚽', name: '皮球' },
  { e: '🍬', name: '糖果' },
  { e: '🎈', name: '气球' },
  { e: '🧸', name: '玩偶' },
]

export const NAMES = ['小明', '小红', '小华', '小丽', '小刚', '乐乐', '芳芳', '丁丁']

/** 平年闰年 2 月天数 */
export function febDays(year: number): number {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28
}
