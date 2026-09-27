import { useEffect, useRef, useState } from 'react'
import type { DifficultyMode, Grade, Question, QuestionResult, SessionQuestion, SessionSummary, UserInput } from '../types'
import { buildSession } from '../lib/session'
import { checkAnswer } from '../lib/checker'
import { pointsFor, starsFor, streakBonus } from '../lib/scoring'
import { sfx } from '../lib/sound'
import { speak } from '../lib/speech'
import { useStore } from '../store'
import { AnswerPad } from '../components/AnswerPad'
import { Confetti, DiffChip, Modal, ProgressDots, Stars } from '../components/Bits'
import { Figure } from '../figures'
import VoiceExplain from '../components/VoiceExplain'

const CHEERS = ['太棒了！', '真厉害！', '答对啦！', '你就是数学小达人！', '完美！继续加油！']
const ENCOURAGE = ['差一点点，再想想！', '没关系，看看猫头鹰老师的提示再试一次！', '很接近啦，换一个思路试试！', '别急，一步一步来，你可以的！']

interface Props {
  profileId: string
  grade: Grade
  topicId?: string
  mode?: DifficultyMode
  /** 错题重练：直接给定题目，答对后需语音讲思路 */
  review?: Question[]
  onExit: () => void
  onFinish: (summary: Omit<SessionSummary, 'earnedBadges'>, wrongQuestions: Question[]) => void
}

