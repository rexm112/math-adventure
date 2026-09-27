import { useRef, useState } from 'react'
import type { Question } from '../types'
import { analyzeExplanation, type AnalysisResult } from '../lib/ai'
import { createRecorder, speak, sttSupported } from '../lib/speech'
import { useStore } from '../store'

/**
 * 错题讲思路环节：孩子答对后，用语音（或打字）讲出解题逻辑，
 * 系统分析"讲的是道理还是只报数字"，没讲清就逐步解释逻辑关系。
 */
export default function VoiceExplain({ q, onDone }: { q: Question; onDone: (passed: boolean) => void }) {
  const settings = useStore((s) => s.settings)
  const [phase, setPhase] = useState<'idle' | 'recording' | 'edit' | 'analyzing' | 'result'>('idle')
  const [transcript, setTranscript] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const recorderRef = useRef<ReturnType<typeof createRecorder>>(null)

  const startRec = () => {
    setError('')
    const rec = createRecorder({
      onPartial: (t) => setTranscript((prev) => (prev ? prev : t)),
      onFinal: (t) => {
        setTranscript((prev) => (prev ? prev + t : t))
        setPhase('edit')
      },
      onError: (msg) => {
        setError(msg)
        setPhase('edit')
      },
    })
    if (!rec) {
      setError('这台设备不支持语音输入，请用打字的方式讲思路。')
      setPhase('edit')
      return
    }
    recorderRef.current = rec
    setTranscript('')
    setPhase('recording')
    rec.start()
  }

  const stopRec = () => {
    recorderRef.current?.stop()
    setPhase((p) => (p === 'recording' ? 'edit' : p))
  }

  const submit = async () => {
    const text = transcript.trim()
    if (text.length < 5) {
      setError('多讲几句嘛～至少说说为什么这么做、先算什么。')
      return
    }
    setError('')
    setPhase('analyzing')
    const r = await analyzeExplanation(q, text, settings.aiKey ? { key: settings.aiKey, base: settings.aiBase, model: settings.aiModel } : undefined)
    setResult(r)
    setAttempts((a) => a + 1)
    setPhase('result')
    if (settings.tts !== false) speak(r.pass ? r.feedback : r.explanation)
  }

  return (
    <div className="card" style={{ marginTop: 12, borderColor: 'var(--violet)', boxShadow: '0 6px 0 #ede9fe' }}>
      <h3 style={{ margin: '0 0 6px' }}>🎤 轮到你当小老师啦！</h3>
      <p className="muted" style={{ margin: '0 0 12px' }}>
        用<b>完整的话讲讲你的想法</b>：为什么这么做？先算什么、再算什么？
        <br />
        要讲<b>道理和思路</b>，不能只报数字哦！
      </p>

      {phase === 'idle' && (
        <div className="row">
          {sttSupported() ? (
            <button className="btn pink" style={{ flex: 1, fontSize: '1.15rem', padding: '16px' }} onClick={startRec}>
              🎤 按一下开始讲
            </button>
          ) : (
            <button className="btn ghost" style={{ flex: 1 }} onClick={() => setPhase('edit')}>
              ⌨️ 用打字讲思路
            </button>
          )}
        </div>
      )}

      {phase === 'recording' && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 800, color: 'var(--pink)' }}>
            <span className="owl">🎙️</span> 正在听你说……讲完按停止
          </p>
          {transcript && <p className="muted">「{transcript}」</p>}
          <button className="btn" style={{ marginTop: 8 }} onClick={stopRec}>
            ⏹ 我讲完了
          </button>
        </div>
      )}

      {(phase === 'edit' || phase === 'analyzing') && (
        <div>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={3}
            placeholder={sttSupported() ? '说出或写下你的思路…' : '写下你的思路：为什么这么做？先算什么，再算什么？'}
            style={{ width: '100%', border: '2.5px solid var(--line)', borderRadius: 16, padding: '10px 14px', fontSize: '1.05rem', fontFamily: 'inherit', resize: 'vertical' }}
            disabled={phase === 'analyzing'}
          />
          <div className="row" style={{ marginTop: 8 }}>
            <button className="btn green" style={{ flex: 2 }} onClick={submit} disabled={phase === 'analyzing'}>
              {phase === 'analyzing' ? '🦉 老师在听…' : '✓ 交给我讲的内容'}
            </button>
            {sttSupported() && (
              <button className="btn ghost" style={{ flex: 1 }} onClick={startRec} disabled={phase === 'analyzing'}>
                🎤 重讲
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="feedback-bar feedback-no" style={{ marginBottom: 8 }}>
          {error}
        </div>
      )}

      {phase === 'result' && result && (
        <div>
          <div className={`feedback-bar ${result.pass ? 'feedback-ok' : 'feedback-no'}`}>
            {result.pass ? '✅ 讲得真好！' : '🤔 还差一点点，老师讲给你听：'}
          </div>
          <div className="hint-bubble" style={{ marginTop: 10 }}>
            {result.feedback}
          </div>
          {!result.pass && (
            <div className="hint-bubble" style={{ marginTop: 8, background: 'var(--blue-soft)', borderColor: 'var(--blue)' }}>
              <b>🦉 一步一步看：</b>
              {result.explanation}
            </div>
          )}
          <div className="row" style={{ marginTop: 12 }}>
            {result.pass ? (
              <button className="btn big green" onClick={() => onDone(true)}>
                太棒了，继续 →
              </button>
            ) : (
              <>
                <button className="btn pink" style={{ flex: 2 }} onClick={() => { setPhase('edit'); setResult(null) }}>
                  🎤 再讲一次
                </button>
                {attempts >= 2 ? (
                  <button className="btn ghost" style={{ flex: 1 }} onClick={() => onDone(false)}>
                    下次再讲
                  </button>
                ) : null}
                {attempts >= 1 && (
                  <button className="btn ghost" style={{ flex: 1 }} onClick={() => speak(result.explanation)}>
                    🔊 听讲解
                  </button>
                )}
              </>
            )}
          </div>
          {!result.pass && attempts < 2 && (
            <p className="muted" style={{ marginTop: 8, marginBottom: 0, fontSize: '0.85rem' }}>
              讲两次后如果还想休息，可以选择"下次再讲"。
            </p>
          )}
        </div>
      )}
    </div>
  )
}
