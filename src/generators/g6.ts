// 六年级 · 人教版：分数乘除法、比、圆、百分数（互化/折扣/利率）、比例、圆柱圆锥、负数、数与形
import type { Difficulty, Rng, TopicDef } from '../types'
import { choicesOf, makeQ, solveHints } from './helpers'
import { gcd, reduceFrac } from '../lib/math'

const M = { id: 'g6', grade: 6 as const }
const PI = 3.14

// ---------- 分数乘法 ----------
function genFracMult(d: Difficulty, rng: Rng) {
  if (d === 'easy') {
    const pairs: [number, number, number][] = [
      [3, 8, 2],
      [2, 9, 3],
      [4, 7, 2],
      [5, 6, 3],
      [2, 5, 2],
      [3, 10, 5],
    ]
    const [n, dd, k] = rng.pick(pairs)
    const ans = reduceFrac(n * k, dd)
    return makeQ({ ...M, name: '分数乘法', kind: 'calc' }, d, {
      prompt: `${n}/${dd} × ${k} = ？（结果化成最简分数）`,
      answer: ans,
      requireReduced: true,
      concept: '分数乘整数',
      hints: [
        '分数乘整数：分子和整数相乘，分母不变。',
        `先算 ${n} × ${k} = ？分母还是 ${dd}。`,
        `再看能不能约分：${n * k} 和 ${dd} 的最大公因数是 ${gcd(n * k, dd)}，化成最简分数。`,
      ],
    })
  }
  if (d === 'medium') {
    const pairs: [number, number, number, number][] = [
      [2, 3, 3, 4],
      [3, 5, 5, 6],
      [2, 7, 3, 4],
      [4, 9, 3, 8],
      [5, 8, 2, 5],
      [3, 4, 2, 9],
    ]
    const [a1, b1, a2, b2] = rng.pick(pairs)
    const ans = reduceFrac(a1 * a2, b1 * b2)
    return makeQ({ ...M, name: '分数乘法', kind: 'calc' }, d, {
      prompt: `${a1}/${b1} × ${a2}/${b2} = ？（能约分的先约分，结果化简）`,
      answer: ans,
      requireReduced: true,
      concept: '分数乘分数',
      hints: [
        '分数乘分数：分子乘分子，分母乘分母。',
        '计算前先约分更简单：能整除的分子和分母先划掉。',
        `算出 ${a1 * a2}/${b1 * b2} 后，约成最简分数（最大公因数 ${gcd(a1 * a2, b1 * b2)}）。`,
      ],
    })
  }
  if (d === 'hard') {
    // 求一个数的几分之几（数字搭配保证整除）
    const tuples: [number, number, number][] = [
      [30, 2, 5],
      [40, 2, 5],
      [45, 3, 5],
      [60, 3, 5],
      [60, 1, 4],
      [80, 3, 4],
      [40, 3, 4],
      [30, 1, 2],
      [80, 1, 4],
    ]
    const [total, n, dd] = rng.pick(tuples)
    return makeQ({ ...M, name: '分数乘法', kind: 'word' }, d, {
      prompt: `${total} 米长的绳子，用去了全长的 ${n}/${dd}，用去了多少米？`,
      figure: { kind: 'fracBar', parts: dd, filled: n },
      answer: (total * n) / dd,
      unit: '米',
      concept: '求一个数的几分之几',
      hints: solveHints({
        concept: '求一个数的几分之几，用乘法',
        knowns: [`绳子长 ${total} 米`, `用去全长的 ${n}/${dd}`],
        ask: '用去多少米',
        method: `把 ${total} 米平均分成 ${dd} 份，用掉其中 ${n} 份。`,
        setup: `列式：${total} × ${n}/${dd} = ？`,
      }),
    })
  }
  // challenge：剩余问题（数字搭配保证整除）
  const tuples2: [number, number, number][] = [
    [20, 1, 4],
    [20, 1, 5],
    [20, 2, 5],
    [20, 3, 5],
    [20, 3, 10],
    [15, 1, 3],
    [15, 2, 3],
    [10, 1, 5],
  ]
  const [total, used, usedOf] = rng.pick(tuples2)
  const rest = reduceFrac(usedOf - used, usedOf)
  return makeQ({ ...M, name: '分数乘法', kind: 'word' }, d, {
    prompt: `一桶油重 ${total} 千克，第一周用去 ${used}/${usedOf}，剩下的第二周用完，第二周用了多少千克？`,
    figure: { kind: 'fracBar', parts: usedOf, filled: usedOf - used },
    answer: (total * (usedOf - used)) / usedOf,
    unit: '千克',
    concept: '先求剩下几分之几',
    hints: solveHints({
      concept: '单位"1"减去用去的分率',
      knowns: [`整桶 ${total} 千克`, `第一周用去 ${used}/${usedOf}`],
      ask: '第二周用了多少千克',
      method: `先求剩下几分之几：1 - ${used}/${usedOf}，再乘总重量。`,
      setup: `第一步：1 - ${used}/${usedOf} = ${rest.n}/${rest.d}；第二步：${total} × ${rest.n}/${rest.d} = ？`,
    }),
  })
}

