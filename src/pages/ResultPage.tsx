import type { Grade, SessionSummary } from '../types'
import { BADGES } from '../store'
import { accuracyOf } from '../lib/scoring'
import { Confetti } from '../components/Bits'
import { DIFF_LABEL } from '../lib/scoring'

function praise(acc: number) {
  if (acc === 100) return '十全十美！你太厉害啦！🏆'
  if (acc >= 80) return '表现超级棒！继续保持！🌟'
  if (acc >= 60) return '不错哦，把错题再想想，会更强！💪'
  return '坚持完成就是胜利！休息一下再来挑战吧！🌱'
}

export default function ResultPage({
  summary,
  earnedBadges,
  profileAvatar,
  onAgain,
  onSetup,
  onHome,
  onDrill,
}: {
  summary: SessionSummary
  earnedBadges: string[]
  profileAvatar: string
  onAgain: () => void
  onSetup: () => void
  onHome: () => void
  onDrill: (grade: Grade, topicId: string) => void
}) {
  const acc = accuracyOf(summary.results)
  const mins = Math.floor(summary.seconds / 60)
  const secs = summary.seconds % 60
  const weak = Object.values(
    summary.results.reduce<Record<string, { topicId: string; topicName: string; first: number; total: number }>>((m, r) => {
      const t = (m[r.topicId] ??= { topicId: r.topicId, topicName: r.topicName, first: 0, total: 0 })
      t.total++
      if (r.wrongAttempts === 0 && !r.skipped) t.first++
      return m
    }, {}),
  )
    .filter((t) => t.total >= 2 && t.first / t.total < 0.6)
    .slice(0, 2)

  return (
    <div>
      {acc >= 80 && <Confetti count={50} />}
      <div className="result-hero">
        <div className="emoji">{profileAvatar}</div>
        <h2 style={{ margin: '6px 0 2px' }}>本局完成！</h2>
        <p style={{ margin: 0, color: 'var(--muted)' }}>{praise(acc)}</p>
      </div>

      <div className="result-stats">
        <div className="result-stat">
          <div className="v">🏅 {summary.points}</div>
          <div className="k">本局得分</div>
        </div>
        <div className="result-stat">
          <div className="v">⭐ {summary.stars}</div>
          <div className="k">获得星星</div>
        </div>
        <div className="result-stat">
          <div className="v">
            {acc}% · {mins}:{String(secs).padStart(2, '0')}
          </div>
          <div className="k">一次答对率 · 用时</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ margin: '0 0 10px' }}>📋 每题表现</h3>
        <div className="row" style={{ gap: 8 }}>
          {summary.results.map((r, i) => (
            <span
              key={i}
              className="pill"
              style={{
                background: r.skipped ? 'var(--red-soft)' : r.stars === 3 ? 'var(--green-soft)' : r.stars === 2 ? '#e0f2fe' : 'var(--amber-soft)',
                borderColor: 'transparent',
                fontSize: '0.8rem',
              }}
              title={`${r.topicName} · ${DIFF_LABEL[r.difficulty].name}`}
            >
              {DIFF_LABEL[r.difficulty].emoji}
              {r.skipped ? '跳过' : r.stars === 3 ? '⭐⭐⭐' : r.stars === 2 ? '⭐⭐' : '⭐'}
            </span>
          ))}
          {summary.results.length < summary.total &&
            Array.from({ length: summary.total - summary.results.length }, (_, i) => (
              <span key={`u${i}`} className="pill" style={{ opacity: 0.4, fontSize: '0.8rem' }}>
                未答
              </span>
            ))}
        </div>
        {weak.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <p className="muted" style={{ margin: '0 0 8px' }}>建议加强练一练：</p>
            <div className="row">
              {weak.map((t) => (
                <button key={t.topicId} className="btn ghost" style={{ fontSize: '0.9rem', padding: '8px 14px' }} onClick={() => onDrill(summary.grade, t.topicId)}>
                  🎯 {t.topicName} 专项
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {earnedBadges.length > 0 && (
        <div className="card" style={{ marginTop: 14, borderColor: 'var(--amber)', boxShadow: '0 6px 0 var(--amber-soft)' }}>
          <h3 style={{ margin: '0 0 10px' }}>🎉 获得新徽章！</h3>
          <div className="row">
            {earnedBadges.map((id) => {
              const b = BADGES.find((x) => x.id === id)!
              return (
                <div key={id} className="badge-cell got" style={{ flex: 1, minWidth: 110 }}>
                  <div className="be">{b.emoji}</div>
                  <div className="bn">{b.name}</div>
                  <div className="bd">{b.desc}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <button className="btn big green" onClick={onAgain}>
          🔄 再来一局
        </button>
        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn ghost" style={{ flex: 1 }} onClick={onSetup}>
            换年级 / 专项
          </button>
          <button className="btn ghost" style={{ flex: 1 }} onClick={onHome}>
            回主页
          </button>
        </div>
      </div>
    </div>
  )
}
