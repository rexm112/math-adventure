import type { Rng } from '../types'

/** mulberry32 —— 轻量可复现的伪随机数生成器 */
export function makeRng(seed?: number): Rng {
  let a = (seed ?? (Math.random() * 0xffffffff)) >>> 0
  const next = () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1))
  return {
    int,
    float: (min, max) => min + next() * (max - min),
    pick: <T,>(arr: readonly T[]) => arr[int(0, arr.length - 1)],
    shuffle: <T,>(arr: readonly T[]) => {
      const out = [...arr]
      for (let i = out.length - 1; i > 0; i--) {
        const j = int(0, i)
        ;[out[i], out[j]] = [out[j], out[i]]
      }
      return out
    },
    bool: (p = 0.5) => next() < p,
  }
}