// ---------- 分数除法 ----------
function genFracDiv(d: Difficulty, rng: Rng) {
  if (d === 'easy') {
    const pairs: [number, number, number][] = [
      [5, 6, 5],
      [4, 7, 4],
      [6, 7, 3],
      [3, 8, 3],
      [8, 9, 4],
      [5, 8, 5],
    ]
    const [n, dd, k] = rng.pick(pairs)
    return makeQ({ ...M, name: '分数除法', kind: 'calc' }, d, {
      prompt: `${n}/${dd} ÷ ${k} = ？（结果化简）`,
      answer: reduceFrac(n, dd * k),
      requireReduced: true,
      concept: '分数除以整数',
      hints: [
        '分数除以整数（0 除外）：分母乘整数，分子不变。',
        `也可以想：${dd} × ${k} 做新的分母。`,
        `得到 ${n}/${dd * k} 后约成最简分数（最大公因数 ${gcd(n, dd * k)}）。`,
      ],
    })
  }
  if (d === 'medium') {
    const pairs: [number, number, number, number][] = [
      [3, 4, 3, 8],
      [2, 3, 2, 5],
      [5, 6, 5, 12],
      [4, 5, 2, 15],
      [7, 8, 7, 16],
      [3, 5, 3, 10],
      [1, 2, 3, 4],
      [5, 8, 5, 6],
    ]
    const [a1, b1, a2, b2] = rng.pick(pairs)
    const val = (a1 * b2) / (b1 * a2)
    const isInt = Number.isInteger(val)
    const ans = reduceFrac(a1 * b2, b1 * a2)
    return makeQ({ ...M, name: '分数除法', kind: 'calc' }, d, {
      prompt: `${a1}/${b1} ÷ ${a2}/${b2} = ？（除以一个数 = 乘它的倒数${isInt ? '，商是整数直接填' : '，结果化成最简分数'}）`,
      answer: isInt ? val : ans,
      requireReduced: !isInt,
      concept: '分数除以分数',
      hints: [
        `除以一个不为 0 的数，等于乘这个数的倒数：${a2}/${b2} 的倒数是 ${b2}/${a2}。`,
        `式子变成 ${a1}/${b1} × ${b2}/${a2}。`,
        isInt ? '分子乘分子、分母乘分母，约分后商是一个整数，直接填整数。' : '分子乘分子、分母乘分母，约成最简分数。',
      ],
    })
  }
  if (d === 'hard') {
    if (rng.bool()) {
      const pairs: [number, number, number][] = [
        [15, 3, 4],
        [10, 2, 5],
        [12, 3, 5],
        [20, 4, 5],
        [18, 3, 5],
      ]
      const [whole, n, dd] = rng.pick(pairs)
      return makeQ({ ...M, name: '分数除法', kind: 'word' }, d, {
        prompt: `一个数的 ${n}/${dd} 是 ${whole}，这个数是多少？`,
        answer: reduceFrac((whole * dd) / n, 1).n,
        concept: '已知部分求整体',
        hints: solveHints({
          concept: '已知一个数的几分之几是多少，求这个数',
          knowns: [`一个数的 ${n}/${dd} 是 ${whole}`],
          ask: '这个数是多少',
          method: '部分量 ÷ 对应分率 = 整体（单位"1"）。',
          setup: `列式：${whole} ÷ ${n}/${dd} = ${whole} × ${dd}/${n} = ？`,
        }),
      })
    }
    const pairs: [number, number][] = [[5, 6], [3, 4], [2, 3], [7, 8]]
    const [n, dd] = rng.pick(pairs)
    return makeQ({ ...M, name: '分数除法', kind: 'calc' }, d, {
      prompt: `在○里填 >、< 或 =：${n}/${dd} ÷ 3 〇 ${n}/${dd}`,
      answer: '<',
      concept: '除以大于 1 的数会变小',
      hints: [
        '一个数（0 除外）除以比 1 大的数，结果比原来小。',
        `除以 3 就是平均分成 3 份，每份比原来的 ${n}/${dd} 大还是小？`,
        '想象分披萨：切成 3 份拿 1 份，一定比原来小。所以选 <。',
      ],
    })
  }
  // challenge：剩余几分之几
  const b1 = rng.pick([4, 5])
  const b2 = rng.pick([5, 10, 4])
  const a1 = 1
  const a2 = rng.pick([2, 3])
  const L = (b1 * b2) / gcd(b1, b2)
  const num = L - (a1 * L) / b1 - (a2 * L) / b2
  return makeQ({ ...M, name: '分数除法', kind: 'word' }, d, {
    prompt: `修一条路，第一天修了全长的 ${a1}/${b1}，第二天修了全长的 ${a2}/${b2}，还剩全长的几分之几没修？（结果化简）`,
    answer: reduceFrac(num, L),
    requireReduced: true,
    concept: '分率相加减',
    hints: solveHints({
      concept: '把全长看作单位"1"',
      knowns: [`第一天修 ${a1}/${b1}`, `第二天修 ${a2}/${b2}`],
      ask: '还剩几分之几',
      method: '剩下 = 1 - 第一天 - 第二天，分率直接相减。',
      setup: `先通分：1 = ${L}/${L}，${a1}/${b1} = ${a1 * (L / b1)}/${L}，${a2}/${b2} = ${a2 * (L / b2)}/${L}，再相减。`,
    }),
  })
}

