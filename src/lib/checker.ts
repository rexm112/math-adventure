import type { Frac, Question, Ratio, UserInput } from '../types'
import { fracEqual, isReduced } from './math'

const EPS = 1e-9

function numEq(a: number, b: number): boolean {
  return Math.abs(a - b) < EPS
}

function isFrac(x: unknown): x is Frac {
  return typeof x === 'object' && x !== null && 'n' in x && 'd' in x
}

function isRatio(x: unknown): x is Ratio {
  return typeof x === 'object' && x !== null && 'a' in x && 'b' in x
}

/**
 * 判断用户输入是否正确。
 * - number：数值相等（小数按值比较，忽略末尾 0）
 * - fraction：值相等；若题目要求最简，还必须是最简形式
 * - choice：选项下标
 * - compare：'>' | '<' | '='
 * - ratio：比值相等且为最简整数比
 */
export function checkAnswer(q: Question, input: UserInput): boolean {
  const ans = q.answer
  switch (q.answerType) {
    case 'number': {
      if (typeof input !== 'number' || typeof ans !== 'number') return false
      return numEq(input, ans)
    }
    case 'choice': {
      if (typeof input !== 'number' || typeof ans !== 'number') return false
      return input === ans
    }
    case 'compare': {
      return typeof input === 'string' && typeof ans === 'string' && input === ans
    }
    case 'fraction': {
      if (!isFrac(input) || !isFrac(ans)) return false
      if (!Number.isInteger(input.n) || !Number.isInteger(input.d) || input.d <= 0) return false
      if (!fracEqual(input, ans)) return false
      if (q.requireReduced && !isReduced(input)) return false
      return true
    }
    case 'ratio': {
      if (!isRatio(input) || !isRatio(ans)) return false
      const r = input
      if (!Number.isInteger(r.a) || !Number.isInteger(r.b) || r.a <= 0 || r.b <= 0) return false
      const ra = ans
      if (r.a * ra.b !== ra.a * r.b) return false
      const g = (x: number, y: number): number => (y ? g(y, x % y) : x)
      return g(r.a, r.b) === 1
    }
    default:
      return false
  }
}

/** 输入是否为空（用于禁用提交按钮） */
export function isEmptyInput(q: Question, input: UserInput | null): boolean {
  if (input === null) return true
  switch (q.answerType) {
    case 'number':
    case 'choice':
      return typeof input !== 'number'
    case 'fraction':
      return !isFrac(input)
    case 'ratio':
      return !isRatio(input)
    default:
      return typeof input !== 'string'
  }
}
