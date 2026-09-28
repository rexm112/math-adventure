// ---------- 项目级配置（构建时注入） ----------
// 通过 GitHub 仓库 Secrets（AI_KEY / AI_ENDPOINT / AI_MODEL / SYNC_TOKEN）在 CI 构建时注入，
// 或本地开发时写在 .env.local（已被 gitignore）。所有设备打开 App 即获得同一份配置，
// 单台设备的"设置面板"里手动填写的内容优先级更高（可按设备覆盖）。

export interface AIConfig {
  key?: string
  endpoint?: string
  model?: string
}

const env = (import.meta.env ?? {}) as Record<string, string | undefined>

export const envConfig = {
  aiKey: env.VITE_AI_KEY || undefined,
  aiEndpoint: env.VITE_AI_ENDPOINT || env.VITE_AI_BASE || undefined,
  aiModel: env.VITE_AI_MODEL || undefined,
  syncToken: env.VITE_SYNC_TOKEN || undefined,
}

/** 合并项目级配置与设备设置：设备里手动填的优先 */
export function aiConfig(settings: { aiKey?: string; aiEndpoint?: string; aiBase?: string; aiModel?: string }): AIConfig {
  return {
    key: settings.aiKey || envConfig.aiKey,
    endpoint: settings.aiEndpoint || settings.aiBase || envConfig.aiEndpoint,
    model: settings.aiModel || envConfig.aiModel || 'glm-4-flash',
  }
}