// ---------- 比与按比例分配 ----------
function genRatio(d: Difficulty, rng: Rng) {
  if (d === 'medium') {
    const pairs: [number, number][] = [
      [12, 18],
      [10, 15],
      [18, 24],
      [15, 25],
      [16, 24],
      [21, 28],
    ]
    const [a, b] = rng.pick(pairs)
    const g = gcd(a, b)
    return makeQ({ ...M, name: '比', kind: 'calc' }, d, {
      prompt: `把 ${a} : ${b} 化成最简整数比（先填前项，再填后项）`,
      answer: { a: a / g, b: b / g },
      concept: '化简比',
      hints: [
        '化简比：前项和后项同时除以它们的最大公因数。',
        `${a} 和 ${b} 的最大公因数是 ${g}。`,
        `两项同时 ÷ ${g}，得到最简整数比。`,
      ],
    })
  }
  if (d === 'hard') {
    const r1 = rng.int(2, 4)
    const r2 = r1 + rng.int(1, 3)
    const parts = r1 + r2
    const per = rng.int(20, 40)
    const total = per * parts
    return makeQ({ ...M, name: '比', kind: 'word' }, d, {
      prompt: `六年级两个班共捐款 ${total} 元，一班和二班的捐款比是 ${r1} : ${r2}，二班捐了多少元？`,
      answer: per * r2,
      unit: '元',
      concept: '按比例分配',
      hints: solveHints({
        concept: '按比分配：先求每份，再求几份',
        knowns: [`共 ${total} 元`, `比是 ${r1} : ${r2}`],
        ask: '二班捐多少',
        method: `总份数 = ${r1} + ${r2} = ${parts} 份，先求 1 份是多少，二班占 ${r2} 份。`,
        setup: `第一步：${total} ÷ ${parts} = ？（每份）第二步：× ${r2}。`,
      }),
    })
  }
  // challenge：比值
  const pairs: [number, number, number, number][] = [
    [3, 4, 1, 8],
    [2, 3, 1, 6],
    [5, 6, 5, 12],
    [3, 8, 3, 4],
  ]
  const [a1, b1, a2, b2] = rng.pick(pairs)
  return makeQ({ ...M, name: '比', kind: 'calc' }, d, {
    prompt: `求比值：${a1}/${b1} : ${a2}/${b2}（比值是一个数，填小数或整数）`,
    answer: (a1 * b2) / (b1 * a2),
    concept: '分数比的比值',
    hints: [
      '比值 = 前项 ÷ 后项。',
      `除以 ${a2}/${b2} 等于乘 ${b2}/${a2}：${a1}/${b1} × ${b2}/${a2}。`,
      '算出这个分数的值，就是比值。',
    ],
  })
}

