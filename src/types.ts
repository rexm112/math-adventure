// ---------- 核心类型定义 ----------

export type Grade = 1 | 2 | 3 | 4 | 5 | 6

export type Difficulty = 'easy' | 'medium' | 'hard' | 'challenge'

/** 组卷难度档位：标准（5易中+4难+1拓展）/ 进阶 / 挑战 */
export type DifficultyMode = 'standard' | 'advanced' | 'challenge'

/** 错题本条目（题目整体可序列化存储，用于错题重练） */
export interface WrongEntry {
  q: Question
  wrongCount: number
  lastWrongAt: number
  /** 已答对并讲清思路 */
  mastered: boolean
  /** 讲解尝试次数 */
  explainAttempts: number
}

export type QuestionKind = 'calc' | 'concept' | 'word'

export type AnswerType = 'number' | 'choice' | 'fraction' | 'compare' | 'ratio'

/** 分数（n/d，约定 d>0） */
export interface Frac {
  n: number
  d: number
}

/** 比值 a:b（化简比题中要求最简整数比） */
export interface Ratio {
  a: number
  b: number
}

export type Answer = number | Frac | Ratio | string

export type UserInput = number | Frac | Ratio | string

// ---------- 题目图形（SVG） ----------

export type FigureKind =
  | 'counting'      // 实物计数（两组）
  | 'tenFrame'      // 十格阵
  | 'numberline'    // 数轴
  | 'partWhole'     // 总分关系图
  | 'array'         // 点阵（乘法）
  | 'clock'         // 钟面
  | 'money'         // 人民币
  | 'shapeRow'      // 图形规律排列
  | 'ruler'         // 直尺线段
  | 'angle'         // 角
  | 'polygon'       // 多边形（带边/高标注）
  | 'gridRect'      // 方格纸长方形（面积）
  | 'fracBar'       // 分数条
  | 'fracPie'       // 扇形（分数/百分数）
  | 'barModel'      // 条形示意图（应用题）
  | 'barChart'      // 条形统计图
  | 'pieChart'      // 扇形统计图
  | 'box3d'         // 长方体/正方体
  | 'cylinder'      // 圆柱
  | 'cone'          // 圆锥
  | 'circleFig'     // 圆（标注半径/直径）
  | 'balance'       // 天平（方程）
  | 'cubeStack'     // 小正方体堆叠
  | 'rods'          // 小棒（ tens 根数 + ones 根数 ）
  | 'percentGrid'   // 百格图（百分数）

export interface FigureSpec {
  kind: FigureKind
  emoji?: string
  count?: number
  groups?: number[]
  filled?: number
  parts?: number
  rows?: number
  cols?: number
  min?: number
  max?: number
  step?: number
  questionAt?: number
  marks?: { at: number; label?: string }[]
  h?: number
  m?: number
  items?: { value: number; count?: number; unit?: string }[]
  shapes?: string[]
  deg?: number
  showDeg?: boolean
  ptype?: 'rect' | 'square' | 'triangle' | 'parallelogram' | 'trapezoid'
  labels?: Partial<Record<'top' | 'bottom' | 'left' | 'right' | 'height' | 'w' | 'h' | 'd' | 'r', string>>
  showHeight?: boolean
  bars?: { label: string; value?: number; q?: boolean; color?: string }[]
  chartItems?: { label: string; value: number; color?: string }[]
  slices?: { label: string; percent: number; color?: string }[]
  levels?: number[]
  left?: string
  right?: string
  tens?: number
  ones?: number
  cm?: number
  from?: number
  to?: number
  len?: number
  label?: string
}

// ---------- 题目 ----------

export interface Question {
  id: string
  topicId: string
  topicName: string
  grade: Grade
  difficulty: Difficulty
  kind: QuestionKind
  answerType: AnswerType
  /** 题干（支持 \n 换行） */
  prompt: string
  figure?: FigureSpec
  /** choice 题的选项 */
  choices?: string[]
  answer: Answer
  /** 输入框旁的单位提示，如 "厘米" */
  unit?: string
  /** 3-5 条渐进式提示，最后一步永远留给学生完成 */
  hints: string[]
  /** 知识点名称（提示面板展示） */
  concept: string
  /** fraction 题是否要求约成最简分数 */
  requireReduced?: boolean
  /** number 题是否允许小数输入（显示小数点） */
  allowDecimal?: boolean
  /** number 题是否需要负号键 */
  allowNegative?: boolean
}

export interface TopicDef {
  id: string
  grade: Grade
  name: string
  kind: QuestionKind
  difficulties: Difficulty[]
  /** 上/下学期归属（展示用） */
  term?: 1 | 2
  gen: (d: Difficulty, rng: Rng) => Question
}

// ---------- RNG ----------

export interface Rng {
  /** [min, max] 闭区间整数 */
  int(min: number, max: number): number
  float(min: number, max: number): number
  pick<T>(arr: readonly T[]): T
  shuffle<T>(arr: readonly T[]): T[]
  bool(p?: number): boolean
}

// ---------- 一局练习 ----------

export interface SessionQuestion extends Question {
  /** 本局内的序号 */
  no: number
}

export interface QuestionResult {
  questionId: string
  topicId: string
  topicName: string
  difficulty: Difficulty
  /** 1-3 星 */
  stars: number
  /** 本题得分 */
  points: number
  wrongAttempts: number
  hintsUsed: number
  skipped: boolean
}

export interface SessionSummary {
  grade: Grade
  topicId: string
  points: number
  stars: number
  total: number
  firstTryCount: number
  seconds: number
  results: QuestionResult[]
  earnedBadges: string[]
}
