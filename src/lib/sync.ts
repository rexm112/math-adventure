// ---------- 云同步（GitHub 私密 Gist 作为家庭数据云） ----------
// 家长在设置里粘贴一个仅有 gist 读写的 Fine-grained Token 即可：
// 数据以 JSON 文件存放在 secret gist 中，任何设备登录同一 token 即可同步。
// 说明：api.github.com 在国内直连偶尔较慢，失败会静默跳过，下次再试。

import type { Profile } from '../store'

const GIST_FILE = 'math-adventure.json'
const API = 'https://api.github.com'

export interface SyncPayload {
  v: 1
  savedAt: number
  profiles: Profile[]
}

function headers(token: string) {
  return { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' }
}

export async function createSyncGist(token: string, profiles: Profile[]): Promise<string> {
  const payload: SyncPayload = { v: 1, savedAt: Date.now(), profiles }
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

export async function pushSync(token: string, gistId: string, profiles: Profile[]): Promise<void> {
  const payload: SyncPayload = { v: 1, savedAt: Date.now(), profiles }
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
  if (!content) throw new Error('云端数据为空')
  return JSON.parse(content) as SyncPayload
}

/**
 * 按 profile 合并：同 id 取 updatedAt 新的；云端独有的档案直接带入。
 * 这样两台设备各练各的也不会互相覆盖。
 */
export function mergeProfiles(local: Profile[], remote: Profile[]): Profile[] {
  const map = new Map<string, Profile>()
  for (const p of local) map.set(p.id, p)
  for (const r of remote) {
    const l = map.get(r.id)
    if (!l || (r.updatedAt ?? 0) > (l.updatedAt ?? 0)) map.set(r.id, r)
  }
  return [...map.values()]
}