// ---------- 圆 ----------
function genCircle(d: Difficulty, rng: Rng) {
  const r = rng.pick([2, 3, 4, 5, 6, 10])
  if (d === 'medium') {
    return makeQ({ ...M, name: '圆', kind: 'calc' }, d, {
      prompt: `圆的半径是 ${r} 厘米，周长是多少厘米？（π 取 3.14）`,
      figure: { kind: 'circleFig', labels: { r: `${r}` } },
      answer: Math.round(2 * PI * r * 100) / 100,
      unit: '厘米',
      concept: '圆的周长 C = 2πr',
      hints: solveHints({
        concept: '圆的周长公式',
        knowns: [`半径 r = ${r} 厘米`, 'π 取 3.14'],
        ask: '周长',
        method: 'C = 2 × π × r。',
        setup: `列式：2 × 3.14 × ${r} = ？`,
        first: `先算 3.14 × ${r} = ${Math.round(PI * r * 100) / 100}，再 × 2`,
      }),
    })
  }
  if (d === 'hard') {
    if (rng.bool()) {
      return makeQ({ ...M, name: '圆', kind: 'calc' }, d, {
        prompt: `圆的半径是 ${r} 厘米，面积是多少平方厘米？（π 取 3.14）`,
        figure: { kind: 'circleFig', labels: { r: `${r}` } },
        answer: Math.round(PI * r * r * 100) / 100,
        unit: '平方厘米',
        concept: '圆的面积 S = πr²',
        hints: solveHints({
          concept: '圆的面积公式',
          knowns: [`半径 r = ${r} 厘米`, 'π 取 3.14'],
          ask: '面积',
          method: 'S = π × r × r（先算 r 的平方）。',
          setup: `第一步：${r} × ${r} = ${r * r}。第二步：3.14 × ${r * r} = ？`,
        }),
      })
    }
    const c = rng.pick([12.56, 25.12, 31.4, 62.8])
    const rr = Math.round((c / PI / 2) * 100) / 100
    return makeQ({ ...M, name: '圆', kind: 'calc' }, d, {
      prompt: `圆的周长是 ${c} 厘米，它的半径是多少厘米？（π 取 3.14）`,
      answer: rr,
      unit: '厘米',
      concept: '周长公式的逆用',
      hints: solveHints({
        concept: 'C = 2πr 的逆用',
        knowns: [`周长 C = ${c} 厘米`],
        ask: '半径',
        method: 'r = C ÷ π ÷ 2，先除以 π，再除以 2。',
        setup: `第一步：${c} ÷ 3.14 = ？第二步：÷ 2。`,
      }),
    })
  }
  // challenge：半圆周长
  const rr2 = rng.pick([2, 3, 4, 5])
  const halfCircle = PI * rr2
  const ans = Math.round((halfCircle + 2 * rr2) * 100) / 100
  return makeQ({ ...M, name: '圆', kind: 'word' }, d, {
    prompt: `一个半圆的半径是 ${rr2} 厘米，它的周长是多少厘米？（π 取 3.14，半圆周长 = 圆周长的一半 + 直径）`,
    figure: { kind: 'circleFig', labels: { r: `${rr2}` } },
    answer: ans,
    unit: '厘米',
    concept: '半圆的周长',
    hints: solveHints({
      concept: '半圆周长 = πr + 2r',
      knowns: [`半径 ${rr2} 厘米`],
      ask: '半圆的周长',
      method: '半圆的周长包括：圆周长的一半 + 一条直径。',
      setup: `第一步：圆周长的一半 3.14 × ${rr2} = ？第二步：加上直径 ${rr2 * 2}。`,
    }),
  })
}