export default function QuizPage({ profileId, grade, topicId, mode, review, onExit, onFinish }: Props) {
  const soundOn = useStore((s) => s.soundOn)
  const markExplained = useStore((s) => s.markExplained)
  const isReview = review !== undefined

  const [questions] = useState<SessionQuestion[]>(() =>
    review ? review.map((q, i) => ({ ...q, no: i + 1 })) : buildSession({ grade, topicId, mode }),
  )
  const [idx, setIdx] = useState(0)
  const q = questions[idx]

  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [hintsShown, setHintsShown] = useState(0)
  const [feedback, setFeedback] = useState<'none' | 'ok' | 'no'>('none')
  const [earnedNow, setEarnedNow] = useState<{ stars: number; points: number; bonus: number } | null>(null)
  const [skippable, setSkippable] = useState(false)
  const [confirmExit, setConfirmExit] = useState(false)
  const [encourage, setEncourage] = useState('')
  const [explainQ, setExplainQ] = useState<Question | null>(null)

  // 权威数据放 ref，避免闭包过期
  const resultsRef = useRef<QuestionResult[]>([])
  const wrongRef = useRef<Question[]>([])
  const pointsRef = useRef(0)
  const streakRef = useRef(0)
  const startRef = useRef(Date.now())
  const stepRef = useRef(false)
  const explainedRef = useRef(false)
  const [display, setDisplay] = useState<{ points: number; streak: number; stars: (number | 'skip' | null)[] }>({
    points: 0,
    streak: 0,
    stars: questions.map(() => null),
  })

  useEffect(() => {
    window.scrollTo({ top: explainQ ? document.body.scrollHeight : 0 })
  }, [idx, explainQ])

  const commitResult = (r: QuestionResult) => {
    resultsRef.current = [...resultsRef.current, r]
    const stars = [...display.stars]
    stars[idx] = r.skipped ? 'skip' : r.stars
    setDisplay({ points: pointsRef.current, streak: streakRef.current, stars })
  }

  const finish = () => {
    const results = resultsRef.current
    const seconds = Math.round((Date.now() - startRef.current) / 1000)
    if (soundOn) sfx.finish()
    onFinish({
      grade,
      topicId: topicId ?? (isReview ? 'review' : 'all'),
      points: pointsRef.current,
      stars: results.reduce((a, r) => a + r.stars, 0),
      total: questions.length,
      firstTryCount: results.filter((r) => r.wrongAttempts === 0 && !r.skipped).length,
      seconds,
      results,
    }, wrongRef.current)
  }

  /** 答对后的下一步：错题重练先讲思路，普通局直接前进 */
  const afterCorrect = () => {
    if (stepRef.current) return
    stepRef.current = true
    const cur = q
    setTimeout(() => {
      stepRef.current = false
      if (isReview && !explainedRef.current) {
        setFeedback('none')
        setEarnedNow(null)
        setExplainQ(cur)
        return
      }
      realAdvance()
    }, 200)
  }

  const realAdvance = () => {
    setExplainQ(null)
    explainedRef.current = false
    if (idx + 1 >= questions.length) finish()
    else {
      setIdx(idx + 1)
      setWrongAttempts(0)
      setHintsShown(0)
      setFeedback('none')
      setEarnedNow(null)
      setSkippable(false)
    }
  }

  const submit = (input: UserInput) => {
    if (feedback === 'ok' || explainQ) return
    if (checkAnswer(q, input)) {
      const firstTry = wrongAttempts === 0 && hintsShown === 0
      const stars = starsFor(wrongAttempts, hintsShown)
      let p = pointsFor(q.difficulty, stars, isReview ? 0.5 : 1)
      let bonus = 0
      if (firstTry && !isReview) {
        streakRef.current += 1
        bonus = streakBonus(streakRef.current)
        p += bonus
      } else {
        streakRef.current = 0
      }
      pointsRef.current += p
      if (soundOn) sfx.correct()
      setEarnedNow({ stars, points: p, bonus })
      setFeedback('ok')
      commitResult({
        questionId: q.id,
        topicId: q.topicId,
        topicName: q.topicName,
        difficulty: q.difficulty,
        stars,
        points: p,
        wrongAttempts,
        hintsUsed: hintsShown,
        skipped: false,
      })
      if (isReview) setTimeout(afterCorrect, 1600)
      else setTimeout(afterCorrect, 1700)
    } else {
      const na = wrongAttempts + 1
      setWrongAttempts(na)
      setFeedback('no')
      setEncourage(ENCOURAGE[(na - 1) % ENCOURAGE.length])
      if (soundOn) sfx.wrong()
      // 记录错题（同题只记一次）
      if (!wrongRef.current.some((w) => w.prompt === q.prompt)) wrongRef.current = [...wrongRef.current, q]
      // 答错自动升级下一条提示；提示全部用完并再错两次后允许跳过（跳过也不给答案）
      if (hintsShown < q.hints.length) setHintsShown(hintsShown + 1)
      if (na >= q.hints.length + 2) setSkippable(true)
      setTimeout(() => setFeedback('none'), 1100)
    }
  }

  const skip = () => {
    if (feedback === 'ok' || explainQ) return
    streakRef.current = 0
    if (soundOn) sfx.wrong()
    if (!wrongRef.current.some((w) => w.prompt === q.prompt)) wrongRef.current = [...wrongRef.current, q]
    commitResult({
      questionId: q.id,
      topicId: q.topicId,
      topicName: q.topicName,
      difficulty: q.difficulty,
      stars: 0,
      points: 0,
      wrongAttempts,
      hintsUsed: hintsShown,
      skipped: true,
    })
    realAdvance()
  }

  const revealHint = () => {
    if (hintsShown < q.hints.length) {
      if (soundOn) sfx.click()
      setHintsShown(hintsShown + 1)
    }
  }

  return (
    <div className="app" style={{ padding: 0 }}>
      {/* 顶栏 */}
      <div className="quiz-top" style={{ padding: '10px 4px 0' }}>
        <button
          className="btn ghost"
          style={{ padding: '6px 12px', fontSize: '0.9rem' }}
          onClick={() => setConfirmExit(true)}
          aria-label="退出练习"
        >
          ✕
        </button>
        <ProgressDots total={questions.length} current={idx} stars={display.stars} />
        <span className="pill" aria-label={`得分 ${display.points}`}>
          🏅 {display.points}
        </span>
        {display.streak >= 2 && (
          <span className="pill" style={{ background: 'var(--amber-soft)', borderColor: 'var(--amber)' }}>
            🔥×{display.streak}
          </span>
        )}
      </div>

      {/* 题目卡 */}
      <div className={`card q-card ${feedback === 'no' ? 'shake' : ''}`} key={q.id}>
        <div className="q-meta">
          <DiffChip d={q.difficulty} />
          <span className="pill" style={{ fontSize: '0.8rem' }}>
            {q.no}/{questions.length} · {isReview ? '错题重练' : q.topicName}
          </span>
          <button
            className="btn ghost"
            style={{ marginLeft: 'auto', padding: '5px 10px', fontSize: '0.85rem' }}
            onClick={() => speak(q.prompt)}
            aria-label="朗读题目"
            type="button"
          >
            🔊
          </button>
        </div>
        {q.figure && (
          <div className="fig-wrap">
            <Figure spec={q.figure} />
          </div>
        )}
        <div className="q-prompt">{q.prompt}</div>
      </div>

      {/* 提示区：答错自动逐条出现，永不透露最终答案 */}
      <div className="hints">
        {hintsShown === 0 ? (
          <div className="hint-row">
            <span className="owl">🦉</span>
            <div>
              <button className="hint-ask" onClick={revealHint} type="button">
                💡 需要一点提示（会少得一点分）
              </button>
            </div>
          </div>
        ) : (
          Array.from({ length: hintsShown }, (_, i) => (
            <div className="hint-row" key={i}>
              <span className="owl">{i === 0 ? '🦉' : ''}</span>
              <div className="hint-bubble">
                <span className="h-no">提示 {i + 1}</span>
                {q.hints[i]}
              </div>
            </div>
          ))
        )}
        {hintsShown > 0 && hintsShown < q.hints.length && (
          <div className="hint-row">
            <span className="owl"></span>
            <button className="hint-ask" onClick={revealHint} type="button">
              💡 再要一条提示
            </button>
          </div>
        )}
        {skippable && feedback !== 'ok' && (
          <div className="hint-row">
            <span className="owl">🦉</span>
            <div className="hint-bubble" style={{ borderColor: 'var(--red)', background: 'var(--red-soft)', color: '#7f1d1d' }}>
              这道题有点难！可以先跳过它（不扣分也不给答案），练完这一局再回来挑战。
            </div>
            <button className="btn ghost" style={{ fontSize: '0.85rem', padding: '8px 12px' }} onClick={skip} type="button">
              先跳过
            </button>
          </div>
        )}
      </div>

      {/* 反馈条 */}
      {feedback === 'ok' && (
        <div className="feedback-bar feedback-ok" role="status">
          {CHEERS[idx % CHEERS.length]} +{earnedNow?.points} 分
          {earnedNow?.bonus ? `（含连对奖励 +${earnedNow.bonus}）` : ''}
        </div>
      )}
      {feedback === 'no' && (
        <div className="feedback-bar feedback-no" role="alert">
          {encourage}
        </div>
      )}

      {/* 错题重练：答对后讲思路 */}
      {explainQ && (
        <VoiceExplain
          q={explainQ}
          onDone={(passed) => {
            markExplained(profileId, explainQ.prompt, passed)
            explainedRef.current = true
            realAdvance()
          }}
        />
      )}

      {/* 输入区（讲解时隐藏） */}
      {!explainQ && (
        <div className="answer-zone">
          <AnswerPad key={q.id} q={q} onSubmit={submit} disabled={feedback === 'ok'} soundOn={soundOn} />
        </div>
      )}

      {/* 答对庆祝层 */}
      {feedback === 'ok' && earnedNow && (
        <div className="overlay" onClick={afterCorrect}>
          <Confetti count={earnedNow.stars === 3 ? 36 : 16} />
          <div className="celebrate-card">
            <div className="big-emoji">{earnedNow.stars === 3 ? '🎉' : earnedNow.stars === 2 ? '👍' : '💪'}</div>
            <div className="stars-big">
              <Stars n={earnedNow.stars} size="big" />
            </div>
            <div className="pt">+{earnedNow.points} 分</div>
            {earnedNow.bonus > 0 && <div className="streak-note">🔥 连对奖励 +{earnedNow.bonus}</div>}
            <p className="muted" style={{ marginTop: 8 }}>
              点击继续 →
            </p>
          </div>
        </div>
      )}

      {/* 退出确认 */}
      {confirmExit && (
        <Modal onClose={() => setConfirmExit(false)}>
          <h3 style={{ marginTop: 0 }}>要结束这一局吗？</h3>
          <p className="muted">
            已完成 {resultsRef.current.length}/{questions.length} 题。可以保存当前进度并结算，也可以继续答题。
          </p>
          <div className="row">
            <button className="btn ghost" style={{ flex: 1 }} onClick={() => setConfirmExit(false)}>
              继续答题
            </button>
            {resultsRef.current.length > 0 ? (
              <button className="btn amber" style={{ flex: 1 }} onClick={finish}>
                保存并结算
              </button>
            ) : (
              <button className="btn danger" style={{ flex: 1 }} onClick={onExit}>
                直接退出
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
