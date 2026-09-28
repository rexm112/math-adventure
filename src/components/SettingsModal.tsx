import { useRef, useState } from 'react'
import { useStore, type Profile } from '../store'
import { Modal } from './Bits'

/** 设置面板：AI 讲解分析（家长配 API Key）、云同步（GitHub Gist）、数据导出/导入 */
export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { settings, setSettings, soundOn, toggleSound, syncCfg, setupSync, syncNow, setSyncCfg, profiles, importProfiles } = useStore()
  const [aiKey, setAiKey] = useState(settings.aiKey ?? '')
  const [aiModel, setAiModel] = useState(settings.aiModel ?? 'glm-4-flash')
  const [token, setToken] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const saveAI = () => {
    setSettings({ aiKey: aiKey.trim(), aiModel: aiModel.trim() || 'glm-4-flash' })
    setMsg(aiKey.trim() ? 'AI 老师已就绪 ✓（只在讲解分析时调用）' : '已关闭 AI，讲解用离线批改')
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

  return (
    <Modal onClose={onClose}>
      <h3 style={{ margin: '0 0 12px' }}>⚙️ 设置（家长操作）</h3>

      <div className="field">
        <label>🦉 AI 讲解老师（可选，推荐）</label>
        <input type="text" value={aiKey} onChange={(e) => setAiKey(e.target.value)} placeholder="粘贴智谱 API Key（bigmodel.cn，glm-4-flash 免费）" />
        <input type="text" value={aiModel} onChange={(e) => setAiModel(e.target.value)} placeholder="模型名，默认 glm-4-flash" style={{ marginTop: 8 }} />
        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn" style={{ flex: 1 }} onClick={saveAI}>
            保存 AI 设置
          </button>
          <button className="btn ghost" onClick={() => setSettings({ tts: settings.tts === false ? true : false })}>
            {settings.tts === false ? '🔇 语音播报关' : '🔊 语音播报开'}
          </button>
          <button className="btn ghost" onClick={toggleSound}>
            {soundOn ? '🔔 音效开' : '🔕 音效关'}
          </button>
        </div>
        <p className="muted" style={{ fontSize: '0.8rem' }}>
          未配置时使用离线批改（判断孩子讲的是思路还是只报数字），配置后由 AI 老师逐句点评并讲解逻辑。Key 只保存在这台设备的浏览器里，不会上传到代码仓库。
        </p>
      </div>

      <div className="field">
        <label>☁️ 云同步（多台设备共享进度）</label>
        {syncCfg ? (
          <>
            <p className="muted" style={{ margin: '0 0 8px' }}>
              已连接云端仓库，最后同步：{new Date(syncCfg.lastSync).toLocaleString('zh-CN')}
            </p>
            <div className="row">
              <button className="btn" style={{ flex: 1 }} disabled={busy} onClick={() => doSync('push')}>
                ⬆️ 上传
              </button>
              <button className="btn ghost" style={{ flex: 1 }} disabled={busy} onClick={() => doSync('pull')}>
                ⬇️ 下载合并
              </button>
              <button className="btn ghost" style={{ flex: 1 }} onClick={() => { setSyncCfg(null); setMsg('已断开云同步（云端数据仍在）') }}>
                断开
              </button>
            </div>
          </>
        ) : (
          <>
            <input type="text" value={token} onChange={(e) => setToken(e.target.value)} placeholder="粘贴 GitHub Token（需要 gist 读写权限）" />
            <button className="btn" style={{ marginTop: 8, width: '100%' }} disabled={busy || !token.trim()} onClick={doSetup}>
              连接云同步
            </button>
            <p className="muted" style={{ fontSize: '0.8rem' }}>
              已有仓库会自动识别并合并（换设备粘同一个 token 即可）；第一次使用会自动创建一个私密 Gist 存放数据。
              <br />
              Token 要求：经典 token 勾选 <b>gist</b> 权限，或 Fine-grained token 在 Account permissions 里勾「Gists: Read and write」。Token 只保存在这台设备的浏览器里。
            </p>
          </>
        )}
      </div>

      <div className="field">
        <label>💾 备份 / 恢复</label>
        <div className="row">
          <button className="btn ghost" style={{ flex: 1 }} onClick={exportData}>
            导出 JSON 文件
          </button>
          <button className="btn ghost" style={{ flex: 1 }} onClick={() => fileRef.current?.click()}>
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
