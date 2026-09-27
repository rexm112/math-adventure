import { useEffect, useMemo, useState } from 'react'
import type { Difficulty } from '../types'
import { DIFF_LABEL } from '../lib/scoring'

export function Stars({ n, size = 'normal' }: { n: number; size?: 'normal' | 'big' }) {
  return (
    <span className={size === 'big' ? 'stars-big' : ''} aria-label={`${n} 星`}>
      {'⭐'.repeat(n)}
      <span className="muted" style={{ opacity: 0.35, fontSize: size === 'big' ? undefined : '0.95em' }}>
        {'☆'.repeat(3 - n)}
      </span>
    </span>
  )
}

export function DiffChip({ d }: { d: Difficulty }) {
  const info = DIFF_LABEL[d]
  return (
    <span className={`diff-chip ${info.cls}`}>
      {info.emoji} {info.name}
    </span>
  )
}

export function ProgressDots({ total, current, stars }: { total: number; current: number; stars: (number | 'skip' | null)[] }) {
  return (
    <div className="progress-dots" role="progressbar" aria-valuenow={current + 1} aria-valuemax={total}>
      {Array.from({ length: total }, (_, i) => {
        const s = stars[i]
        const cls = s === null || s === undefined ? '' : s === 'skip' ? 'skip' : `s${s}`
        return <span key={i} className={`pdot ${cls} ${i === current ? 'cur' : ''}`} />
      })}
    </div>
  )
}

/** 简易撒花 */
export function Confetti({ count = 30 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        dur: 1.4 + Math.random() * 1.2,
        color: ['#2563EB', '#F59E0B', '#EC4899', '#22C55E', '#0EA5E9', '#8B5CF6'][i % 6],
        size: 7 + Math.random() * 7,
      })),
    [count],
  )
  const [alive, setAlive] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setAlive(false), 3200)
    return () => clearTimeout(t)
  }, [])
  if (!alive) return null
  return (
    <>
      {pieces.map((p, i) => (
        <i
          key={i}
          className="confetti"
          style={{ left: `${p.left}vw`, background: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, width: p.size, height: p.size * 1.4 }}
        />
      ))}
    </>
  )
}

export function Modal({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  return (
    <div className="modal" onClick={onClose} role="dialog" aria-modal="true">
      <div className="card" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export function Owl({ size = 34 }: { size?: number }) {
  return (
    <span className="owl" style={{ fontSize: size / 20 + 'rem' }} aria-hidden>
      🦉
    </span>
  )
}
