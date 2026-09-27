import { describe, expect, it } from 'vitest'
import { BASE_POINTS, levelOf, pointsFor, streakBonus } from '../scoring'

describe('放缓后的积分体系', () => {
  it('基础分：易5 中10 难15 拓展30', () => {
    expect(BASE_POINTS).toEqual({ easy: 5, medium: 10, hard: 15, challenge: 30 })
  })

  it('星级折算与拓展加成', () => {
    expect(pointsFor('hard', 3)).toBe(15)
    expect(pointsFor('hard', 2)).toBe(11) // 15×0.7 四舍五入
    expect(pointsFor('hard', 1)).toBe(6) // 15×0.4 四舍五入
    expect(pointsFor('challenge', 3)).toBe(40) // 30 + 10
    expect(pointsFor('easy', 3, 0.5)).toBe(3) // 错题重练减半
  })

  it('连对奖励每 3 题一次，每次 5 分', () => {
    expect(streakBonus(1)).toBe(0)
    expect(streakBonus(2)).toBe(0)
    expect(streakBonus(3)).toBe(5)
    expect(streakBonus(6)).toBe(5)
    expect(streakBonus(7)).toBe(0)
  })

  it('等级跨度足够长（一局全三星约 100 分，需要长期积累）', () => {
    expect(levelOf(0).level).toBe(1)
    expect(levelOf(140).level).toBe(1)
    expect(levelOf(150).level).toBe(2)
    expect(levelOf(5999).level).toBe(6)
    expect(levelOf(6000).level).toBe(7)
    // 标准档理论满分一局 ≈ (5~10)×5 + 15×4 + 40 ≈ 135，最多只升一级出头
    expect(levelOf(135).level).toBeLessThanOrEqual(2)
  })
})
