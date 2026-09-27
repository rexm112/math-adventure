// 二年级 · 人教版：100以内加减、表内乘除、有余数除法、混合运算、长度/质量单位、时间、角、万以内数
import type { Difficulty, Rng, TopicDef } from '../types'
import { choicesOf, koujue, makeQ, numChoices, solveHints } from './helpers'

const M = { id: 'g2', grade: 2 as const }

// ---------- 100 以内加减法 ----------
function genAddSub100(d: Difficulty, rng: Rng) {
  if (d === 'easy') {
    const a = rng.int(23, 78)
    const b = rng.pick([10, 20, 30, 40])
    if (rng.bool())
      return makeQ({ ...M, name: '100以内加减法', kind: 'calc' }, d, {
        prompt: `${a} + ${b} = ？`,
        answer: a + b,
        concept: '两位数加整十数',
        hints: [
          '整十数只和"十位"打交道。',
          `先把十位相加：${Math.floor(a / 10)} 个十加 ${b / 10} 个十。`,
          `个位的 ${a % 10} 保持不变。合起来是多少？`,
        ],
      })
    return makeQ({ ...M, name: '100以内加减法', kind: 'calc' }, d, {
      prompt: `${a} - ${b} = ？`,
      answer: a - b,
      concept: '两位数减整十数',
      hints: [
        '减整十数，只在十位上减。',
        `十位：${Math.floor(a / 10)} - ${b / 10} = ？`,
        `个位还是 ${a % 10}，合起来写出得数。`,
      ],
    })
  }
  if (d === 'medium') {
    if (rng.bool()) {
      const a = rng.int(21, 48)
      const b = rng.int(21, 48)
      return makeQ({ ...M, name: '100以内加减法', kind: 'calc' }, d, {
        prompt: `${a} + ${b} = ？`,
        answer: a + b,
        concept: '两位数加两位数（不进位）',
        hints: [
          '列竖式：相同数位对齐，个位和个位相加，十位和十位相加。',
          `个位：${a % 10} + ${b % 10} = ？`,
          `十位：${Math.floor(a / 10)} + ${Math.floor(b / 10)} = ？把两部分合起来。`,
        ],
      })
    }
    const a = rng.int(55, 98)
    const b = rng.int(21, a - 30)
    return makeQ({ ...M, name: '100以内加减法', kind: 'calc' }, d, {
      prompt: `${a} - ${b} = ？`,
      answer: a - b,
      concept: '两位数减两位数（不退位）',
      hints: [
        '列竖式：数位对齐，从个位减起。',
        `个位：${a % 10} - ${b % 10} 够减吗？算一算。`,
        `十位：${Math.floor(a / 10)} - ${Math.floor(b / 10)} = ？合起来就是得数。`,
      ],
    })
  }
  if (d === 'hard') {
    if (rng.bool()) {
      const a = rng.int(25, 58)
      const b = rng.int(35, 78)
      return makeQ({ ...M, name: '100以内加减法', kind: 'calc' }, d, {
        prompt: `${a} + ${b} = ？`,
        answer: a + b,
        concept: '进位加法',
        hints: [
          '个位相加满十，要向十位进 1。',
          `个位：${a % 10} + ${b % 10} = ？满十了吗？`,
          `十位相加后，别忘加进上来的 1。完整算出得数。`,
        ],
      })
    }
    const a = rng.int(52, 94)
    const b = rng.int(37, 49)
    return makeQ({ ...M, name: '100以内加减法', kind: 'calc' }, d, {
      prompt: `${a} - ${b} = ？`,
      answer: a - b,
      concept: '退位减法',
      hints: [
        '个位不够减，向十位借 1 当 10。',
        `个位：${a % 10} - ${b % 10} 不够减，先算 10 + ${a % 10} - ${b % 10}。`,
        `十位被借走 1 后再减。算出最后的得数。`,
      ],
    })
  }
  // challenge：逆运算填空
  if (rng.bool()) {
    const a = rng.int(26, 55)
    const ans = rng.int(25, 55)
    return makeQ({ ...M, name: '100以内加减法', kind: 'calc' }, d, {
      prompt: `${a} + □ = ${a + ans}，□ 里填几？`,
      answer: ans,
      concept: '加减逆运算',
      hints: [
        '□ 是一个未知的加数：和减去已知加数就是它。',
        `列式：${a + ans} - ${a} = ？`,
        `也可以想：从 ${a} 出发，再数多少能到 ${a + ans}？`,
      ],
    })
  }
  const a = rng.int(62, 95)
  const ans = rng.int(18, 45)
  return makeQ({ ...M, name: '100以内加减法', kind: 'calc' }, d, {
    prompt: `□ - ${ans} = ${a - ans}，□ 里填几？`,
    answer: a,
    concept: '被减数未知',
    hints: [
      '□ 是被减数：差 + 减数 = 被减数。',
      `列式：${a - ans} + ${ans} = ？`,
      '验算：算出的数减去减数，看看是不是等于差。',
    ],
  })
}

