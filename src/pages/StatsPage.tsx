import { useState } from 'react'
import { AVATARS, BADGES, useStore } from '../store'
import { ALL_TOPICS } from '../generators'
import type { Grade } from '../types'
import { levelOf } from '../lib/scoring'
import { Modal } from '../components/Bits'

export default function StatsPage({ profileId, onBack, onDrill }: { profileId: string; onBack: () => void; onDrill: (grade: Grade, topicId: string) => void }) {
  const { profiles, updateProfile, removeProfile, soundOn, toggleSound, resetAll } = useStore()
  const p = profiles.find((x) => x.id === profileId)
  const [editing, setEditing] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [name, setName] = useState(p?.name ?? '')
  const [avatar, setAvatar] = useState(p?.avatar ?? AVATARS[0])
  const [grade, setGrade] = useState<Grade>(p?.grade ?? 1)

  if (!p) return null
  const lv = levelOf(p.stats.totalPoints)
  const s = p.stats
  const days = s.dates.length

  const topicRows = ALL_TOPICS.filter((t) => t.grade === p.grade && s.byTopic[t.id]?.total)
  const weak = topicRows.filter((t) => s.byTopic[t.id]!.first / s.byTopic[t.id]!.total < 0.6 && s.byTopic[t.id]!.total >= 3)

  return (
    <div>
      <div className="quiz-top" style={{ padding: '10px 4px 0' }}>
        <button className="btn ghost" style={{ padding: '8px 14px', fontSize: '0.95rem' }} onClick={onBack}>
          ← 返回
        </button>
        <div className="pill" style={{ marginLeft: 'auto' }}>
          {p.avatar} {p.name}
        </div>
      </div>

      <div className="card" style={{ marginTop: 10 }}>
        <div className="row spread">
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>
              {lv.emoji} Lv{lv.level} {lv.title}
            </div>
            <div className="muted">
              🏅 {s.totalPoints} 分{lv.next ? ` · 距 ${lv.next.emoji}${lv.next.title} 还差 ${lv.next.min - s.totalPoints} 分` : ' · 已达最高等级'}
            </div>
          </div>
          <button className="btn ghost" style={{ fontSize: '0.85rem', padding: '8px 12px' }} onClick={() => setEditing(true)}>
            ✏️ 编辑
          </button>
        </div>
        <div className="level-bar" role="progressbar" aria-valuenow={Math.round(lv.progress * 100)} aria-valuemax={100}>
          <i style={{ width: `${lv.progress * 100}%` }} />
        </div>
        <div className="result-stats">
          <div className="result-stat">
            <div className="v">{s.totalQuestions}</div>
            <div className="k">累计做题</div>
          </div>
          <div className="result-stat">
            <div className="v">{s.stars3}</div>
            <div className="k">三星题数</div>
          </div>
          <div className="result-stat">
            <div className="v">{days}</div>
            <div className="k">练习天数</div>
          </div>
        </div>
        <div className="row spread muted" style={{ fontSize: '0.88rem' }}>
          <span>🚀 拓展题一次答对：{s.challengeFirstTry} 次</span>
          <button className="btn ghost" style={{ fontSize: '0.8rem', padding: '6px 10px' }} onClick={toggleSound}>
            {soundOn ? '🔊 音效开' : '🔇 音效关'}
          </button>
        </div>
      </div>

      {weak.length > 0 && (
        <div className="card" style={{ marginTop: 14 }}>
          <h3 style={{ margin: '0 0 8px' }}>🎯 建议加强</h3>
          <div className="topic-chips">
            {weak.map((t) => (
              <button key={t.id} className="btn ghost" style={{ fontSize: '0.9rem', padding: '8px 14px' }} onClick={() => onDrill(p.grade, t.id)}>
                {t.name}（{Math.round((s.byTopic[t.id]!.first / s.byTopic[t.id]!.total) * 100)}%）
              </button>
            ))}
          </div>
        </div>
      )}

      <h3 className="section-title">🏆 徽章墙（{p.badges.length}/{BADGES.length}）</h3>
      <div className="badge-grid">
        {BADGES.map((b) => {
          const got = p.badges.includes(b.id)
          return (
            <div key={b.id} className={`badge-cell ${got ? 'got' : 'lock'}`}>
              <div className="be">{b.emoji}</div>
              <div className="bn">{b.name}</div>
              <div className="bd">{got ? b.desc : '？？？'}</div>
            </div>
          )
        })}
      </div>

      {s.recent.length > 0 && (
        <>
          <h3 className="section-title">🕐 最近练习</h3>
          <div className="card">
            {s.recent.map((r, i) => (
              <div className="recent-item" key={i}>
                <span>
                  {r.date.slice(5)} · {r.grade}年级
                </span>
                <span>
                  🏅{r.points} · ⭐{r.stars} · 一次对 {r.accuracy}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="row" style={{ marginTop: 20 }}>
        <button className="btn ghost" style={{ flex: 1, color: 'var(--red)' }} onClick={() => setConfirmReset(true)}>
          🗑 清空所有数据
        </button>
      </div>

      {editing && (
        <Modal onClose={() => setEditing(false)}>
          <h3 style={{ marginTop: 0 }}>编辑小勇士</h3>
          <div className="field">
            <label>名字</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={8} />
          </div>
          <div className="field">
            <label>伙伴</label>
            <div className="avatar-pick">
              {AVATARS.map((a) => (
                <button key={a} className={a === avatar ? 'on' : ''} onClick={() => setAvatar(a)} type="button">
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>年级</label>
            <div className="grade-pick">
              {[1, 2, 3, 4, 5, 6].map((g) => (
                <button key={g} className={g === grade ? 'on' : ''} onClick={() => setGrade(g as Grade)} type="button">
                  {g}年级
                </button>
              ))}
            </div>
          </div>
          <div className="row">
            <button className="btn" style={{ flex: 2 }} onClick={() => { updateProfile(p.id, { name: name.trim() || p.name, avatar, grade }); setEditing(false) }}>
              保存
            </button>
            <button className="btn danger" style={{ flex: 1 }} onClick={() => { removeProfile(p.id); onBack() }}>
              删除
            </button>
          </div>
        </Modal>
      )}

      {confirmReset && (
        <Modal onClose={() => setConfirmReset(false)}>
          <h3 style={{ marginTop: 0 }}>确定清空所有数据吗？</h3>
          <p className="muted">所有小勇士、积分和徽章都会被删除，无法恢复。</p>
          <div className="row">
            <button className="btn ghost" style={{ flex: 1 }} onClick={() => setConfirmReset(false)}>
              取消
            </button>
            <button className="btn danger" style={{ flex: 1 }} onClick={() => { resetAll(); onBack() }}>
              清空
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
