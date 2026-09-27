// ---------- 语音能力封装 ----------
// TTS：浏览器内置 speechSynthesis（iOS/macOS/Android 均带本地中文语音）
// STT：浏览器内置 SpeechRecognition（免密钥，中文识别好；iOS 走苹果服务、安卓走谷歌服务）

let cachedVoice: SpeechSynthesisVoice | null = null

function pickChineseVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined
  if (!synth) return null
  const voices = synth.getVoices()
  cachedVoice =
    voices.find((v) => /zh[-_]CN/i.test(v.lang) && /Tingting|Xiaoxiao|Yunyang|Female/i.test(v.name)) ??
    voices.find((v) => /zh[-_]CN/i.test(v.lang)) ??
    voices.find((v) => v.lang.toLowerCase().startsWith('zh')) ??
    null
  return cachedVoice
}

export function ttsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

/** 朗读一段中文文本；正在朗读时会先停止 */
export function speak(text: string, opts: { rate?: number } = {}) {
  if (!ttsSupported()) return
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    const v = pickChineseVoice()
    if (v) u.voice = v
    u.lang = v?.lang ?? 'zh-CN'
    u.rate = opts.rate ?? 0.95
    window.speechSynthesis.speak(u)
  } catch {
    /* 忽略：个别浏览器在后台标签页会抛错 */
  }
}

export function stopSpeak() {
  if (ttsSupported()) window.speechSynthesis.cancel()
}

// 部分浏览器异步加载音色列表
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null
    pickChineseVoice()
  }
}

// ---------- STT ----------

type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
}

export function sttSupported(): boolean {
  if (typeof window === 'undefined') return false
  const w = window as unknown as Record<string, unknown>
  return Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition)
}

export interface Recorder {
  start(): void
  stop(): void
}

/** 创建一次性语音识别会话；不支持时返回 null */
export function createRecorder(handlers: {
  onPartial?: (text: string) => void
  onFinal: (text: string) => void
  onError: (message: string) => void
}): Recorder | null {
  if (!sttSupported()) return null
  const w = window as unknown as Record<string, new () => SpeechRecognitionLike>
  const Ctor = (w.SpeechRecognition ?? w.webkitSpeechRecognition) as new () => SpeechRecognitionLike
  const rec = new Ctor()
  rec.lang = 'zh-CN'
  rec.continuous = false
  rec.interimResults = true
  let stopped = false
  rec.onresult = (e) => {
    let final = ''
    let partial = ''
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i]
      const t = r[0]?.transcript ?? ''
      if (r.isFinal) final += t
      else partial += t
    }
    if (partial) handlers.onPartial?.(partial)
    if (final) handlers.onFinal(final)
  }
  rec.onerror = (e) => {
    if (stopped) return
    const map: Record<string, string> = {
      'not-allowed': '麦克风权限被拒绝了，请在系统设置里允许使用麦克风，或改用打字输入。',
      'service-not-allowed': '语音服务不可用，可以改用打字输入。',
      'no-speech': '没听到声音，凑近一点再试一次，或改用打字输入。',
      network: '网络不稳定，语音识别失败，可以改用打字输入。',
    }
    handlers.onError(map[e.error] ?? '语音识别出错了，可以改用打字输入。')
  }
  rec.onend = () => {
    /* 会话结束（说完了或被停止） */
  }
  return {
    start() {
      try {
        rec.start()
      } catch {
        handlers.onError('无法启动录音，可以改用打字输入。')
      }
    },
    stop() {
      stopped = true
      try {
        rec.stop()
      } catch {
        /* ignore */
      }
    },
  }
}