// ---------- 表内乘法 ----------
function genMult(d: Difficulty, rng: Rng) {
  if (d === 'easy') {
    const r = rng.int(2, 5)
    const c = rng.int(2, 5)
    const item = rng.pick(['🔵', '🍪', '🌸'])
    return makeQ({ ...M, name: '表内乘法', kind: 'calc' }, d, {
      prompt: `每行摆 ${c} 个，摆了 ${r} 行，一共有多少个？`,
      figure: { kind: 'array', rows: r, cols: c, emoji: item },
      answer: r * c,
      unit: '个',
      concept: '乘法是相同加数的简便运算',
      hints: [
        `每行 ${c} 个，共 ${r} 行，就是 ${c} 连加 ${r} 次。`,
        `用乘法算：${c} × ${r} 或 ${r} × ${c}。`,
        `想口诀：${koujue(c, r)}。口诀的后半句就是得数！`,
      ],
    })
  }
  if (d === 'medium') {
    const a = rng.int(3, 9)
    const b = rng.int(4, 9)
    return makeQ({ ...M, name: '表内乘法', kind: 'calc' }, d, {
      prompt: `${a} × ${b} = ？`,
      answer: a * b,
      concept: '乘法口诀',
      hints: [
        `想 ${a} 和 ${b} 的乘法口诀，从小的那个数开始背。`,
        `完整口诀是：${koujue(a, b)}。`,
        '口诀后半句说的数，就是这两个数的积。',
      ],
    })
  }
  if (d === 'hard') {
    // 乘加 / 乘减
    const r = rng.int(3, 5)
    const c = rng.int(3, 5)
    const extra = rng.int(1, 3)
    const sub = rng.bool()
    const item = rng.pick(['⭐', '🍭', '🚗'])
    if (sub) {
      return makeQ({ ...M, name: '表内乘法', kind: 'calc' }, d, {
        prompt: `盒子摆成 ${r} 行，每行 ${c} 个${item === '⭐' ? '星星' : item === '🍭' ? '糖果' : '小汽车'}，拿走了 ${r} 个，还剩多少个？`,
        figure: { kind: 'array', rows: r, cols: c, emoji: item },
        answer: r * c - r,
        unit: '个',
        concept: '乘减两步',
        hints: [
          '先算盒子里一共有多少个（用乘法）。',
          `第一步：${c} × ${r} = ？`,
          `第二步：再减去拿走的 ${r} 个。最后得多少？`,
        ],
      })
    }
    return makeQ({ ...M, name: '表内乘法', kind: 'calc' }, d, {
      prompt: `每行 ${c} 个，摆满 ${r} 行，另外还有 ${extra} 个，一共有多少个？`,
      figure: { kind: 'array', rows: r, cols: c, emoji: item },
      answer: r * c + extra,
      unit: '个',
      concept: '乘加两步',
      hints: [
        '整整齐齐的部分用乘法算，零散的另外加。',
        `第一步：${c} × ${r} = ？`,
        `第二步：再加上零散的 ${extra} 个，一共多少？`,
      ],
    })
  }
  // challenge
  if (rng.bool()) {
    const b = rng.int(4, 9)
    const q = rng.int(4, 9)
    const prod = b * q
    return makeQ({ ...M, name: '表内乘法', kind: 'calc' }, d, {
      prompt: `□ × ${b} = ${prod}，□ 里填几？`,
      answer: q,
      concept: '口诀逆用',
      hints: [
        `想：${b} 的乘法口诀里，哪一句的积正好是 ${prod}？`,
        `把 ${b} 的口诀顺着背一遍：一乘${b}、二乘${b}、三乘${b}……乘到几的时候积是 ${prod}？`,
        `完整口诀：${koujue(q, b)}。口诀前两个字里就有 □ 的答案。`,
      ],
    })
  }
  const n = rng.int(5, 8)
  return makeQ({ ...M, name: '表内乘法', kind: 'word' }, d, {
    prompt: `摆一个独立的正方形要 4 根小棒，摆 ${n} 个这样独立的正方形，一共要多少根小棒？`,
    answer: 4 * n,
    unit: '根',
    concept: '乘法应用',
    hints: solveHints({
      concept: '每份数 × 份数 = 总数',
      knowns: ['摆 1 个正方形要 4 根小棒', `要摆 ${n} 个独立的正方形`],
      ask: '一共要多少根小棒',
      method: '每个正方形都用同样多的小棒，是"求几个几"，用乘法。',
      setup: `列式：4 × ${n} = ？`,
    }),
  })
}

