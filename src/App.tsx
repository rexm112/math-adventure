import { useEffect, useState } from 'react'
import type { DifficultyMode, Grade, Question, SessionSummary } from './types'
import { pickReviewQuestions, useStore } from './store'
import { envConfig } from './config'
import HomePage from './pages/HomePage'
import SetupPage from './pages/SetupPage'
import QuizPage from './pages/QuizPage'
import ResultPage from './pages/ResultPage'
import StatsPage from './pages/StatsPage'

type View =
  | { name: 'home' }
  | { name: 'setup'; profileId: string }
  | { name: 'quiz'; profileId: string; grade: Grade; topicId?: string; mode?: DifficultyMode; review?: Question[] }
  | { name: 'result'; profileId: string; summary: SessionSummary; earnedBadges: string[]; reviewMode: boolean }
  | { name: 'stats'; profileId: string }

function modeOf(profileId: string): DifficultyMode {
  return useStore.getState().profiles.find((p) => p.id === profileId)?.difficultyMode ?? 'standard'
}

function startReview(profileId: string): View | null {
  const p = useStore.getState().profiles.find((x) => x.id === profileId)
  if (!p) return null
  const qs = pickReviewQuestions(p)
  if (!qs.length) return null
  return { name: 'quiz', profileId, grade: p.grade, review: qs }
}

export default function App() {
  const [view, setView] = useState<View>({ name: 'home' })
  const finishSession = useStore((s) => s.finishSession)

  // 启动时统一云同步：项目级 Token 自动连接（免每台设备配置）；已有连接的设备先拉取合并
  useEffect(() => {
    void (async () => {
      const s = useStore.getState()
      try {
        if (!s.syncCfg && envConfig.syncToken) {
          await s.setupSync(envConfig.syncToken)
          await s.syncNow('pull')
        } else if (s.syncCfg) {
          await s.syncNow('pull')
        }
      } catch {
        /* 网络不佳时跳过，不影响本地使用；下次打开再试 */
      }
    })()
  }, [])

  if (view.name === 'home') {
    return (
      <Shell>
        <HomePage
          onPick={(profileId) => setView({ name: 'setup', profileId })}
          onStats={(profileId) => setView({ name: 'stats', profileId })}
          onReview={(profileId) => setView((v) => startReview(profileId) ?? v)}
        />
      </Shell>
    )
  }

  if (view.name === 'setup') {
    return (
      <Shell>
        <SetupPage
          profileId={view.profileId}
          onBack={() => setView({ name: 'home' })}
          onStart={(grade, topicId) =>
            setView({ name: 'quiz', profileId: view.profileId, grade, topicId, mode: modeOf(view.profileId) })
          }
        />
      </Shell>
    )
  }

  if (view.name === 'quiz') {
    return (
      <QuizPage
        profileId={view.profileId}
        grade={view.grade}
        topicId={view.topicId}
        mode={view.mode}
        review={view.review}
        onExit={() => setView({ name: 'home' })}
        onFinish={(partial, wrongQuestions) => {
          const earned = finishSession(view.profileId, partial, wrongQuestions)
          setView({
            name: 'result',
            profileId: view.profileId,
            earnedBadges: earned,
            reviewMode: view.review !== undefined,
            summary: { ...partial, earnedBadges: earned },
          })
        }}
      />
    )
  }

  if (view.name === 'result') {
    const avatar = useStore.getState().profiles.find((p) => p.id === view.profileId)?.avatar ?? '🧭'
    const isReview = view.reviewMode
    return (
      <Shell>
        <ResultPage
          summary={view.summary}
          earnedBadges={view.earnedBadges}
          profileAvatar={avatar}
          reviewMode={isReview}
          onAgain={() =>
            setView((v) => {
              if (isReview) return startReview(view.profileId) ?? { name: 'home' }
              return {
                name: 'quiz',
                profileId: view.profileId,
                grade: view.summary.grade,
                topicId: view.summary.topicId === 'all' || view.summary.topicId === 'review' ? undefined : view.summary.topicId,
                mode: modeOf(view.profileId),
              }
            })
          }
          onSetup={() => setView({ name: 'setup', profileId: view.profileId })}
          onHome={() => setView({ name: 'home' })}
          onDrill={(grade, topicId) => setView({ name: 'quiz', profileId: view.profileId, grade, topicId, mode: modeOf(view.profileId) })}
        />
      </Shell>
    )
  }

  // stats
  return (
    <Shell>
      <StatsPage
        profileId={view.profileId}
        onBack={() => setView({ name: 'home' })}
        onDrill={(grade, topicId) => setView({ name: 'quiz', profileId: view.profileId, grade, topicId, mode: modeOf(view.profileId) })}
        onReview={() => setView((v) => startReview(view.profileId) ?? v)}
      />
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <main style={{ flex: 1 }}>{children}</main>
      <footer className="muted" style={{ textAlign: 'center', padding: '18px 0 4px', fontSize: '0.75rem' }}>
        数学大冒险 · 人教版小学数学 · 家庭自用
      </footer>
    </div>
  )
}
