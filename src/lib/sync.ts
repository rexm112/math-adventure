// ---------- 云同步（GitHub 私密 Gist 作为家庭数据云） ----------
// 一致性设计（家庭多设备场景）：
// 1. 合并永远是"并集 + 按档案 updatedAt 取新"：不会因为某台设备没见过某档案而丢掉它
// 2. 推送前强制先拉取合并（读-改-写），推送后再校验、被覆盖则重推一次：
//    两台设备即使同时打开/同时保存，数据也只在 ~1 秒的窗口内可能互踩，且下次打开自动补齐
// 3. 删除使用墓碑（tombstone）：删除时间 > 档案最后修改时间才生效，
//    删除会同步到所有设备且不会被旧副本复活；删除之后又在别处修改过的档案以修改为准
// 4. 所有推送在本机串行排队，避免同设备内并发推送互相覆盖

import type { Profile } from '../store'

const GIST_FILE = 'math-adventure.json'
const API = 'https://api.github.com'

export interface SyncPayload {
  v: 2
  savedAt: number
  profiles: Profile[]
  /** 已删除档案的墓碑：档案 id → 删除时间戳 */
  deleted?: Record<string, number>
}

export interface SyncState {
  profiles: Profile[]
  deleted: Record<string, number>
}

function headers(token: string) {
  return { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' }
}

export async function findSyncGist(token: string): Promise<string | null> {
  const res = await fetch(`${API}/gists?per_page=100`, { headers: headers(token) })
  if (!res.ok) throw new Error(`无法读取 Gist 列表（${res.status}）：请检查 token 是否包含 gist 读写权限`)
  const list = (await res.json()) as { id: string; description?: string }[]
  const hit = list.find((g) => g.description?.includes('数学大冒险'))
  return hit?.id ?? null
}

export async function createSyncGist(token: string, state: SyncState): Promise<string> {
  const payload: SyncPayload = { v: 2, savedAt: Date.now(), ...state }
  const res = await fetch(`${API}/gists`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({
      description: '数学大冒险 · 家庭数据同步（secret）',
      public: false,
      files: { [GIST_FILE]: { content: JSON.stringify(payload) } },
    }),
  })
  if (!res.ok) throw new Error(`创建失败（${res.status}）：请检查 token 是否包含 gist 读写权限`)
  const data = (await res.json()) as { id: string }
  return data.id
}

export async function pushSync(token: string, gistId: string, state: SyncState): Promise<void> {
  const payload: SyncPayload = { v: 2, savedAt: Date.now(), ...state }
  const res = await fetch(`${API}/gists/${gistId}`, {
    method: 'PATCH',
    headers: headers(token),
    body: JSON.stringify({ files: { [GIST_FILE]: { content: JSON.stringify(payload) } } }),
  })
  if (!res.ok) throw new Error(`上传失败（${res.status}）`)
}

export async function pullSync(token: string, gistId: string): Promise<SyncPayload> {
  const res = await fetch(`${API}/gists/${gistId}`, { headers: headers(token) })
  if (!res.ok) throw new Error(`下载失败（${res.status}）`)
  const data = (await res.json()) as { files?: Record<string, { content?: string }> }
  const content = data.files?.[GIST_FILE]?.content
  if (!content) return { v: 2, savedAt: 0, profiles: [], deleted: {} }
  const parsed = JSON.parse(content) as Partial<SyncPayload>
  return { v: 2, savedAt: parsed.savedAt ?? 0, profiles: parsed.profiles ?? [], deleted: parsed.deleted ?? {} }
}

/**
 * 合并本地与云端状态（纯函数，两端对称）：
 * - 档案按 id 并集；同 id 取 updatedAt 较新者
 * - 墓碑按 id 并集、时间取较大者
 * - 删除时间晚于档案 updatedAt 的档案被移除（删除传播且不复活）
 * - 删除之后又在别处被修改过的档案（updatedAt 晚于墓碑）保留
 */
export function mergeSync(local: SyncState, remote: SyncState): SyncState {
  const deleted: Record<string, number> = { ...remote.deleted }
  for (const [id, t] of Object.entries(local.deleted)) {
    deleted[id] = Math.max(deleted[id] ?? 0, t)
  }
  const map = new Map<string, Profile>()
  for (const p of local.profiles) map.set(p.id, p)
  for (const r of remote.profiles) {
    const l = map.get(r.id)
    const rt = r.updatedAt ?? r.createdAt
    if (!l || rt > (l.updatedAt ?? l.createdAt)) map.set(r.id, r)
  }
  const profiles = [...map.values()].filter((p) => {
    const t = deleted[p.id]
    return t === undefined || t < (p.updatedAt ?? p.createdAt)
  })
  return { profiles, deleted }
}

/** 旧版本载荷兼容（v1 只有 profiles） */
export function fromLegacyPayload(payload: Partial<SyncPayload> & { profiles?: Profile[] }): SyncState {
  return { profiles: payload.profiles ?? [], deleted: payload.deleted ?? {} }
}