// ---------- 表内除法 ----------
function genDiv(d: Difficulty, rng: Rng) {
  if (d === 'easy') {
    const b = rng.int(3, 6)
    const q = rng.int(2, 6)
    const item = rng.pick(['🍰', '🎈', '🧩'])
    return makeQ({ ...M, name: '表内除法', kind: 'word' }, d, {
      prompt: `${b * q} 个礼物平均分给 ${b} 个小朋友，每人分到几个？`,
      figure: { kind: 'counting', emoji: item, groups: [b * q] },
      answer: q,
      unit: '个',
      concept: '平均分用除法',
      hints: solveHints({
        concept: '把总数平均分成几份，求每份是多少',
        knowns: [`一共有 ${b * q} 个`, `平均分给 ${b} 个小朋友`],
        ask: '每人分到几个',
        method: '"平均分"就是每人一样多，用除法。',
        setup: `列式：${b * q} ÷ ${b} = ？`,
      }),
    })
  }
  if (d === 'medium') {
    const b = rng.int(4, 9)
    const q = rng.int(4, 9)
    return makeQ({ ...M, name: '表内除法', kind: 'calc' }, d, {
      prompt: `${b * q} ÷ ${b} = ？`,
      answer: q,
      concept: '用口诀求商',
      hints: [
        `想：${b} 和几相乘得 ${b * q}？`,
        `背口诀：${koujue(b, q)}。`,
        '口诀里缺的那个数就是商。',
      ],
    })
  }
  if (d === 'hard') {
    if (rng.bool()) {
      const b = rng.int(4, 9)
      const q = rng.int(4, 9)
      return makeQ({ ...M, name: '表内除法', kind: 'calc' }, d, {
        prompt: `${b * q} ÷ □ = ${q}，□ 里填几？`,
        answer: b,
        concept: '除法算式中的除数',
        hints: [
          '除数是"每份几个"或"分成几份"里的那个数。',
          `想口诀：几和 ${q} 相乘得 ${b * q}？`,
          `相关口诀：${koujue(b, q)}。另一个数字就是 □。`,
        ],
      })
    }
    const b = rng.int(3, 9)
    const q = rng.int(3, 9)
    return makeQ({ ...M, name: '表内除法', kind: 'concept' }, d, {
      prompt: `${b * q} 里面有几个 ${b}？`,
      answer: q,
      unit: '个',
      concept: '包含除',
      hints: [
        '"里面有几个几"就是问：能一份一份地分出多少份。',
        `列式：${b * q} ÷ ${b} = ？`,
        `想口诀：${koujue(b, q)}。`,
      ],
    })
  }
  // challenge：乘除逆推
  const b = rng.int(6, 9)
  const q = rng.int(5, 9)
  return makeQ({ ...M, name: '表内除法', kind: 'concept' }, d, {
    prompt: `一道除法算式，除数是 ${b}，商是 ${q}，被除数是几？`,
    answer: b * q,
    concept: '被除数、除数、商的关系',
    hints: [
      '被除数 = 除数 × 商（除法是乘法的逆运算）。',
      `列式：${b} × ${q} = ？`,
      `验算：算出的数 ÷ ${b}，商是不是 ${q}？`,
    ],
  })
}

