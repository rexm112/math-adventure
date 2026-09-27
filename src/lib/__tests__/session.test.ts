import { describe, expect, it } from 'vitest'
import { buildSession, MODE_PLANS, SESSION_SIZE } from '../session'
import type { Grade } from '../../types'

function countOf(plan: string[]) {
  const count = { easy: 0, medium: 0, hard: 0, challenge: 0 } as Record<string, number>
  plan.forEach((d) => count[d]++)
  return count
}

describe('组卷规则', () => {
  it('标准档：10 题 = 3易+2中+4难+1拓展', () => {
    expect(SESSION_SIZE).toBe(10)
    const c = countOf(MODE_PLANS.standard)
    expect(c.easy).toBe(3)
    expect(c.medium).toBe(2)
    expect(c.hard).toBe(4)
    expect(c.challenge).toBe(1)
  })

  it('进阶档与挑战档的结构', () => {
    const a = countOf(MODE_PLANS.advanced)
    expect([a.easy, a.medium, a.hard, a.challenge]).toEqual([1, 2, 5, 2])
    const c = countOf(MODE_PLANS.challenge)
    expect([c.easy, c.medium, c.hard, c.challenge]).toEqual([0, 2, 5, 3])
  })

  for (let g = 1; g <= 6; g++) {
    it(`${g} 年级：标准档组卷 60 次符合难度配比与应用题要求`, () => {
      for (let s = 0; s < 60; s++) {
        const qs = buildSession({ grade: g as Grade, seed: s * 1000 + g })
        expect(qs.length).toBe(10)
        const diff = qs.map((q) => q.difficulty)
        const easy = diff.filter((d) => d === 'easy').length
        const med = diff.filter((d) => d === 'medium').length
        const hard = diff.filter((d) => d === 'hard').length
        const chal = diff.filter((d) => d === 'challenge').length
        expect(easy).toBe(3)
        expect(med).toBe(2)
        expect(hard).toBe(4)
        expect(chal).toBe(1)
        expect(new Set(qs.map((q) => q.id)).size).toBe(10)
        const words = qs.filter((q) => q.kind === 'word').length
        if (g >= 3) expect(words).toBeGreaterThanOrEqual(2)
        else expect(words).toBeGreaterThanOrEqual(1)
        expect(new Set(qs.map((q) => q.prompt)).size).toBe(10)
      }
    })
  }

  for (let g = 1; g <= 6; g++) {
    for (const mode of ['advanced', 'challenge'] as const) {
      it(`${g} 年级：${mode} 档组卷 40 次结构正确`, () => {
        for (let s = 0; s < 40; s++) {
          const qs = buildSession({ grade: g as Grade, mode, seed: s * 77 + g })
          const got = countOf(qs.map((q) => q.difficulty))
          const want = countOf(MODE_PLANS[mode])
          // 专项池缺少某难度时允许就近替代，但整体不应偏差超过 2 题
          for (const k of ['easy', 'medium', 'hard', 'challenge']) {
            expect(Math.abs(got[k] - want[k])).toBeLessThanOrEqual(2)
          }
          expect(new Set(qs.map((q) => q.prompt)).size).toBe(10)
        }
      })
    }
  }

  it('专项练习：仅出所选主题的题', () => {
    for (let s = 0; s < 10; s++) {
      const qs = buildSession({ grade: 3, topicId: 'g3-perimeter', seed: s })
      expect(qs.every((q) => q.topicId === 'g3-perimeter')).toBe(true)
    }
  })
})
