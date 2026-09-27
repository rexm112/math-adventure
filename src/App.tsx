import { useState } from 'react'
import type { Grade, SessionSummary } from './types'
import { useStore } from './store'
import HomePage from './pages/HomePage'
import SetupPage from './pages/SetupPage'
import QuizPage from './pages/QuizPage'
import ResultPage from './pages/ResultPage'
import StatsPage from './pages/StatsPage'

type View =
  | { name: 'home' }
  | { name: 'setup'; profileId: string }
  | { name: 'quiz'; profileId: string; grade: Grade; topicId?: string }
  | { name: 'result'; profileId: string; summary: SessionSummary; earnedBadges: string[] }
  | { name: 'stats'; profileId: string }

export default function App() {
  const [view, setView] = useState<View>({ name: 'home' })
  const finishSession = useStore((s) => s.finishSession)

  if (view.name === 'home') {
    return (
      <Shell>
        <HomePage onPick={(profileId) => setView({ name: 'setup', profileId })} onStats={(profileId) => setView({ name: 'stats', profileId })} />
      </Shell>
    )
  }

  if (view.name === 'setup') {
    return (
      <Shell>
        <SetupPage
          profileId={view.profileId}
          onBack={() => setView({ name: 'home' })}
          onStart={(grade, topicId) => setView({ name: 'quiz', profileId: view.profileId, grade, topicId })}
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
        onExit={() => setView({ name: 'home' })}
        onFinish={(partial) => {
          const earned = finishSession(view.profileId, partial)
          setView({
            name: 'result',
            profileId: view.profileId,
            earnedBadges: earned,
            summary: { ...partial, earnedBadges: earned },
          })
        }}
      />
    )
  }

  if (view.name === 'result') {
    const avatar = useStore.getState().profiles.find((p) => p.id === view.profileId)?.avatar ?? '🧭'
    return (
      <Shell>
        <ResultPage
          summary={view.summary}
          earnedBadges={view.earnedBadges}
          profileAvatar={avatar}
          onAgain={() => setView({ name: 'quiz', profileId: view.profileId, grade: view.summary.grade, topicId: view.summary.topicId === 'all' ? undefined : view.summary.topicId })}
          onSetup={() => setView({ name: 'setup', profileId: view.profileId })}
          onHome={() => setView({ name: 'home' })}
          onDrill={(grade, topicId) => setView({ name: 'quiz', profileId: view.profileId, grade, topicId })}
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
        onDrill={(grade, topicId) => setView({ name: 'quiz', profileId: view.profileId, grade, topicId })}
      />
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <main style={{ flex: 1 }}>{children}</main>
      <footer className="muted" style={{ textAlign: 'center', padding: '18px 0 4px', fontSize: '0.75rem' }}>
        数学大冒险 · 人教版小学数学 · 深圳自用
      </footer>
    </div>
  )
}