// ---------- 百分数 ----------
function genPercent(d: Difficulty, rng: Rng) {
  if (d === 'easy') {
    const bank: [string, number, string][] = [
      ['0.35 = 多少 %？', 35, '小数化百分数：小数点向右移两位，添 %'],
      ['0.08 = 多少 %？', 8, '小数点向右移两位，位数不够补 0'],
      ['1.2 = 多少 %？', 120, '大于 1 的数化百分数会超过 100%'],
      ['0.006 = 多少 %？', 0.6, '小数点右移两位后是 0.6%'],
    ]
    const [p, ans, h] = rng.pick(bank)
    return makeQ({ ...M, name: '百分数', kind: 'calc' }, d, {
      prompt: p,
      answer: ans,
      unit: '%',
      concept: '小数化百分数',
      hints: [h + '。', '百分号 % 就相当于"每一百"。', '移动小数点，写出百分数（不要漏 % 的数值部分）。'],
    })
  }
  if (d === 'medium') {
    if (rng.bool()) {
      const pairs: [number, number][] = [[3, 4], [1, 2], [1, 4], [1, 5], [2, 5], [7, 10], [3, 5], [1, 8], [1, 20], [1, 25]]
      const [n, dd] = rng.pick(pairs)
      return makeQ({ ...M, name: '百分数', kind: 'calc' }, d, {
        prompt: `${n}/${dd} = 多少 %？`,
        figure: { kind: 'percentGrid', filled: (100 * n) / dd },
        answer: (100 * n) / dd,
        unit: '%',
        concept: '分数化百分数',
        hints: [
          '分数化百分数：先化成小数（分子 ÷ 分母），再小数点右移两位。',
          `${n} ÷ ${dd} = ？（先算出小数）`,
          '小数点右移两位加 %，就是百分数。',
        ],
      })
    }
    const p = rng.pick([25, 40, 60, 75, 80])
    return makeQ({ ...M, name: '百分数', kind: 'calc' }, d, {
      prompt: `${p}% = 多少？（写成小数）`,
      answer: p / 100,
      concept: '百分数化小数',
      hints: [
        '百分数化小数：去掉 %，小数点向左移两位。',
        `${p} 去掉 % 后，小数点左移两位。`,
        '写出这个小数。',
      ],
    })
  }
  // hard：百分数比较
  const bank: [string, string, string[]][] = [
    ['三成五 = 多少 %？', '35%', ['3.5%', '350%', '53%']],
    ['七五折 = 多少 %？', '75%', ['7.5%', '57%', '750%']],
    ['"增加五成"是增加多少 %？', '50%', ['5%', '500%', '15%']],
  ]
  const [p, correct, wrongs] = rng.pick(bank)
  const { choices, answer } = choicesOf(rng, correct, wrongs)
  return makeQ({ ...M, name: '百分数', kind: 'concept' }, d, {
    prompt: p,
    choices,
    answer,
    concept: '成数与折扣',
    hints: [
      '"几成"就是十分之几：一成 = 10%。',
      '"几折"表示现价是原价的百分之几十几：七五折 = 75%。',
      '把题目的说法换算成百分数，选出正确答案。',
    ],
  })
}

// ---------- 百分数应用 ----------
function genPctApp(d: Difficulty, rng: Rng) {
  if (d === 'medium') {
    const price = rng.pick([80, 120, 200, 240])
    const discount = rng.pick([0.75, 0.8, 0.9])
    const label = discount === 0.75 ? '七五折' : discount === 0.8 ? '八折' : '九折'
    return makeQ({ ...M, name: '百分数应用', kind: 'word' }, d, {
      prompt: `一件衣服原价 ${price} 元，现在打${label}出售，现价是多少元？`,
      answer: Math.round(price * discount * 100) / 100,
      unit: '元',
      concept: '现价 = 原价 × 折扣',
      hints: solveHints({
        concept: `${label} = 现价是原价的 ${Math.round(discount * 100)}%`,
        knowns: [`原价 ${price} 元`, `打${label}`],
        ask: '现价多少元',
        method: `现价 = 原价 × ${Math.round(discount * 100)}%，求一个数的百分之几用乘法。`,
        setup: `列式：${price} × ${Math.round(discount * 100)}% = ${price} × ${Math.round(discount * 100)} ÷ 100 = ？`,
      }),
    })
  }
  if (d === 'hard') {
    if (rng.bool()) {
      const orig = rng.pick([40, 60, 80, 100])
      const now = (orig * rng.pick([0.7, 0.75, 0.8, 0.85])) / 1
      const nowR = Math.round(now)
      const ratio = Math.round((nowR / orig) * 100)
      return makeQ({ ...M, name: '百分数应用', kind: 'word' }, d, {
        prompt: `一本书原价 ${orig} 元，"六一"促销只卖 ${nowR} 元，相当于打了几折？（填数字，如 7.5 表示七五折）`,
        answer: ratio / 10,
        unit: '折',
        concept: '折扣 = 现价 ÷ 原价',
        hints: solveHints({
          concept: '求折扣就是求现价是原价的百分之几十',
          knowns: [`原价 ${orig} 元`, `现价 ${nowR} 元`],
          ask: '打了几折',
          method: '现价 ÷ 原价 = 百分之几十（折扣）。',
          setup: `列式：${nowR} ÷ ${orig} = 0.xx，就是百分之几十几，写成几折。`,
        }),
      })
    }
    const base = rng.pick([3000, 5000, 8000])
    const rate = rng.pick([2.5, 3, 3.5])
    const years = rng.int(2, 3)
    return makeQ({ ...M, name: '百分数应用', kind: 'word' }, d, {
      prompt: `张叔叔把 ${base} 元存入银行，年利率 ${rate}%，存 ${years} 年，到期可得利息多少元？（不计利息税）`,
      answer: Math.round(base * rate * 0.01 * years * 100) / 100,
      unit: '元',
      concept: '利息 = 本金 × 利率 × 时间',
      hints: solveHints({
        concept: '利息公式',
        knowns: [`本金 ${base} 元`, `年利率 ${rate}%`, `存 ${years} 年`],
        ask: '利息多少元',
        method: '利息 = 本金 × 利率 × 时间，年利率每年都算一次。',
        setup: `第一步：${base} × ${rate}% = ？（一年的利息）`,
        first: `一年的利息算出来后，再 × ${years} 年`,
      }),
    })
  }
  // challenge：先涨再降
  const up = rng.pick([10, 20])
  const down = rng.pick([10, 20])
  const ans = Math.round(100 * (1 + up / 100) * (1 - down / 100) * 100) / 100
  return makeQ({ ...M, name: '百分数应用', kind: 'word' }, d, {
    prompt: `一件商品先涨价 ${up}%，再降价 ${down}%，现在的价格是原价的百分之几？`,
    answer: ans,
    unit: '%',
    concept: '涨幅和降幅的单位"1"不同',
    hints: solveHints({
      concept: '分清两个百分之几的单位"1"',
      knowns: [`先涨价 ${up}%`, `再降价 ${down}%`],
      ask: '现价是原价的百分之几',
      method: `设原价是 100 元最方便：涨价 ${up}% 后变成 100 × (1 + ${up}%) 元；降价 ${down}% 的单位"1"是涨价后的价格。`,
      setup: `第一步：100 × (1 + ${up / 100}) = ？第二步：再 × (1 - ${down / 100})。`,
      first: '算出的数就是现价（原价是 100 时），直接写成百分数',
    }),
  })
}

