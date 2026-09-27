import { describe, expect, it } from 'vitest'
import { buildSession, DIFF_PLAN, SESSION_SIZE } from '../session'
import type { Grade } from '../../types'

describe('组卷规则', () => {
  it('固定结构：10 题 = 5 简单/中等 + 4 困难 + 1 拓展', () => {
    expect(SESSION_SIZE).toBe(10)
    const count = { easy: 0, medium: 0, hard: 0, challenge: 0 } as Record<string, number>
    DIFF_PLAN.forEach((d) => count[d]++)
    expect(count.easy + count.medium).toBe(5)
    expect(count.hard).toBe(4)
    expect(count.challenge).toBe(1)
  })

  for (let g = 1; g <= 6; g++) {
    it(`${g} 年级：组卷 60 次均符合难度配比与应用题要求`, () => {
      for (let s = 0; s < 60; s++) {
        const qs = buildSession({ grade: g as Grade, seed: s * 1000 + g })
        expect(qs.length).toBe(10)
        const diff = qs.map((q) => q.difficulty)
        const easyMed = diff.filter((d) => d === 'easy' || d === 'medium').length
        const hard = diff.filter((d) => d === 'hard').length
        const chal = diff.filter((d) => d === 'challenge').length
        expect(easyMed).toBe(5)
        expect(hard).toBe(4)
        expect(chal).toBe(1)
        expect(new Set(qs.map((q) => q.id)).size).toBe(10)
        if (g >= 3) {
          const words = qs.filter((q) => q.kind === 'word').length
          expect(words).toBeGreaterThanOrEqual(2)
        } else {
          const words = qs.filter((q) => q.kind === 'word').length
          expect(words).toBeGreaterThanOrEqual(1)
        }
        // 题干不重复
        expect(new Set(qs.map((q) => q.prompt)).size).toBe(10)
      }
    })
  }

  it('专项练习：仅出所选主题的题', () => {
    for (let s = 0; s < 10; s++) {
      const qs = buildSession({ grade: 3, topicId: 'g3-perimeter', seed: s })
      expect(qs.every((q) => q.topicId === 'g3-perimeter')).toBe(true)
    }
  })
})
