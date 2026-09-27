// 轻量 WebAudio 音效（无外部资源）
let ctx: AudioContext | null = null

function ac(): AudioContext | null {
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType, vol: number) {
  const c = ac()
  if (!c) return
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.value = freq
  g.gain.setValueAtTime(0.0001, c.currentTime + start)
  g.gain.exponentialRampToValueAtTime(vol, c.currentTime + start + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur)
  o.connect(g).connect(c.destination)
  o.start(c.currentTime + start)
  o.stop(c.currentTime + start + dur + 0.05)
}

export const sfx = {
  correct() {
    tone(523, 0, 0.12, 'sine', 0.18)
    tone(659, 0.09, 0.12, 'sine', 0.18)
    tone(784, 0.18, 0.2, 'sine', 0.18)
  },
  wrong() {
    tone(196, 0, 0.18, 'triangle', 0.12)
    tone(165, 0.12, 0.22, 'triangle', 0.1)
  },
  finish() {
    tone(523, 0, 0.14, 'sine', 0.16)
    tone(659, 0.13, 0.14, 'sine', 0.16)
    tone(784, 0.26, 0.14, 'sine', 0.16)
    tone(1046, 0.39, 0.3, 'sine', 0.18)
  },
  click() {
    tone(880, 0, 0.06, 'sine', 0.08)
  },
  star() {
    tone(1318, 0, 0.1, 'sine', 0.14)
  },
}