// ---------- 有余数的除法 ----------
function genRemainder(d: Difficulty, rng: Rng) {
  if (d === 'medium') {
    const b = rng.int(4, 8)
    const q = rng.int(2, 4)
    const r = rng.int(1, b - 1)
    const a = b * q + r
    return makeQ({ ...M, name: '有余数的除法', kind: 'word' }, d, {
      prompt: `${a} 颗糖，每 ${b} 颗装一袋，最多能装满几袋？`,
      answer: q,
      unit: '袋',
      concept: '有余数除法（装满问题）',
      hints: solveHints({
        concept: '每几个一份地分，能分几份',
        knowns: [`共 ${a} 颗糖`, `每 ${b} 颗装一袋`],
        ask: '最多装满几袋',
        method: '"每几个一份"用除法，装不满一袋的不算。',
        setup: `列式：${a} ÷ ${b} = ？……？`,
        first: `商就是能装满的袋数，余数是剩下不够一袋的颗数`,
      }),
    })
  }
  if (d === 'hard') {
    const b = rng.int(5, 9)
    return makeQ({ ...M, name: '有余数的除法', kind: 'concept' }, d, {
      prompt: `□ ÷ ${b} = 4 …… □，余数最大是几？`,
      answer: b - 1,
      concept: '余数与除数的关系',
      hints: [
        '余数有个重要规矩：余数一定要比除数小。',
        `除数是 ${b}，余数可以是 1、2、3……最大到几还比 ${b} 小？`,
        `比 ${b} 小的最大整数，就是 ${b} 前面紧挨着的那个数。`,
      ],
    })
  }
  // challenge：进一法
  const b = rng.pick([6, 8, 9])
  const q = rng.int(3, 5)
  const r = rng.int(1, b - 1)
  const a = b * q + r
  return makeQ({ ...M, name: '有余数的除法', kind: 'word' }, d, {
    prompt: `有 ${a} 个小朋友坐船，每条船最多坐 ${b} 人，全部人都要出海，至少要租几条船？`,
    answer: q + 1,
    unit: '条',
    concept: '进一法',
    hints: solveHints({
      concept: '"至少要几"的问题：剩下的也不能丢下',
      knowns: [`共 ${a} 人`, `每条船最多坐 ${b} 人`],
      ask: '至少要租几条船',
      method: '先用除法算出坐满几条船，剩下的人哪怕只有 1 个，也要再租一条。',
      setup: `第一步：${a} ÷ ${b}，商是几、余几？`,
      first: '余下的人坐不满一条船，但也必须有一条船',
    }),
  })
}

// ---------- 混合运算 ----------
function genMixed(d: Difficulty, rng: Rng) {
  if (d === 'hard') {
    const a = rng.pick([30, 40, 50, 60])
    const b = rng.int(3, 6)
    const c = b * rng.int(3, 6)
    return makeQ({ ...M, name: '混合运算', kind: 'calc' }, d, {
      prompt: `${a} - ${c} ÷ ${b} = ？`,
      answer: a - c / b,
      concept: '先乘除后加减',
      hints: [
        '混合运算的顺序：先乘除，后加减。',
        `第一步：先算 ${c} ÷ ${b} = ？`,
        `第二步：用 ${a} 减去第一步的得数。算出最终结果。`,
      ],
    })
  }
  // challenge：带小括号
  const div = rng.pick([2, 4, 5, 8])
  const q = rng.int(4, 12)
  const b = rng.int(20, 40)
  const diff = div * q
  const a = diff + b
  const add = rng.int(10, 30)
  return makeQ({ ...M, name: '混合运算', kind: 'calc' }, d, {
    prompt: `(${a} - ${b}) ÷ ${div} + ${add} = ？`,
    answer: q + add,
    concept: '带小括号的混合运算',
    hints: [
      '运算顺序口诀：先括号里，再乘除，后加减。',
      `第一步：${a} - ${b} = ？`,
      `第二步：得数 ÷ ${div} = ？第三步：再加上 ${add}。一步步算到底。`,
    ],
  })
}