// ---------- 比例 ----------
function genProp(d: Difficulty, rng: Rng) {
  if (d === 'medium') {
    const a = rng.int(2, 9)
    const b = a + rng.int(1, 5)
    const c = rng.int(2, 12)
    const x = (b * c) / a
    return makeQ({ ...M, name: '比例', kind: 'calc' }, d, {
      prompt: `解比例：${a} : ${b} = x : ${c}，x = ？`,
      answer: Number.isInteger(x) ? x : Math.round(x * 100) / 100,
      concept: '内项之积 = 外项之积',
      hints: [
        '比例的基本性质：两个内项的积 = 两个外项的积。',
        `${a} 和 ${c} 是外项，${b} 和 x 是内项：${a} × x = ${b} × ${c}。`,
        `式子变成 ${a}x = ${b * c}，两边同时 ÷ ${a}，x = ？`,
      ],
    })
  }
  if (d === 'hard') {
    const bank: [string, string, string[]][] = [
      ['圆的周长和半径成什么比例关系？', '成正比例', ['成反比例', '不成比例', '无法判断']],
      ['长方形的面积一定，长和宽成什么比例关系？', '成反比例', ['成正比例', '不成比例', '无法判断']],
      ['每本书的价钱一定，买书的总 价和数量成什么比例关系？', '成正比例', ['成反比例', '不成比例', '无法判断']],
      ['一个人的年龄和身高成什么比例关系？', '不成比例', ['成正比例', '成反比例', '无法判断']],
    ]
    const [p, correct, wrongs] = rng.pick(bank)
    const { choices, answer } = choicesOf(rng, correct, wrongs)
    return makeQ({ ...M, name: '比例', kind: 'concept' }, d, {
      prompt: p.replace('总 价', '总价'),
      choices,
      answer,
      concept: '正比例与反比例',
      hints: [
        '正比例：两个量的比值（商）一定。反比例：两个量的积一定。',
        '写出关系式看看：是 y ÷ x = k（一定），还是 x × y = k（一定）？',
        '如果既不是商一定也不是积一定，就不成比例。',
      ],
    })
  }
  // challenge：解复杂比例
  const pairs: [number, number][] = [[0.5, 2], [0.25, 4], [0.2, 5]]
  const [a, c] = rng.pick(pairs)
  const b = rng.int(2, 9)
  const x = Math.round(((c * b) / a) * 100) / 100
  return makeQ({ ...M, name: '比例', kind: 'calc' }, d, {
    prompt: `解比例：${a} : ${b} = ${c} : x，x = ？`,
    answer: x,
    concept: '比例基本性质（含小数）',
    hints: [
      '先按"内项积 = 外项积"写等式。',
      `${a} × x = ${b} × ${c}，也就是 ${a}x = ${Math.round(b * c * 100) / 100}。`,
      `两边同时 ÷ ${a}，x = ？`,
    ],
  })
}

