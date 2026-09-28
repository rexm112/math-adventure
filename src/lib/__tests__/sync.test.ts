import { describe, expect, it } from 'vitest'
import { mergeSync, fromLegacyPayload, type SyncState } from '../sync'
import type { Profile } from '../../store'

let seq = 0
function prof(id: string, updatedAt: number, name = id): Profile {
  seq++
  return {
    id,
    name,
    avatar: '🐰',
    grade: 1,
    createdAt: 1000,
    updatedAt,
    badges: [],
    stats: {
      totalPoints: seq,
      totalQuestions: 0,
      firstTryCorrect: 0,
      challengeFirstTry: 0,
      stars3: 0,
      sessions: 0,
      streakBest: 0,
      dates: [],
      byTopic: {},
      recent: [],
    },
    wrongBook: [],
  }
}

const state = (profiles: Profile[], deleted: Record<string, number> = {}): SyncState => ({ profiles, deleted })

describe('mergeSync 数据一致性', () => {
  it('不同档案：并集合并，互不丢弃', () => {
    const m = mergeSync(state([prof('a', 10)]), state([prof('b', 20)]))
    expect(m.profiles.map((p) => p.id).sort()).toEqual(['a', 'b'])
  })

  it('同一档案：updatedAt 新者胜（双向对称）', () => {
    const local = prof('a', 200)
    const remote = { ...prof('a', 100), name: '旧名' }
    expect(mergeSync(state([local]), state([remote])).profiles[0].name).toBe('a')
    // 反方向
    expect(mergeSync(state([remote]), state([local])).profiles[0].name).toBe('a')
  })

  it('删除传播：墓碑时间晚于档案修改时间 → 档案被删掉', () => {
    const m = mergeSync(state([prof('a', 100)]), state([], { a: 200 }))
    expect(m.profiles).toEqual([])
    expect(m.deleted['a']).toBe(200)
  })

  it('删除后又在别处修改 → 修改胜出，档案保留（防误删数据）', () => {
    const edited = prof('a', 300) // 删除（200）之后又被改过
    const m = mergeSync(state([edited]), state([], { a: 200 }))
    expect(m.profiles.map((p) => p.id)).toEqual(['a'])
  })

  it('旧副本不会复活已删除档案', () => {
    // 本机还是删除前的旧副本，云端已删除
    const stale = prof('a', 100)
    const m = mergeSync(state([stale]), state([], { a: 200 }))
    expect(m.profiles).toEqual([])
  })

  it('墓碑并集取较大时间', () => {
    const m = mergeSync(state([], { a: 100, b: 500 }), state([], { a: 300 }))
    expect(m.deleted['a']).toBe(300)
    expect(m.deleted['b']).toBe(500)
  })

  it('两端同时推同一档案不同数据：新 updatedAt 保留，旧数据不覆盖新数据', () => {
    // 设备 A 本机是 100 分旧档，设备 B 已把档案练到 200 分并上传
    const localStale = prof('kid', 1000)
    const remoteNew = prof('kid', 2000)
    const m = mergeSync(state([localStale]), state([remoteNew]))
    expect(m.profiles[0].stats.totalPoints).toBe(remoteNew.stats.totalPoints)
  })

  it('fromLegacyPayload：v1 旧数据（无墓碑字段）兼容', () => {
    const s = fromLegacyPayload({ profiles: [prof('a', 1)] })
    expect(s.profiles.length).toBe(1)
    expect(s.deleted).toEqual({})
    expect(fromLegacyPayload({}).profiles).toEqual([])
  })
})