// ---------- 长度单位 ----------
function genLength(d: Difficulty, rng: Rng) {
  if (d === 'easy') {
    const cm = rng.int(5, 9)
    const from = rng.int(0, 4)
    const to = from + cm > 12 ? 12 : from + cm
    return makeQ({ ...M, name: '长度单位', kind: 'concept' }, d, {
      prompt: '看直尺，红线段长多少厘米？',
      figure: { kind: 'ruler', cm: 12, from, to },
      answer: to - from,
      unit: '厘米',
      concept: '用直尺测量长度',
      hints: [
        '量长度要看线段两端对着哪两个刻度。',
        `起点对着的刻度是 ${from}，不是 0 的时候不能直接读终点刻度哦。`,
        `计算：终点刻度 - 起点刻度 = ${to} - ${from} = ？`,
      ],
    })
  }
  if (d === 'medium') {
    const bank: [string, number, string][] = [
      ['1 米 = 多少厘米？', 100, '1 米 = 100 厘米，这是米和厘米的桥梁'],
      ['100 厘米 = 多少米？', 1, '100 厘米正好凑成 1 米'],
      ['1 米 = 多少分米？', 10, '1 分米 = 10 厘米，1 米里有 10 个 10 厘米'],
    ]
    const [p, ans, h] = rng.pick(bank)
    return makeQ({ ...M, name: '长度单位', kind: 'concept' }, d, {
      prompt: p,
      answer: ans,
      concept: '长度单位换算',
      hints: ['相邻长度单位之间的进率要记牢：1 米 = 10 分米 = 100 厘米。', h + '。', '按进率换算，直接得出得数。'],
    })
  }
  // hard：单位比较
  const cmVals = [95, 60, 120, 45, 300]
  const meters = [1, 2, 3]
  const cm = rng.pick(cmVals)
  const m = rng.pick(meters)
  const ans = cm > m * 100 ? '>' : cm < m * 100 ? '<' : '='
  return makeQ({ ...M, name: '长度单位', kind: 'concept' }, d, {
    prompt: `${cm} 厘米 〇 ${m} 米（在〇里填 >、< 或 =）`,
    answer: ans,
    concept: '统一单位再比较',
    hints: [
      '单位不同的两个数不能直接比大小，要先统一单位。',
      `把 ${m} 米换成厘米：1 米 = 100 厘米，所以 ${m} 米 = ${m * 100} 厘米。`,
      `现在比较 ${cm} 和 ${m * 100}，哪个大？`,
    ],
  })
}