// ---------- 圆柱与圆锥 ----------
function genSolid(d: Difficulty, rng: Rng) {
  if (d === 'hard') {
    const r = rng.pick([2, 3, 4, 6])
    const h = rng.pick([3, 5, 6, 9])
    if (rng.bool()) {
      return makeQ({ ...M, name: '圆柱与圆锥', kind: 'calc' }, d, {
        prompt: `圆柱的底面半径是 ${r} 厘米，高是 ${h} 厘米，体积是多少立方厘米？（π 取 3.14）`,
        figure: { kind: 'cylinder', labels: { r: `${r}`, h: `${h}` } },
        answer: Math.round(PI * r * r * h * 100) / 100,
        unit: '立方厘米',
        concept: '圆柱体积 V = πr²h',
        hints: solveHints({
          concept: '圆柱体积 = 底面积 × 高',
          knowns: [`半径 ${r} 厘米`, `高 ${h} 厘米`],
          ask: '体积',
          method: 'V = πr²h，先算底面积，再乘高。',
          setup: `第一步：底面积 3.14 × ${r} × ${r} = ？第二步：× ${h}。`,
        }),
      })
    }
    const c = rng.pick([6.28, 12.56, 25.12])
    const hh = rng.pick([3, 5])
    return makeQ({ ...M, name: '圆柱与圆锥', kind: 'calc' }, d, {
      prompt: `圆柱的底面周长是 ${c} 厘米，高是 ${hh} 分米，侧面积是多少平方厘米？（先统一单位：${hh} 分米 = ${hh * 10} 厘米）`,
      answer: Math.round(c * hh * 10 * 100) / 100,
      unit: '平方厘米',
      concept: '圆柱侧面积 = 底面周长 × 高',
      hints: solveHints({
        concept: '侧面展开是一个长方形',
        knowns: [`底面周长 ${c} 厘米`, `高 ${hh} 分米 = ${hh * 10} 厘米`],
        ask: '侧面积',
        method: '把圆柱的侧面剪开摊平，是一个长方形：长 = 底面周长，宽 = 高。',
        setup: `列式：${c} × ${hh * 10} = ？`,
      }),
    })
  }
  // challenge：圆锥
  const rr3 = rng.pick([3, 6])
  const hh3 = rng.pick([5, 6, 9])
  return makeQ({ ...M, name: '圆柱与圆锥', kind: 'calc' }, d, {
    prompt: `圆锥的底面半径是 ${rr3} 厘米，高是 ${hh3} 厘米，体积是多少立方厘米？（π 取 3.14）`,
    figure: { kind: 'cone', labels: { r: `${rr3}`, h: `${hh3}` } },
    answer: Math.round(((PI * rr3 * rr3 * hh3) / 3) * 100) / 100,
    unit: '立方厘米',
    concept: '圆锥体积 = 圆柱体积 × 1/3',
    hints: solveHints({
      concept: '圆锥体积 = 底面积 × 高 ÷ 3',
      knowns: [`半径 ${rr3} 厘米`, `高 ${hh3} 厘米`],
      ask: '体积',
      method: '等底等高的圆锥体积是圆柱的 1/3：V = πr²h ÷ 3。',
      setup: `第一步：底面积 3.14 × ${rr3} × ${rr3} = ？第二步：× ${hh3} 再 ÷ 3。`,
    }),
  })
}

// ---------- 负数 ----------
function genNeg(d: Difficulty, rng: Rng) {
  if (d === 'easy') {
    let a = -rng.int(1, 10)
    let b = -rng.int(1, 10)
    while (a === b) b = -rng.int(1, 10)
    const ans = a > b ? '>' : '<'
    return makeQ({ ...M, name: '负数', kind: 'concept' }, d, {
      prompt: `比较大小：${a} 〇 ${b}（在〇里填 >、< 或 =）`,
      figure: { kind: 'numberline', min: -10, max: 10, marks: [], questionAt: a },
      answer: ans,
      concept: '负数比大小',
      hints: [
        '负数在数轴上 0 的左边，越往左越小。',
        `-10 < -9 < -8 < … < -1 < 0：离 0 越远的负数反而越小。`,
        `看数轴上 ${a} 和 ${b} 的位置，谁在右边谁就大。`,
      ],
    })
  }
  // medium：温度
  const t1 = -rng.int(1, 15)
  const t2 = -rng.int(1, 15)
  const hi = Math.max(t1, t2)
  const lo = Math.min(t1, t2)
  return makeQ({ ...M, name: '负数', kind: 'word' }, d, {
    prompt: `昨天最低气温 ${lo}℃，今天最低气温 ${hi}℃，今天的最低气温比昨天高多少 ℃？`,
    answer: hi - lo,
    unit: '℃',
    concept: '负数的减法（温差）',
    hints: solveHints({
      concept: '数轴上两点的距离',
      knowns: [`昨天 ${lo}℃`, `今天 ${hi}℃`],
      ask: '今天比昨天高几度',
      method: '在数轴上找到两个温度，数一数相隔几格（高的减低的）。',
      setup: `列式：${hi} - (${lo}) = ？`,
      first: `减负数 = 加它的相反数：${hi} + ${-lo} = ？`,
    }),
  })
}

