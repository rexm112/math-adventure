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

/**
 * 题面文本 → 适合朗读的中文说法。
 * 直接把 "3/4 × 2 = ?" 丢给 TTS 会读出英文符号或怪发音，先翻译成中文词：
 * 分数按中文语序（3/4 → 4分之3），×÷+=、π、% 等换成汉字。
 */
export function ttsText(raw: string): string {
  let t = raw
  t = t.replace(/(\d+(?:\.\d+)?)\s*%/g, '百分之$1')
  t = t.replace(/多少\s*%/g, '百分之多少')
  t = t.replace(/%/g, '百分之')
  t = t.replace(/(\d+)\s*\/\s*(\d+)/g, '$2分之$1')
  t = t.replace(/(\d+)\s*:\s*(\d+)/g, '$1比$2')
  t = t.replace(/×/g, '乘以')
  t = t.replace(/÷/g, '除以')
  t = t.replace(/\+/g, '加')
  t = t.replace(/−/g, '减')
  t = t.replace(/(\s)-(\s)/g, '$1减$2')
  t = t.replace(/=/g, '等于')
  t = t.replace(/π/g, '圆周率')
  t = t.replace(/²/g, '的平方')
  t = t.replace(/℃/g, '度')
  t = t.replace(/[〇○]/g, '圆圈')
  t = t.replace(/□/g, '方框')
  t = t.replace(/>/g, '大于')
  t = t.replace(/</g, '小于')
  t = t.replace(/（\s*？\s*）/g, '多少，')
  return t
}

/** 本机语音列表里是否有中文语音（列表为空 = 尚未加载/无引擎，返回 false 交由无声检测兜底） */
export function chineseVoiceMissing(): boolean {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined
  if (!synth) return true
  const voices = synth.getVoices()
  if (!voices.length) return false
  return !voices.some((v) => /^zh/i.test(v.lang))
}

let currentUtterance: SpeechSynthesisUtterance | null = null

/**
 * 朗读一段中文文本；正在朗读时会先停止。
 * onFail：约 0.7s 内语音没有真正开始播放时回调（手机静音键、媒体音量为 0、
 * 微信/QQ 内置浏览器缺 TTS 引擎、iOS cancel 竞态等都表现为"静默无声"）。
 */
export function speak(text: string, opts: { rate?: number; onFail?: () => void } = {}) {
  if (!ttsSupported()) {
    opts.onFail?.()
    return
  }
  const synth = window.speechSynthesis
  try {
    const start = () => {
      const u = new SpeechSynthesisUtterance(ttsText(text))
      const v = pickChineseVoice()
      if (v) u.voice = v
      u.lang = v?.lang ?? 'zh-CN'
      u.rate = opts.rate ?? 0.95
      // 持有引用，防止移动端浏览器把 utterance 提前回收导致中途无声
      currentUtterance = u
      let started = false
      u.onstart = () => {
        started = true
      }
      if (opts.onFail) {
        window.setTimeout(() => {
          if (!started && !synth.speaking) opts.onFail?.()
        }, 700)
      }
      synth.speak(u)
    }
    if (synth.speaking || synth.pending) {
      // iOS 上 cancel 与 speak 同帧调用会吞掉新语音：先停，下一拍再播
      synth.cancel()
      window.setTimeout(start, 60)
    } else {
      start()
    }
  } catch {
    /* 忽略：个别浏览器在后台标签页会抛错 */
    opts.onFail?.()
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