// ---------- 认识时间 ----------
function genTime(d: Difficulty, rng: Rng) {
  if (d === 'easy') {
    const h = rng.int(1, 12)
    const m = rng.int(0, 11) * 5
    const correct = `${h}时${m === 0 ? '整' : m + '分'}`
    const wrongs = [`${h === 12 ? 1 : h + 1}时${m + '分'}`, `${h}时${m === 0 ? 5 : m - 5}分`, `${h}时${(m + 10) % 60}分`]
    const { choices, answer } = choicesOf(rng, correct, wrongs)
    return makeQ({ ...M, name: '认识时间', kind: 'concept' }, d, {
      prompt: '看钟面，现在是什么时间？',
      figure: { kind: 'clock', h, m },
      choices,
      answer,
      concept: '几时几分',
      hints: [
        '时针走过几，就是几时；分针从 12 走过几大格，就是几个 5 分钟。',
        `时针刚走过 ${h}，所以是 ${h} 时多。`,
        `分针指着 ${m / 5}，一大格 5 分钟：5 × ${m / 5} = ？分`,
      ],
    })
  }
  if (d === 'medium') {
    const h = rng.int(1, 10)
    const m = rng.int(0, 11) * 5
    const add = rng.pick([10, 15, 20])
    const total = h * 60 + m + add
    const nh = Math.floor(total / 60)
    const nm = total % 60
    const correct = `${nh}时${nm}分`
    const wrongs = [`${h}时${m + add}分`, `${nh}时${nm === 0 ? 5 : nm - 5}分`, `${nh + 1}时${nm}分`]
    const { choices, answer } = choicesOf(rng, correct, wrongs)
    return makeQ({ ...M, name: '认识时间', kind: 'concept' }, d, {
      prompt: `现在是 ${h} 时${m === 0 ? '整' : m + '分'}，再过 ${add} 分钟是几时几分？`,
      figure: { kind: 'clock', h, m },
      choices,
      answer,
      concept: '经过时间',
      hints: [
        `先算分钟：${m} + ${add} = ？`,
        '如果满 60 分，就要去掉 60 分、向"时"进 1。',
        '不满 60 分，时不变、分相加。写出新的时刻。',
      ],
    })
  }
  // hard：分针走了多少分
  const n = rng.int(4, 10)
  return makeQ({ ...M, name: '认识时间', kind: 'concept' }, d, {
    prompt: `分针从 12 走到 ${n}，走了多少分钟？`,
    figure: { kind: 'clock', h: 12, m: n * 5 },
    answer: n * 5,
    unit: '分',
    concept: '分针与分钟数',
    hints: [
      '分针走 1 大格是 5 分钟。',
      `分针从 12 走到 ${n}，走了 ${n} 个大格。`,
      `列式：5 × ${n} = ？`,
    ],
  })
}

// ---------- 角的初步认识 ----------
const ANGLE_NAMES: [number, string][] = [
  [30, '锐角'],
  [45, '锐角'],
  [60, '锐角'],
  [90, '直角'],
  [120, '钝角'],
  [135, '钝角'],
  [150, '钝角'],
]
function genAngle(d: Difficulty, rng: Rng) {
  if (d === 'easy') {
    const [deg, name] = rng.pick(ANGLE_NAMES)
    const { choices, answer } = choicesOf(rng, name, ['锐角', '直角', '钝角'].filter((n) => n !== name))
    return makeQ({ ...M, name: '角的初步认识', kind: 'concept' }, d, {
      prompt: '看图，这是什么角？',
      figure: { kind: 'angle', deg, showDeg: true },
      choices,
      answer,
      concept: '角的分类',
      hints: [
        '三种角按大小分：锐角最小，直角是方方正正的，钝角最大。',
        '直角永远是 90°；比 90° 小是锐角，比 90° 大（比 180° 小）是钝角。',
        `图中标的是 ${deg}°，跟 90° 比一比：谁大？`,
      ],
    })
  }
  if (rng.bool()) {
    return makeQ({ ...M, name: '角的初步认识', kind: 'concept' }, d, {
      prompt: '一张长方形纸有 4 个角，沿直线剪去 1 个角后，剩下的图形有几个角？',
      answer: 5,
      unit: '个',
      concept: '角的变化',
      hints: [
        '别急着心算，拿一张纸真的剪一剪、画一画。',
        '剪去一个角时，剪口会形成"一条新边"，新边两头各产生一个新角。',
        '原来 4 个角少了 1 个、多了 2 个新角，数一数一共几个？',
      ],
    })
  }
  return makeQ({ ...M, name: '角的初步认识', kind: 'concept' }, d, {
    prompt: '长方形的 4 个角都是什么角？',
    answer: 90,
    unit: '度',
    concept: '长方形的角',
    hints: [
      '长方形方方正正，四个角一样大。',
      '可以用三角尺的直角去比一比，完全重合。',
      '直角就是 90°，所以每个角都是多少度？',
    ],
  })
}

