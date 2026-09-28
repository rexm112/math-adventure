import { useRef, useState } from 'react'
import { useStore, type Profile } from '../store'
import { envConfig } from '../config'
import { Modal } from './Bits'

/** 设置面板：AI 讲解老师（OpenAI 兼容端点，支持 Coding Plan）、云同步、备份。项目级配置已内置时，此处可按设备覆盖。 */
export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { settings, setSettings, soundOn, toggleSound, syncCfg, setupSync, syncNow, setSyncCfg, profiles, importProfiles } = useStore()
  const [aiKey, setAiKey] = useState(settings.aiKey ?? '')
  const [aiEndpoint, setAiEndpoint] = useState(settings.aiEndpoint ?? settings.aiBase ?? '')
  const [aiModel, setAiModel] = useState(settings.aiModel ?? '')
  const [token, setToken] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const saveAI = () => {
    setSettings({ aiKey: aiKey.trim(), aiEndpoint: aiEndpoint.trim(), aiModel: aiModel.trim() })
    setMsg(aiKey.trim() ? 'AI 老师已就绪 ✓（本机设置将覆盖项目级配置）' : '已恢复使用项目级配置/离线批改')
  }

  const doSetup = async () => {
    if (!token.trim()) return
    setBusy(true)
    setMsg('正在连接云端…')
    try {
      const message = await setupSync(token.trim())
      setToken('')
      setMsg(message)
    } catch (e) {
      setMsg(e instanceof Error ? e.message : '连接失败')
    } finally {
      setBusy(false)
    }
  }

  const doSync = async (dir: 'push' | 'pull') => {
    setBusy(true)
    try {
      setMsg(await syncNow(dir))
    } catch (e) {
      setMsg(e instanceof Error ? e.message : '同步失败，稍后再试')
    } finally {
      setBusy(false)
    }
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ v: 1, exportedAt: Date.now(), profiles }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `math-adventure-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importData = (f: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as { profiles: Profile[] }
        if (!Array.isArray(data.profiles)) throw new Error('bad')
        importProfiles(data.profiles)
        setMsg('数据已导入并合并 ✓')
      } catch {
        setMsg('文件格式不对，导入失败')
      }
    }
    reader.readAsText(f)
  }

  const envAI = envConfig.aiKey
    ? `项目级配置已内置${envConfig.aiEndpoint?.includes('coding') ? '（Coding Plan）' : ''}：${envConfig.aiModel ?? 'glm-4-flash'}`
    : null

  return (
    <Modal onClose={onClose}>
      <h3 style={{ margin: '0 0 12px' }}>⚙️ 设置（家长操作）</h3>

      <div className="field">
        <label>🦉 AI 讲解老师（可选）</label>
        <input type="text" value={aiKey} onChange={(e) => setAiKey(e.target.value)} placeholder="API Key（留空则用项目级配置或离线批改）" />
        <input
          type="text"
          value={aiEndpoint}
          onChange={(e) => setAiEndpoint(e.target.value)}
          placeholder="端点（默认 https://open.bigmodel.cn/api/paas/v4）"
          style={{ marginTop: 8 }}
        />
        <input type="text" value={aiModel} onChange={(e) => setAiModel(e.target.value)} placeholder="模型（默认 glm-4-flash；Coding Plan 可用 glm-4.6 等）" style={{ marginTop: 8 }} />
        <div className="btn-grid" style={{ marginTop: 8 }}>
          <button className="btn" onClick={saveAI}>
            保存本机 AI 设置
          </button>
          <button className="btn ghost" onClick={() => setSettings({ tts: settings.tts === false ? true : false })}>
            {settings.tts === false ? '🔇 语音播报关' : '🔊 语音播报开'}
          </button>
          <button className="btn ghost" onClick={toggleSound}>
            {soundOn ? '🔔 音效开' : '🔕 音效关'}
          </button>
        </div>
        <p className="muted" style={{ fontSize: '0.8rem' }}>
          支持 OpenAI 兼容端点：智谱开放平台用默认端点 + glm-4-flash（免费）；智谱 Coding Plan 的 key 用端点
          <code> https://open.bigmodel.cn/api/coding/paas/v4</code>；其他厂商填对应端点即可。
          {envAI && <>（{envAI}，本机不填即用它）</>}
        </p>
      </div>

      <div className="field">
        <label>☁️ 云同步（多台设备共享进度）</label>
        {syncCfg ? (
          <>
            <p className="muted" style={{ margin: '0 0 8px' }}>
              已连接云端仓库，最后同步：{new Date(syncCfg.lastSync).toLocaleString('zh-CN')}
            </p>
            <div className="btn-grid">
              <button className="btn" disabled={busy} onClick={() => doSync('push')}>
                ⬆️ 上传
              </button>
              <button className="btn ghost" disabled={busy} onClick={() => doSync('pull')}>
                ⬇️ 下载合并
              </button>
              <button className="btn ghost" onClick={() => { setSyncCfg(null); setMsg('已断开本机云同步（项目级配置会在下次打开时自动重连）') }}>
                断开
              </button>
            </div>
          </>
        ) : (
          <>
            {envConfig.syncToken ? (
              <p className="muted" style={{ margin: 0 }}>
                项目级配置已内置同步 Token，打开 App 会自动连接并合并，无需在此填写。
                <br />
                如需用另一个账号/仓库，可在下面粘贴其他 Token 覆盖。
              </p>
            ) : null}
            <input type="text" value={token} onChange={(e) => setToken(e.target.value)} placeholder="粘贴 GitHub Token（需要 gist 读写权限）" style={{ marginTop: 8 }} />
            <button className="btn" style={{ marginTop: 8, width: '100%' }} disabled={busy || !token.trim()} onClick={doSetup}>
              连接云同步
            </button>
            <p className="muted" style={{ fontSize: '0.8rem' }}>
              已有仓库会自动识别并合并（换设备粘同一个 token 即可）；第一次使用会自动创建一个私密 Gist 存放数据。
            </p>
          </>
        )}
      </div>

      <div className="field">
        <label>💾 备份 / 恢复</label>
        <div className="btn-grid">
          <button className="btn ghost" onClick={exportData}>
            导出 JSON 文件
          </button>
          <button className="btn ghost" onClick={() => fileRef.current?.click()}>
            导入文件
          </button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} />
        </div>
      </div>

      {msg && (
        <div className="feedback-bar feedback-ok" style={{ marginTop: 4 }}>
          {msg}
        </div>
      )}

      <button className="btn big ghost" style={{ marginTop: 14 }} onClick={onClose}>
        关闭
      </button>
    </Modal>
  )
}
