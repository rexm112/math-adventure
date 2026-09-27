import { describe, expect, it } from 'vitest'
import { checkAnswer, isEmptyInput } from '../checker'
import type { Question } from '../../types'

function nq(answer: number, extra: Partial<Question> = {}): Question {
  return {
    id: 't',
    topicId: 't',
    topicName: 't',
    grade: 1,
    difficulty: 'easy',
    kind: 'calc',
    answerType: 'number',
    prompt: '',
    answer,
    hints: [],
    concept: '',
    ...extra,
  }
}

describe('checkAnswer', () => {
  it('数值题：整数与小数按值比较', () => {
    const q = nq(3.5)
    expect(checkAnswer(q, 3.5)).toBe(true)
    expect(checkAnswer(q, 3.50)).toBe(true)
    expect(checkAnswer(q, 3.4)).toBe(false)
    expect(checkAnswer(q, '3.5' as never)).toBe(false)
  })

  it('负数题', () => {
    expect(checkAnswer(nq(-4), -4)).toBe(true)
    expect(checkAnswer(nq(-4), 4)).toBe(false)
  })

  it('选择题：按下标比较', () => {
    const q = nq(2, { answerType: 'choice', choices: ['a', 'b', 'c'] })
    expect(checkAnswer(q, 2)).toBe(true)
    expect(checkAnswer(q, 0)).toBe(false)
  })

  it('比大小题', () => {
    const q = nq(0, { answerType: 'compare', answer: '>' })
    expect(checkAnswer(q, '>')).toBe(true)
    expect(checkAnswer(q, '<')).toBe(false)
  })

  it('分数题：等值判对；要求最简时未约判错', () => {
    const q = nq(0, { answerType: 'fraction', answer: { n: 1, d: 2 } })
    expect(checkAnswer(q, { n: 1, d: 2 })).toBe(true)
    expect(checkAnswer(q, { n: 2, d: 4 })).toBe(true)
    const q2 = nq(0, { answerType: 'fraction', answer: { n: 1, d: 2 }, requireReduced: true })
    expect(checkAnswer(q2, { n: 2, d: 4 })).toBe(false)
    expect(checkAnswer(q2, { n: 1, d: 2 })).toBe(true)
    expect(checkAnswer(q, { n: 1, d: 0 })).toBe(false)
  })

  it('比题：值相等且最简', () => {
    const q = nq(0, { answerType: 'ratio', answer: { a: 2, b: 3 } })
    expect(checkAnswer(q, { a: 2, b: 3 })).toBe(true)
    expect(checkAnswer(q, { a: 4, b: 6 })).toBe(false) // 未化简
    expect(checkAnswer(q, { a: 2, b: 5 })).toBe(false)
  })

  it('isEmptyInput', () => {
    const q = nq(1)
    expect(isEmptyInput(q, null)).toBe(true)
    expect(isEmptyInput(q, 1)).toBe(false)
  })
})