// ---------- 万以内数 · 克与千克 ----------
function genPlace(d: Difficulty, rng: Rng) {
  if (d === 'easy') {
    const q = rng.int(1, 8)
    const b = rng.int(1, 8)
    const s = rng.int(1, 8)
    return makeQ({ ...M, name: '万以内数的认识', kind: 'calc' }, d, {
      prompt: `${q} 个千、${b} 个百、${s} 个十组成的数是多少？`,
      answer: q * 1000 + b * 100 + s * 10,
      concept: '按数位写数',
      hints: [
        '几个千就在千位写几，几个百在百位写几，几个十在十位写几。',
        `千位 ${q}、百位 ${b}、十位 ${s}，个位一个也没有，写 0。`,
        '从高位到低位依次写出这四个数字。',
      ],
    })
  }
  if (d === 'medium') {
    if (rng.bool()) {
      const { a, b } = { a: rng.int(100, 999), b: rng.int(1000, 9999) }
      const ans = a > b ? '>' : a < b ? '<' : '='
      return makeQ({ ...M, name: '万以内数的认识', kind: 'concept' }, d, {
        prompt: `${a} 〇 ${b}（在〇里填 >、< 或 =）`,
        answer: ans,
        concept: '比较数的大小',
        hints: [
          '先比位数：位数多的数大。',
          `${a} 是三位数，${b} 是四位数，四位数一定比三位数大。`,
          '位数相同才从最高位比起。这里谁大？',
        ],
      })
    }
    return makeQ({ ...M, name: '万以内数的认识', kind: 'concept' }, d, {
      prompt: '从右边起，第三位是什么数位？',
      answer: 2,
      choices: ['个位', '十位', '百位', '千位'],
      concept: '数位顺序',
      hints: [
        '数位顺序从右边起：个位、十位、百位、千位……',
        '右边第一位是个位，往后依次加一位。',
        '第三位就是"百"所在的位置。',
      ],
    })
  }
  // hard：克与千克
  if (rng.bool()) {
    return makeQ({ ...M, name: '克与千克', kind: 'concept' }, d, {
      prompt: '1 千克 = 多少克？',
      answer: 1000,
      unit: '克',
      concept: '质量单位进率',
      hints: ['克和千克之间的进率是 1000。', '1 千克 = 1000 克。', '按进率直接写出得数。'],
    })
  }
  const g = rng.pick([1500, 2400, 800, 3200, 999])
  const kg = rng.pick([1, 2, 3])
  const ans = g > kg * 1000 ? '>' : g < kg * 1000 ? '<' : '='
  return makeQ({ ...M, name: '克与千克', kind: 'concept' }, d, {
    prompt: `${g} 克 〇 ${kg} 千克（在〇里填 >、< 或 =）`,
    answer: ans,
    concept: '统一单位再比较',
    hints: [
      '克和千克单位不同，先统一单位再比。',
      `${kg} 千克 = ${kg * 1000} 克。`,
      `现在比较 ${g} 和 ${kg * 1000}，哪个大？`,
    ],
  })
}

export const G2_TOPICS: TopicDef[] = [
  { id: 'g2-addsub100', grade: 2, name: '100以内加减法', kind: 'calc', difficulties: ['easy', 'medium', 'hard', 'challenge'], term: 1, gen: genAddSub100 },
  { id: 'g2-mult', grade: 2, name: '表内乘法', kind: 'calc', difficulties: ['easy', 'medium', 'hard', 'challenge'], term: 1, gen: genMult },
  { id: 'g2-div', grade: 2, name: '表内除法', kind: 'calc', difficulties: ['easy', 'medium', 'hard', 'challenge'], term: 2, gen: genDiv },
  { id: 'g2-remainder', grade: 2, name: '有余数的除法', kind: 'word', difficulties: ['medium', 'hard', 'challenge'], term: 2, gen: genRemainder },
  { id: 'g2-mixed', grade: 2, name: '混合运算', kind: 'calc', difficulties: ['hard', 'challenge'], term: 2, gen: genMixed },
  { id: 'g2-length', grade: 2, name: '长度单位', kind: 'concept', difficulties: ['easy', 'medium', 'hard'], term: 1, gen: genLength },
  { id: 'g2-time', grade: 2, name: '认识时间', kind: 'concept', difficulties: ['easy', 'medium', 'hard'], term: 1, gen: genTime },
  { id: 'g2-angle', grade: 2, name: '角的初步认识', kind: 'concept', difficulties: ['easy', 'medium'], term: 1, gen: genAngle },
  { id: 'g2-place', grade: 2, name: '万以内数·克千克', kind: 'concept', difficulties: ['easy', 'medium', 'hard'], term: 2, gen: genPlace },
]
