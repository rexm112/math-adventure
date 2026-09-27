import type { Frac } from '../types'

export function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) [a, b] = [b, a % b]
  return a || 1
}

export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b)
}

export function reduceFrac(n: number, d: number): Frac {
  if (d < 0) {
    n = -n
    d = -d
  }
  const g = gcd(n, d)
  return { n: n / g, d: d / g }
}

/** 数字转字符串：去掉浮点尾差（如 0.30000000000000004 → 0.3） */
export function fmt(n: number): string {
  if (!isFinite(n)) return String(n)
  const r = Math.round(n * 1e9) / 1e9
  if (Number.isInteger(r)) return String(r)
  return String(r)
}

export function fracEqual(a: Frac, b: Frac): boolean {
  return a.n * b.d === b.n * a.d
}

export function isReduced(f: Frac): boolean {
  return gcd(Math.abs(f.n), f.d) === 1
}

/** 分数转显示字符串 */
export function fracStr(f: Frac): string {
  return f.d === 1 ? `${f.n}` : `${f.n}/${f.d}`
}

/** 求一个数在 1..n 中的所有因数 */
export function divisorsOf(n: number): number[] {
  const out: number[] = []
  for (let i = 1; i <= n; i++) if (n % i === 0) out.push(i)
  return out
}

export function isPrime(n: number): boolean {
  if (n < 2) return false
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false
  return true
}

/** 组合数 C(n,2) 等，用于鸡兔同笼等选项 */
export function round1(n: number): number {
  return Math.round(n * 10) / 10
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100
}
