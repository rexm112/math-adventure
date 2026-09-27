import { describe, expect, it } from 'vitest'
import { ALL_TOPICS } from './index'
import { makeRng } from '../lib/rng'
import { checkAnswer } from '../lib/checker'
import type { Difficulty, FigureSpec, Question } from '../types'
import { isReduced } from '../lib/math'

const FIGURE_KINDS: FigureSpec['kind'][] = [
  'counting', 'tenFrame', 'numberline', 'array', 'clock', 'money', 'shapeRow', 'ruler', 'angle', 'polygon',
  'gridRect', 'fracBar', 'fracPie', 'barModel', 'barChart', 'pieChart', 'box3d', 'cylinder', 'cone',
  'circleFig', 'balance', 'cubeStack', 'rods', 'percentGrid',
]

function validateQuestion(q: Question, t: (typeof ALL_TOPICS)[number], d: Difficulty) {
  // topicId/topicName 由组卷时以注册表为准覆盖，这里只验证内容本身
  expect(q.grade).toBe(t.grade)
  expect(q.difficulty).toBe(d)
  expect(q.prompt.trim().length).toBeGreaterThan(3)
  // 渐进提示：3-5 条，永远不少于 3 条
  expect(q.hints.length).toBeGreaterThanOrEqual(3)
  expect(q.hints.length).toBeLessThanOrEqual(5)
  for (const h of q.hints) {
    expect(h.trim().length).toBeGreaterThan(4)
    expect(h).not.toMatch(/答案是\s*\d/)
  }
  // 答案合法性
  switch (q.answerType) {
    case 'number':
      expect(Number.isFinite(q.answer as number)).toBe(true)
      expect(Number.isNaN(q.answer as number)).toBe(false)
      break
    case 'choice': {
      expect(q.choices?.length).toBeGreaterThanOrEqual(2)
      const uniq = new Set(q.choices)
      expect(uniq.size).toBe(q.choices!.length)
      expect(q.answer as number).toBeGreaterThanOrEqual(0)
      expect(q.answer as number).toBeLessThan(q.choices!.length)
      break
    }
    case 'fraction': {
      const f = q.answer as { n: number; d: number }
      expect(Number.isInteger(f.n)).toBe(true)
      expect(Number.isInteger(f.d)).toBe(true)
      expect(f.d).toBeGreaterThan(0)
      if (q.requireReduced) expect(isReduced(f)).toBe(true)
      // 分数题标准答案应能用分数输入答对
      expect(checkAnswer(q, f)).toBe(true)
      break
    }
    case 'ratio': {
      const r = q.answer as { a: number; b: number }
      expect(r.a).toBeGreaterThan(0)
      expect(r.b).toBeGreaterThan(0)
      expect(checkAnswer(q, r)).toBe(true)
      break
    }
    case 'compare':
      expect(['>', '<', '=']).toContain(q.answer)
      break
  }
  // 图形合法
  if (q.figure) expect(FIGURE_KINDS).toContain(q.figure.kind)
  // id 唯一
  expect(q.id.length).toBeGreaterThan(4)
}

describe('全部题目生成器', () => {
  const ITER = 150

  for (const t of ALL_TOPICS) {
    it(`${t.id}（${t.name}）结构校验 ×${ITER}`, () => {
      const rng = makeRng(20260927)
      for (const d of t.difficulties) {
        for (let i = 0; i < ITER; i++) {
          const q = t.gen(d, rng)
          validateQuestion(q, t, d)
        }
      }
    })
  }

  it('生成器总数覆盖 1-6 年级', () => {
    for (let g = 1; g <= 6; g++) {
      const topics = ALL_TOPICS.filter((t) => t.grade === g)
      expect(topics.length).toBeGreaterThanOrEqual(8)
      expect(topics.some((t) => t.difficulties.includes('challenge'))).toBe(true)
      expect(topics.some((t) => t.difficulties.includes('easy'))).toBe(true)
    }
    // 三年级起有应用题主题（四年级应用题集中在鸡兔同笼主题，至少 1 个）
    for (let g = 3; g <= 6; g++) {
      const word = ALL_TOPICS.filter((t) => t.grade === g && t.kind === 'word')
      expect(word.length).toBeGreaterThanOrEqual(1)
    }
  })
})
