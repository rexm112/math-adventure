import { useState } from 'react'
import { AVATARS, useStore, type Profile } from '../store'
import type { Grade } from '../types'
import { levelOf } from '../lib/scoring'
import { Modal } from '../components/Bits'
import SettingsModal from '../components/SettingsModal'

export default function HomePage({
  onPick,
  onStats,
  onReview,
}: {
  onPick: (profileId: string) => void
  onStats: (profileId: string) => void
  onReview: (profileId: string) => void
}) {
  const { profiles, addProfile } = useStore()
  const [adding, setAdding] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [grade, setGrade] = useState<Grade>(1)

  const create = () => {
    const n = name.trim() || '小勇士'
    addProfile(n, avatar, grade)
    setAdding(false)
    setName('')
  }

  const wrongCount = (p: Profile) => (p.wrongBook ?? []).filter((e) => !e.mastered).length

  return (
    <div>
      <div className="home-hero">
        <button
          className="btn ghost"
          style={{ position: 'absolute', right: 14, top: 14, padding: '8px 12px', fontSize: '0.95rem' }}
          onClick={() => setSettingsOpen(true)}
          aria-label="设置"
        >
          ⚙️
        </button>
        <span className="mascot">🧭</span>
        <h1>数学大冒险</h1>
        <p>人教版 · 小学数学 · 边想边学，永不放弃</p>
      </div>

      <div className="profile-grid">
        {profiles.map((p) => {
          const lv = levelOf(p.stats.totalPoints)
          const wrong = wrongCount(p)
          return (
            <button key={p.id} className="profile-card" onClick={() => onPick(p.id)}>
              <span className="avatar">{p.avatar}</span>
              <span className="meta">
                <span className="name">{p.name}</span>
                <div className="sub">
                  {lv.emoji} Lv{lv.level} {lv.title} · {p.grade}年级
                  {p.difficultyMode === 'advanced' ? ' · 进阶' : p.difficultyMode === 'challenge' ? ' · 挑战' : ''}
                </div>
                <div className="sub">
                  🏅 {p.stats.totalPoints} 分 · ⭐×{p.stats.stars3} · 📝 错题 {wrong}
                </div>
              </span>
            </button>
          )
        })}
        <button className="profile-add" onClick={() => setAdding(true)}>
          ＋ 新的小勇士
        </button>
      </div>

      <p className="muted" style={{ textAlign: 'center', marginTop: 26 }}>
        每局 10 题，难度可调（标准 / 进阶 / 挑战）
        <br />
        答错不着急，猫头鹰老师 🦉 会一步步提示，答案永远由你自己算出来！
      </p>

      {profiles.length > 0 && (
        <div className="row" style={{ justifyContent: 'center', marginTop: 12 }}>
          {profiles.map((p) => (
            <button
              key={p.id}
              className="btn ghost"
              style={{ fontSize: '0.9rem', padding: '8px 16px' }}
              onClick={() => (wrongCount(p) > 0 ? onReview(p.id) : onStats(p.id))}
              title={wrongCount(p) > 0 ? '错题重练' : '暂无错题'}
            >
              {wrongCount(p) > 0 ? `📝 ${p.name} 错题重练(${wrongCount(p)})` : `🏆 ${p.name} 的成就`}
            </button>
          ))}
        </div>
      )}

      {adding && (
        <Modal onClose={() => setAdding(false)}>
          <h3 style={{ margin: '0 0 4px' }}>新的小勇士 🎉</h3>
          <div className="field">
            <label>名字</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="比如：妹妹 / 哥哥" maxLength={8} />
          </div>
          <div className="field">
            <label>选一个伙伴</label>
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
            <button className="btn ghost" style={{ flex: 1 }} onClick={() => setAdding(false)}>
              取消
            </button>
            <button className="btn" style={{ flex: 2 }} onClick={create}>
              开始冒险！
            </button>
          </div>
        </Modal>
      )}

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  )
}
