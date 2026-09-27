import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { topicsOfGrade } from '../generators'
import type { Grade } from '../types'

export default function SetupPage({
  profileId,
  onStart,
  onBack,
}: {
  profileId: string
  onStart: (grade: Grade, topicId?: string) => void
  onBack: () => void
}) {
  const profile = useStore((s) => s.profiles.find((p) => p.id === profileId))
  const [grade, setGrade] = useState<Grade>(profile?.grade ?? 1)
  const [topicId, setTopicId] = useState<string | undefined>(undefined)

  const topics = useMemo(() => topicsOfGrade(grade), [grade])
  const t1 = topics.filter((t) => t.term !== 2)
  const t2 = topics.filter((t) => t.term === 2)
  const selected = topics.find((t) => t.id === topicId)

  return (
    <div>
      <div className="quiz-top">
        <button className="btn ghost" style={{ padding: '8px 14px', fontSize: '0.95rem' }} onClick={onBack}>
          ← 返回
        </button>
        <div className="pill" style={{ marginLeft: 'auto' }}>
          {profile?.avatar} {profile?.name}
        </div>
      </div>

      <div className="card" style={{ marginTop: 10 }}>
        <h3 style={{ margin: '0 0 10px' }}>📚 选择年级</h3>
        <div className="grade-pick">
          {[1, 2, 3, 4, 5, 6].map((g) => (
            <button
              key={g}
              className={g === grade ? 'on' : ''}
              onClick={() => {
                setGrade(g as Grade)
                setTopicId(undefined)
              }}
              type="button"
            >
              {g} 年级
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <h3 style={{ margin: '0 0 4px' }}>🎯 练习内容</h3>
        <p className="muted" style={{ margin: '0 0 12px' }}>综合练习会从本年级各主题随机组卷；也可以选一个专项。</p>
        <div className="topic-chips">
          <button className={topicId === undefined ? 'on' : ''} onClick={() => setTopicId(undefined)} type="button">
            🌈 综合练习
          </button>
        </div>
        <div className="term-title">上学期</div>
        <div className="topic-chips">
          {t1.map((t) => (
            <button key={t.id} className={topicId === t.id ? 'on' : ''} onClick={() => setTopicId(t.id)} type="button">
              {t.name}
            </button>
          ))}
        </div>
        <div className="term-title">下学期</div>
        <div className="topic-chips">
          {t2.map((t) => (
            <button key={t.id} className={topicId === t.id ? 'on' : ''} onClick={() => setTopicId(t.id)} type="button">
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <button className="btn big green" onClick={() => onStart(grade, topicId)}>
          🚀 开始练习
          {selected ? ` · ${selected.name}` : ` · ${grade}年级综合`}
        </button>
      </div>
    </div>
  )
}