// ---------- 数与形 / 鸽巢原理 ----------
function genPattern(d: Difficulty, rng: Rng) {
  if (d === 'hard') {
    const n = rng.int(4, 7)
    const terms = Array.from({ length: n }, (_, i) => 2 * i + 1)
    return makeQ({ ...M, name: '数学广角', kind: 'calc' }, d, {
      prompt: `找规律计算：${terms.join(' + ')} = ？（从 1 开始加 ${n} 个连续奇数）`,
      answer: n * n,
      concept: '从 1 开始的连续奇数之和 = 个数²',
      hints: [
        '数学广角"数与形"：把奇数摆成正方形方阵。',
        '1 摆 1 个点；1+3 摆成 2×2；1+3+5 摆成 3×3……',
        `${n} 个奇数正好摆成 ${n} × ${n} 的正方形点阵，和就是 ${n} × ${n}。算出来！`,
      ],
    })
  }
  // challenge：鸽巢原理
  const items = rng.int(4, 9)
  const boxes = rng.int(2, Math.min(4, items - 1))
  const atLeast = Math.ceil(items / boxes)
  return makeQ({ ...M, name: '数学广角', kind: 'concept' }, 'challenge', {
    prompt: `把 ${items} 支铅笔放进 ${boxes} 个笔筒里，总有一个笔筒里至少放了几支铅笔？`,
    answer: atLeast,
    unit: '支',
    concept: '鸽巢原理（抽屉原理）',
    hints: [
      '先想"平均分"：把铅笔尽量平均放进每个笔筒。',
      `假设每个笔筒先放 ${Math.floor(items / boxes)} 支，还剩 ${items % boxes} 支。`,
      `剩下的每支无论放进哪个笔筒，都会让那个笔筒变成 ${Math.floor(items / boxes) + 1} 支。所以"至少"就是平均数再加（有余数时加 1）。算一算是几？`,
    ],
  })
}

export const G6_TOPICS: TopicDef[] = [
  { id: 'g6-fracmult', grade: 6, name: '分数乘法', kind: 'word', difficulties: ['easy', 'medium', 'hard', 'challenge'], term: 1, gen: genFracMult },
  { id: 'g6-fracdiv', grade: 6, name: '分数除法', kind: 'word', difficulties: ['easy', 'medium', 'hard', 'challenge'], term: 1, gen: genFracDiv },
  { id: 'g6-ratio', grade: 6, name: '比与按比例分配', kind: 'word', difficulties: ['medium', 'hard', 'challenge'], term: 1, gen: genRatio },
  { id: 'g6-circle', grade: 6, name: '圆', kind: 'word', difficulties: ['medium', 'hard', 'challenge'], term: 1, gen: genCircle },
  { id: 'g6-percent', grade: 6, name: '百分数', kind: 'calc', difficulties: ['easy', 'medium', 'hard'], term: 1, gen: genPercent },
  { id: 'g6-pctapp', grade: 6, name: '百分数应用', kind: 'word', difficulties: ['medium', 'hard', 'challenge'], term: 2, gen: genPctApp },
  { id: 'g6-prop', grade: 6, name: '比例', kind: 'calc', difficulties: ['medium', 'hard', 'challenge'], term: 2, gen: genProp },
  { id: 'g6-solid', grade: 6, name: '圆柱与圆锥', kind: 'word', difficulties: ['hard', 'challenge'], term: 2, gen: genSolid },
  { id: 'g6-neg', grade: 6, name: '负数', kind: 'concept', difficulties: ['easy', 'medium'], term: 2, gen: genNeg },
  { id: 'g6-pattern', grade: 6, name: '数学广角·数与形', kind: 'concept', difficulties: ['hard', 'challenge'], term: 2, gen: genPattern },
]
