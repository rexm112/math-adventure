import { useState } from 'react'
import { sfx } from '../lib/sound'
import type { Question, UserInput } from '../types'

interface PadProps {
  q: Question
  onSubmit: (input: UserInput) => void
  disabled: boolean
  soundOn: boolean
}

function tap(fn: () => void, soundOn: boolean) {
  if (soundOn) sfx.click()
  fn()
}

/** 数字键盘（无系统键盘，纯按钮，适合手机/平板） */
function NumberPad({ q, onSubmit, disabled, soundOn }: PadProps) {
  const [typed, setTyped] = useState('')
  const dec = q.allowDecimal ?? false
  const neg = q.allowNegative ?? false

  const key = (k: string) => {
    if (disabled) return
    if (soundOn) sfx.click()
    setTyped((t) => {
      if (k === '⌫') return t.slice(0, -1)
      if (k === '−') return t.startsWith('-') ? t.slice(1) : '-' + t
      if (k === '.') {
        if (t.includes('.') || t === '' || t === '-') return t
        return t + '.'
      }
      if (t.replace(/[-.]/g, '').length >= 9) return t
      return t + k
    })
  }

  const canSubmit = typed !== '' && typed !== '-' && typed !== '.' && !typed.endsWith('.')

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (canSubmit) onSubmit(Number(typed))
      }}
    >
      <div className="answer-display" aria-label="答案输入">
        <span className="box">{typed || '？'}</span>
        {q.unit && <span className="unit">{q.unit}</span>}
      </div>
      <div className="keypad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((k) => (
          <button type="button" className="key" key={k} onClick={() => key(k)} disabled={disabled}>
            {k}
          </button>
        ))}
        {dec ? (
          <>
            <button type="button" className="key op" onClick={() => key('.')} disabled={disabled}>
              ·
            </button>
            <button type="button" className="key" onClick={() => key('0')} disabled={disabled}>
              0
            </button>
            <button type="button" className="key op" onClick={() => key('⌫')} disabled={disabled}>
              ⌫
            </button>
          </>
        ) : (
          <>
            <button type="button" className="key op" onClick={() => key('⌫')} disabled={disabled}>
              ⌫
            </button>
            <button type="button" className="key" onClick={() => key('0')} disabled={disabled}>
              0
            </button>
            <button
              type="button"
              className="key"
              onClick={() => tap(() => onSubmit(Number(typed)), soundOn)}
              disabled={disabled || !canSubmit}
              style={{ background: 'var(--green)', color: '#fff', boxShadow: '0 4px 0 var(--green-dark)' }}
            >
              ✓
            </button>
          </>
        )}
      </div>
      {dec && (
        <div className="keypad" style={{ gridTemplateColumns: neg ? '1fr 2fr' : '1fr' }}>
          {neg && (
            <button type="button" className="key op" onClick={() => key('−')} disabled={disabled}>
              −
            </button>
          )}
          <button
            type="submit"
            className="key"
            disabled={disabled || !canSubmit}
            style={{ background: 'var(--green)', color: '#fff', boxShadow: '0 4px 0 var(--green-dark)', minHeight: 48 }}
          >
            ✓ 确定
          </button>
        </div>
      )}
    </form>
  )
}

/** 分数 / 比 输入（两个框，点选当前框，数字键填充） */
function FracPad({ q, onSubmit, disabled, soundOn }: PadProps & { ratio?: boolean }) {
  const isRatio = q.answerType === 'ratio'
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [active, setActive] = useState<'a' | 'b'>('a')

  const key = (k: string) => {
    if (disabled) return
    if (soundOn) sfx.click()
    const set = (v: string) => (v.replace(/[^0-9]/g, '').length >= 5 ? v : v + k)
    if (k === '⌫') {
      if (active === 'a') setA((v) => v.slice(0, -1))
      else setB((v) => v.slice(0, -1))
      return
    }
    if (active === 'a') setA((v) => set(v))
    else setB((v) => set(v))
  }

  const canSubmit = a !== '' && b !== '' && Number(b) > 0
  const submit = () => {
    if (!canSubmit) return
    if (isRatio) onSubmit({ a: Number(a), b: Number(b) })
    else onSubmit({ n: Number(a), d: Number(b) })
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <p className="muted" style={{ textAlign: 'center', margin: '2px 0 8px' }}>
        {isRatio ? '点一点前项、后项的框，再按数字填入（比 a : b）' : '点一分子、分母的框，再按数字填入（分数 n/d）'}
      </p>
      <div className="answer-display">
        <span className={`box frac ${active === 'a' ? 'active' : ''}`} onClick={() => setActive('a')}>
          <span className="fl">{a || '?'}</span>
          {isRatio ? <span className="op" style={{ fontSize: '0.9rem' }}>（前项）</span> : <span className="fbar" />}
          <span className="fl muted" style={{ fontSize: '0.6rem' }}>
            {isRatio ? '前项' : '分子'}
          </span>
        </span>
        <span className="op">{isRatio ? ':' : undefined}</span>
        <span className={`box frac ${active === 'b' ? 'active' : ''}`} onClick={() => setActive('b')}>
          <span className="fl">{b || '?'}</span>
          {isRatio ? null : <span className="fbar" />}
          <span className="fl muted" style={{ fontSize: '0.6rem' }}>
            {isRatio ? '后项' : '分母'}
          </span>
        </span>
      </div>
      <div className="keypad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((k) => (
          <button type="button" className="key" key={k} onClick={() => key(k)} disabled={disabled}>
            {k}
          </button>
        ))}
        <button type="button" className="key op" onClick={() => key('⌫')} disabled={disabled}>
          ⌫
        </button>
        <button type="button" className="key" onClick={() => key('0')} disabled={disabled}>
          0
        </button>
        <button
          type="button"
          className="key"
          onClick={() => tap(submit, soundOn)}
          disabled={disabled || !canSubmit}
          style={{ background: 'var(--green)', color: '#fff', boxShadow: '0 4px 0 var(--green-dark)' }}
        >
          ✓
        </button>
      </div>
    </form>
  )
}

/** 比大小：> < = */
function ComparePad({ onSubmit, disabled, soundOn }: Omit<PadProps, 'q'>) {
  return (
    <div className="compare-zone">
      {(['>', '<', '='] as const).map((op) => (
        <button
          key={op}
          type="button"
          className="compare-btn"
          disabled={disabled}
          onClick={() => tap(() => onSubmit(op), soundOn)}
          aria-label={op === '>' ? '大于' : op === '<' ? '小于' : '等于'}
        >
          {op === '=' ? '＝' : op}
        </button>
      ))}
    </div>
  )
}

/** 选择题 */
function ChoicePad({ q, onSubmit, disabled, soundOn }: PadProps) {
  return (
    <div className="choice-zone">
      {(q.choices ?? []).map((c, i) => (
        <button
          key={i}
          type="button"
          className="choice-btn"
          disabled={disabled}
          onClick={() => tap(() => onSubmit(i), soundOn)}
        >
          <span className="num" style={{ marginRight: 10, opacity: 0.5 }}>
            {'ABCD'[i]}
          </span>
          {c}
        </button>
      ))}
    </div>
  )
}

export function AnswerPad(props: PadProps) {
  switch (props.q.answerType) {
    case 'number':
      return <NumberPad {...props} />
    case 'fraction':
    case 'ratio':
      return <FracPad {...props} />
    case 'compare':
      return <ComparePad {...props} />
    case 'choice':
      return <ChoicePad {...props} />
    default:
      return null
  }
}
