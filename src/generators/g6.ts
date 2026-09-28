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
  // challenge：分数比的比值 / 三个量的连比分配
  if (rng.bool()) {
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
  const a = rng.int(1, 3)
  const b = a + rng.int(1, 2)
  const c = b + rng.int(1, 3)
  const per = rng.pick([10, 15, 20, 25, 30])
  const total = per * (a + b + c)
  return makeQ({ ...M, name: '比', kind: 'word' }, d, {
    prompt: `学校把 ${total} 本图书按 ${a} : ${b} : ${c} 分给三、四、五三个年级，五年级分到多少本？`,
    answer: per * c,
    unit: '本',
    concept: '三个量的按比分配',
    hints: solveHints({
      concept: '连比分配：先求总份数，再求一份',
      knowns: [`共 ${total} 本`, `三、四、五年级的比是 ${a} : ${b} : ${c}`],
      ask: '五年级分到多少本',
      method: `总份数 = ${a} + ${b} + ${c}，先求出 1 份是多少本，五年级占 ${c} 份。`,
      setup: `第一步：${a} + ${b} + ${c} = ？第二步：${total} ÷ 总份数 = 每份的本数，再 × ${c}。`,
      first: `总份数是 ${a + b + c}，先算 ${total} ÷ ${a + b + c}`,
    }),
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
  // challenge：半圆周长 / 圆环面积 / 扇形面积
  const kind = rng.pick(['semicircle', 'ring', 'ring', 'sector'] as const)
  if (kind === 'semicircle') {
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
  if (kind === 'ring') {
    // 圆环面积 = π(R² − r²)，数字搭配保证结果只有两位小数
    const pairs: [number, number][] = [
      [6, 4],
      [8, 5],
      [10, 6],
      [5, 3],
      [12, 8],
      [7, 3],
    ]
    const [R, r2] = rng.pick(pairs)
    const ans = Math.round(PI * (R * R - r2 * r2) * 100) / 100
    return makeQ({ ...M, name: '圆', kind: 'calc' }, d, {
      prompt: `一个圆环，外圆半径 ${R} 厘米，内圆半径 ${r2} 厘米，圆环的面积是多少平方厘米？（π 取 3.14）`,
      figure: { kind: 'circleFig', labels: { r: `${R}` } },
      answer: ans,
      unit: '平方厘米',
      concept: '圆环面积 S = π(R² − r²)',
      hints: solveHints({
        concept: '圆环面积 = 外圆面积 − 内圆面积',
        knowns: [`外圆半径 ${R} 厘米`, `内圆半径 ${r2} 厘米`],
        ask: '圆环的面积',
        method: '先分别算出两个圆的面积再相减；更聪明的做法是先算 R² − r²，再乘 π。',
        setup: `第一步：${R}² − ${r2}² = ${R * R} − ${r2 * r2} = ？第二步：× 3.14。`,
        first: `平方差算出来是 ${R * R - r2 * r2}，再乘 3.14`,
      }),
    })
  }
  const secPairs: [number, number][] = [
    [6, 120],
    [4, 90],
    [3, 60],
    [6, 60],
    [4, 45],
    [6, 90],
  ]
  const [r3, deg] = rng.pick(secPairs)
  const secAns = Math.round(((PI * r3 * r3 * deg) / 360) * 100) / 100
  return makeQ({ ...M, name: '圆', kind: 'calc' }, d, {
    prompt: `一个扇形的半径是 ${r3} 厘米，圆心角是 ${deg}°，它的面积是多少平方厘米？（π 取 3.14，扇形面积 = 圆面积 × n/360）`,
    figure: { kind: 'fracPie', parts: 360 / deg },
    answer: secAns,
    unit: '平方厘米',
    concept: '扇形面积 = πr² × n/360',
    hints: solveHints({
      concept: '扇形是圆的一部分，占比 = 圆心角 ÷ 360',
      knowns: [`半径 ${r3} 厘米`, `圆心角 ${deg}°`],
      ask: '扇形面积',
      method: `先算整个圆的面积，再乘 ${deg}/360（扇形占圆的几分之几）。`,
      setup: `第一步：3.14 × ${r3} × ${r3} = ？第二步：× ${deg}/360（也就是 ÷ ${360 / deg}）。`,
      first: `整圆面积是 ${Math.round(PI * r3 * r3 * 100) / 100}，看 ${deg}° 占 360° 的几分之几`,
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
  // challenge：圆锥 / 削去最大圆锥 / 熔铸变形
  const kind = rng.pick(['cone', 'cut', 'cast'] as const)
  if (kind === 'cone') {
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
  if (kind === 'cut') {
    // 圆柱内削去最大的圆锥，求剩下体积：V柱 − V锥 = (2/3)πr²h
    const tuples: [number, number][] = [
      [3, 6],
      [6, 5],
      [3, 9],
      [6, 9],
      [2, 6],
      [4, 3],
    ]
    const [r, h] = rng.pick(tuples)
    const full = PI * r * r * h
    const left = Math.round(((full * 2) / 3) * 100) / 100
    return makeQ({ ...M, name: '圆柱与圆锥', kind: 'word' }, d, {
      prompt: `一个底面半径 ${r} 厘米、高 ${h} 厘米的圆柱形木块，把它削成一个最大的圆锥后，剩下的木料体积是多少立方厘米？（π 取 3.14）`,
      figure: { kind: 'cylinder', labels: { r: `${r}`, h: `${h}` } },
      answer: left,
      unit: '立方厘米',
      concept: '等底等高：圆锥是圆柱的 1/3',
      hints: solveHints({
        concept: '最大的圆锥和圆柱等底等高',
        knowns: [`圆柱半径 ${r} 厘米`, `圆柱高 ${h} 厘米`],
        ask: '削去最大圆锥后剩下多少',
        method: '最大的圆锥与圆柱等底等高，体积是圆柱的 1/3，所以剩下的是圆柱的 2/3。',
        setup: `第一步：圆柱体积 3.14 × ${r} × ${r} × ${h} = ？第二步：× 2/3。`,
        first: `圆柱体积是 ${Math.round(full * 100) / 100}，再乘 2/3`,
      }),
    })
  }
  // 熔铸：圆柱形铁块熔铸成等底面圆锥，高变成几倍
  const hh = rng.pick([6, 9, 12])
  return makeQ({ ...M, name: '圆柱与圆锥', kind: 'word' }, d, {
    prompt: `一块高 ${hh} 厘米的圆柱形铁块（底面半径 4 厘米），把它熔铸成一个底面半径也是 4 厘米的圆锥形零件（不计损耗），圆锥的高是多少厘米？`,
    figure: { kind: 'cone', labels: { r: '4' } },
    answer: hh * 3,
    unit: '厘米',
    concept: '体积守恒：等底的圆锥高是圆柱的 3 倍',
    hints: solveHints({
      concept: '熔铸前后体积不变',
      knowns: [`圆柱高 ${hh} 厘米`, `圆柱和圆锥底面半径都是 4 厘米`],
      ask: '圆锥的高',
      method: '体积相同、底面积相同时，圆锥的高必须是圆柱的 3 倍（因为圆锥体积要 ÷3）。',
      setup: `想一想：V柱 = 底面积 × ${hh}，V锥 = 底面积 × 高 ÷ 3。让它们相等，锥的高 = ？`,
      first: '列出 底面积 × ' + hh + ' = 底面积 × 高 ÷ 3，两边同时约去底面积',
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
  // challenge：鸽巢原理 / 连续偶数之和
  if (rng.bool()) {
    const items = rng.int(4, 9)
    const boxes = rng.int(2, Math.min(4, items - 1))
    const atLeast = Math.ceil(items / boxes)
    return makeQ({ ...M, name: '数学广角', kind: 'concept' }, d, {
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
  const n = rng.int(4, 9)
  const evens = Array.from({ length: n }, (_, i) => 2 * i + 2)
  return makeQ({ ...M, name: '数学广角', kind: 'calc' }, d, {
    prompt: `找规律巧算：${evens.join(' + ')} = ？（从 2 开始加 ${n} 个连续偶数）`,
    answer: n * (n + 1),
    concept: '连续偶数之和 = n×(n+1)',
    hints: [
      '数与形的思路：每个偶数都能拆成两个相同数，2=1+1，4=2+2，6=3+3……',
      `拆开后正好是两个 (${1}+${2}+…+${n}) 相加。先算 1 加到 ${n}：头尾配对，每对和是 ${n + 1}。`,
      `1 + 2 + … + ${n} = (${n + 1}) × ${n} ÷ 2，再乘 2（两组）就是答案。算一算！`,
    ],
  })
}

// ---------- 综合应用（相遇 / 工程 / 利润） ----------
function genCombo(d: Difficulty, rng: Rng) {
  if (d === 'medium') {
    // 相遇问题：路程 = 速度和 × 时间
    const a = rng.int(45, 70)
    const b = rng.int(40, 65)
    const t = rng.int(3, 6)
    return makeQ({ ...M, name: '综合应用', kind: 'word' }, d, {
      prompt: `甲、乙两车同时从两地相向开出，甲车每小时行 ${a} 千米，乙车每小时行 ${b} 千米，经过 ${t} 小时两车相遇。两地相距多少千米？`,
      figure: { kind: 'barModel', bars: [{ label: `甲 ${t}小时`, value: a * t }, { label: `乙 ${t}小时`, value: b * t }] },
      answer: (a + b) * t,
      unit: '千米',
      concept: '相遇问题：路程 = 速度和 × 时间',
      hints: solveHints({
        concept: '相遇问题：两队（车）同时相向而行',
        knowns: [`甲每小时 ${a} 千米`, `乙每小时 ${b} 千米`, `${t} 小时相遇`],
        ask: '两地相距多少千米',
        method: '两车 1 小时共靠近 (甲速 + 乙速) 千米，相遇时共同走完全程：路程 = 速度和 × 时间。',
        setup: `第一步：${a} + ${b} = ？第二步：× ${t}。`,
      }),
    })
  }
  if (d === 'hard') {
    const type = rng.pick(['work', 'fee', 'fee'] as const)
    if (type === 'work') {
      // 工程问题：合作天数 = ab/(a+b)
      const pairs: [number, number, number][] = [
        [6, 3, 2],
        [12, 4, 3],
        [4, 12, 3],
        [20, 5, 4],
        [5, 20, 4],
        [12, 6, 4],
        [10, 15, 6],
        [15, 10, 6],
        [30, 6, 5],
        [12, 12, 6],
      ]
      const [a, b, days] = rng.pick(pairs)
      return makeQ({ ...M, name: '综合应用', kind: 'word' }, d, {
        prompt: `一项工程，甲队单独做要 ${a} 天完成，乙队单独做要 ${b} 天完成。两队合作，多少天可以完成？`,
        answer: days,
        unit: '天',
        concept: '工程问题：把总量看作单位"1"',
        hints: solveHints({
          concept: '工程问题：工作总量 = 工作效率 × 时间',
          knowns: [`甲单独做 ${a} 天`, `乙单独做 ${b} 天`],
          ask: '合作多少天完成',
          method: `把整项工程看作 "1"：甲每天做 1/${a}，乙每天做 1/${b}，合作每天做两个分数之和。`,
          setup: `第一步：1/${a} + 1/${b} = ？（合作一天的）第二步：1 ÷ 这个分数。`,
          first: `通分算出两人一天合做几分之几，再用总量 1 除以它`,
        }),
      })
    }
    // 分段计费：出租车 / 水费（数字搭配保证整数）
    if (rng.bool()) {
      const tuples: [number, number, number, number][] = [
        [8, 3, 2, 9],
        [8, 3, 2, 11],
        [8, 3, 3, 7],
        [10, 3, 2, 10],
        [10, 3, 2, 13],
        [9, 2, 3, 6],
        [9, 2, 3, 8],
        [12, 3, 2, 8],
      ]
      const [base, freeKm, perKm, dist] = rng.pick(tuples)
      const fee = base + (dist - freeKm) * perKm
      return makeQ({ ...M, name: '综合应用', kind: 'word' }, d, {
        prompt: `出租车收费标准：${freeKm} 千米以内（含 ${freeKm} 千米）起步价 ${base} 元，超过部分每千米 ${perKm} 元。王老师乘出租车行了 ${dist} 千米，应付车费多少元？`,
        figure: { kind: 'barModel', bars: [{ label: `前${freeKm}千米`, value: base }, { label: `超出${dist - freeKm}千米`, value: (dist - freeKm) * perKm, color: '#94A3B8' }, { label: '合计', q: true }] },
        answer: fee,
        unit: '元',
        concept: '分段计费：起步价 + 超出部分',
        hints: solveHints({
          concept: '分段计费：两段分开算，再加起来',
          knowns: [`起步价 ${base} 元含 ${freeKm} 千米`, `超出部分每千米 ${perKm} 元`, `共行了 ${dist} 千米`],
          ask: '应付车费多少元',
          method: `前 ${freeKm} 千米付起步价 ${base} 元；超出的 (${dist} − ${freeKm}) 千米按每千米 ${perKm} 元另算。`,
          setup: `第一步：${dist} − ${freeKm} = 超出的千米数。第二步：起步价 ${base} + 超出千米数 × ${perKm}。`,
          first: `超出了 ${dist - freeKm} 千米，这段的费用是 ${dist - freeKm} × ${perKm}`,
        }),
      })
    }
    const tuples2: [number, number, number, number][] = [
      [12, 3, 5, 16],
      [12, 3, 5, 18],
      [10, 2, 4, 15],
      [10, 2, 4, 17],
      [15, 2, 4, 20],
      [15, 2, 4, 22],
      [8, 4, 6, 10],
      [8, 4, 6, 11],
    ]
    const [limit, p1, p2, used] = rng.pick(tuples2)
    const fee2 = limit * p1 + (used - limit) * p2
    return makeQ({ ...M, name: '综合应用', kind: 'word' }, d, {
      prompt: `某市水费阶梯收费：每月用水不超过 ${limit} 吨时每吨 ${p1} 元，超过 ${limit} 吨的部分每吨 ${p2} 元。小明家上月用水 ${used} 吨，应付水费多少元？`,
      answer: fee2,
      unit: '元',
      concept: '阶梯计费：两段单价不同',
      hints: solveHints({
        concept: '阶梯计费：标准内一段价，超出部分另一段价',
        knowns: [`${limit} 吨以内每吨 ${p1} 元`, `超过部分每吨 ${p2} 元`, `用水 ${used} 吨`],
        ask: '应付水费多少元',
        method: `前 ${limit} 吨按每吨 ${p1} 元算；超出的 (${used} − ${limit}) 吨按每吨 ${p2} 元算，最后相加。`,
        setup: `第一步：${limit} × ${p1} = 标准内的水费。第二步：(${used} − ${limit}) × ${p2}，两段相加。`,
        first: `标准内的水费是 ${limit * p1} 元，再算超出部分`,
      }),
    })
  }
  // challenge：定价折扣利润三步题 / 浓度问题
  if (rng.bool()) {
    const tuples: [number, number, number, number][] = [
      [100, 50, 8, 20],
      [80, 25, 9, 10],
      [60, 50, 8, 12],
      [200, 20, 9, 16],
      [150, 60, 8, 42],
    ]
    const [cost, pct, zhe, profit] = rng.pick(tuples)
    return makeQ({ ...M, name: '综合应用', kind: 'word' }, d, {
      prompt: `一件商品进价 ${cost} 元，按 ${pct}% 的利润定价出售，后来又打${zhe === 8 ? '八' : '九'}折促销。卖出一件事，商家还能赚多少元？`,
      answer: profit,
      unit: '元',
      concept: '定价 = 进价 × (1 + 利润率)，售价 = 定价 × 折扣',
      hints: solveHints({
        concept: '百分数的三步应用',
        knowns: [`进价 ${cost} 元`, `按 ${pct}% 利润定价`, `按${zhe === 8 ? '八' : '九'}折卖出`],
        ask: '还能赚多少元',
        method: `分三步：① 定价 = 进价 × (1 + ${pct}%)；② 售价 = 定价 × ${zhe === 8 ? '八' : '九'}折；③ 利润 = 售价 - 进价。`,
        setup: `第一步：${cost} × (1 + ${pct}%) = ？（定价）`,
        first: `第二步：定价 × ${zhe === 8 ? '80%' : '90%'} 是售价，最后再减进价 ${cost}`,
      }),
    })
  }
  // 浓度问题：加水稀释（盐的重量不变）
  const tuples3: [number, number, number, number][] = [
    [200, 20, 10, 200],
    [300, 15, 10, 150],
    [250, 20, 10, 250],
    [600, 15, 10, 300],
    [400, 20, 16, 100],
    [500, 25, 20, 125],
    [300, 20, 15, 100],
    [450, 20, 18, 50],
  ]
  const [gw, c1, c2, addW] = rng.pick(tuples3)
  return makeQ({ ...M, name: '综合应用', kind: 'word' }, d, {
    prompt: `有 ${gw} 克浓度为 ${c1}% 的盐水，要把它稀释成浓度 ${c2}% 的盐水，需要加入多少克水？`,
    answer: addW,
    unit: '克',
    concept: '浓度问题：加水前后盐不变',
    hints: solveHints({
      concept: '抓住不变量：加水不会改变盐的重量',
      knowns: [`${gw} 克浓度为 ${c1}% 的盐水`, `目标浓度 ${c2}%`],
      ask: '需要加多少克水',
      method: `先算出盐的重量：${gw} × ${c1}%。加水后盐不变，浓度变成 ${c2}%，就能反推出新盐水的总重量。`,
      setup: `第一步：${gw} × ${c1}% = 盐的克数。第二步：盐 ÷ ${c2}% = 新盐水总重，再减去原来的 ${gw} 克。`,
      first: `盐有 ${(gw * c1) / 100} 克，用它 ÷ ${c2}% 算出稀释后的总重量`,
    }),
  })
}

// ---------- 行程问题（追及 · 火车过桥 · 环形跑道） ----------
function genJourney(d: Difficulty, rng: Rng) {
  if (d === 'hard') {
    const type = rng.pick(['chase', 'chase', 'train'] as const)
    if (type === 'chase') {
      // 追及问题：相距 d，速度差追上
      const tuples: [number, number, number, number][] = [
        [65, 50, 60, 4],
        [72, 64, 32, 4],
        [80, 65, 45, 3],
        [55, 40, 90, 6],
        [70, 58, 36, 3],
        [45, 35, 40, 4],
        [60, 48, 24, 2],
        [90, 75, 120, 8],
      ]
      const [v1, v2, gap, t] = rng.pick(tuples)
      return makeQ({ ...M, name: '行程问题', kind: 'word' }, d, {
        prompt: `甲、乙两人相距 ${gap} 千米，两人同时同向出发（甲在后面），甲每小时行 ${v1} 千米，乙每小时行 ${v2} 千米。经过几小时甲追上乙？`,
        answer: t,
        unit: '小时',
        concept: '追及问题：追及时间 = 路程差 ÷ 速度差',
        hints: solveHints({
          concept: '追及问题：速度快的人在后面追',
          knowns: [`相距 ${gap} 千米`, `甲每小时 ${v1} 千米`, `乙每小时 ${v2} 千米`],
          ask: '几小时追上',
          method: `每小时甲比乙多行 (${v1} − ${v2}) 千米，多行的路程正好用来缩小 ${gap} 千米的差距。`,
          setup: `第一步：${v1} − ${v2} = 速度差。第二步：${gap} ÷ 速度差 = 追及时间。`,
          first: `每小时追近 ${v1 - v2} 千米，看 ${gap} 里有几个这么多`,
        }),
      })
    }
    // 火车过桥：路程 = 桥长 + 车长
    const tuples2: [number, number, number, number][] = [
      [20, 300, 200, 25],
      [25, 600, 200, 32],
      [20, 450, 150, 30],
      [10, 800, 200, 100],
      [30, 500, 250, 25],
      [15, 420, 180, 40],
      [20, 260, 140, 20],
    ]
    const [v, bridge, train, t] = rng.pick(tuples2)
    return makeQ({ ...M, name: '行程问题', kind: 'word' }, d, {
      prompt: `一列长 ${train} 米的火车，以每秒 ${v} 米的速度通过一座长 ${bridge} 米的大桥，从车头上桥到车尾离桥，一共需要多少秒？`,
      answer: t,
      unit: '秒',
      concept: '火车过桥：总路程 = 桥长 + 车长',
      hints: solveHints({
        concept: '火车过桥的路程包括桥和车身',
        knowns: [`车长 ${train} 米`, `桥长 ${bridge} 米`, `速度每秒 ${v} 米`],
        ask: '需要多少秒',
        method: '从车头上桥到车尾离桥，火车实际走的路程 = 桥长 + 车长（画线段图一眼就明白）。',
        setup: `第一步：${bridge} + ${train} = 总路程。第二步：总路程 ÷ ${v} = 时间。`,
        first: `总路程是 ${bridge + train} 米，再 ÷ ${v}`,
      }),
    })
  }
  // challenge：环形跑道（反向相遇 / 同向追上）
  if (rng.bool()) {
    const tuples: [number, number, number, number][] = [
      [400, 6, 4, 40],
      [360, 8, 7, 24],
      [480, 9, 7, 30],
      [300, 8, 7, 20],
      [540, 10, 8, 30],
      [420, 9, 5, 30],
    ]
    const [C, a, b, t] = rng.pick(tuples)
    return makeQ({ ...M, name: '行程问题', kind: 'word' }, d, {
      prompt: `环形跑道周长 ${C} 米，甲、乙两人同时从同一地点反向出发，甲每分钟跑 ${a} 米，乙每分钟跑 ${b} 米。出发后多少分钟两人第一次相遇？`,
      answer: t,
      unit: '分钟',
      concept: '环形反向：合走一圈就相遇',
      hints: solveHints({
        concept: '反向出发：两人一起"凑"完一圈周长',
        knowns: [`周长 ${C} 米`, `甲每分钟 ${a} 米`, `乙每分钟 ${b} 米`],
        ask: '多少分钟第一次相遇',
        method: '反向而行，两人每分钟一共跑 (甲速 + 乙速) 米，合起来正好等于一圈周长时相遇。',
        setup: `第一步：${a} + ${b} = 两人每分钟合跑的米数。第二步：${C} ÷ 这个和 = 相遇时间。`,
        first: `每分钟合跑 ${a + b} 米，${C} 米里包含几个`,
      }),
    })
  }
  const tuples3: [number, number, number, number][] = [
    [180, 7, 4, 60],
    [150, 8, 3, 30],
    [200, 7, 3, 50],
    [120, 5, 3, 60],
    [240, 9, 5, 60],
    [300, 8, 6, 150],
  ]
  const [C2, a2, b2, t2] = rng.pick(tuples3)
  return makeQ({ ...M, name: '行程问题', kind: 'word' }, d, {
    prompt: `环形跑道周长 ${C2} 米，甲、乙两人同时从同一地点同向出发，甲每分钟跑 ${a2} 米，乙每分钟跑 ${b2} 米（甲比乙快）。出发后多少分钟甲第一次追上乙？`,
    answer: t2,
    unit: '分钟',
    concept: '环形同向：多跑一圈就追上',
    hints: solveHints({
      concept: '同向出发：快的要比慢的多跑整整一圈',
      knowns: [`周长 ${C2} 米`, `甲每分钟 ${a2} 米`, `乙每分钟 ${b2} 米`],
      ask: '多少分钟第一次追上',
      method: `同向而行，甲每分钟只比乙多跑 (${a2} − ${b2}) 米；当多跑的路程正好等于一圈 ${C2} 米时，甲就追上乙了。`,
      setup: `第一步：${a2} − ${b2} = 每分钟多跑的米数。第二步：${C2} ÷ 这个差 = 追上所用时间。`,
      first: `每分钟多跑 ${a2 - b2} 米，${C2} 米需要几分钟`,
    }),
  })
}

// ---------- 奥数思维（鸡兔同笼变式 · 盈亏 · 年龄） ----------
function genOlympiad(d: Difficulty, rng: Rng) {
  if (d === 'hard') {
    if (rng.bool()) {
      // 经典鸡兔同笼（数字较小）
      const c = rng.int(3, 9)
      const r = rng.int(2, 8)
      return makeQ({ ...M, name: '奥数思维', kind: 'word' }, d, {
        prompt: `笼子里有鸡和兔共 ${c + r} 只，数一数腿一共有 ${2 * c + 4 * r} 条。鸡有多少只？`,
        answer: c,
        unit: '只',
        concept: '鸡兔同笼：假设法',
        hints: solveHints({
          concept: '假设全是兔，多出的腿就是鸡省下的',
          knowns: [`鸡兔共 ${c + r} 只`, `腿共 ${2 * c + 4 * r} 条`, '鸡 2 条腿，兔 4 条腿'],
          ask: '鸡有多少只',
          method: `假设 ${c + r} 只全是兔，应有 ${4 * (c + r)} 条腿，比实际多出来的腿，每多 2 条说明有一只鸡。`,
          setup: `第一步：${4 * (c + r)} − ${2 * c + 4 * r} = 多算的腿。第二步：多算的腿 ÷ 2 = 鸡的只数。`,
          first: `多算了 ${4 * (c + r) - (2 * c + 4 * r)} 条腿，每只鸡被多算了 2 条`,
        }),
      })
    }
    // 年龄问题：年龄差不变
    const tuples: [number, number, number, number, number][] = [
      [36, 12, 4, 8, 4],
      [40, 13, 4, 9, 4],
      [32, 8, 5, 6, 2],
      [45, 15, 4, 10, 5],
      [50, 14, 4, 12, 2],
      [40, 10, 7, 5, 5],
      [44, 12, 9, 4, 8],
      [52, 16, 5, 9, 7],
    ]
    const [pa, son, k, sonThen, yrs] = rng.pick(tuples)
    return makeQ({ ...M, name: '奥数思维', kind: 'word' }, d, {
      prompt: `今年爸爸 ${pa} 岁，儿子 ${son} 岁。几年前爸爸的年龄恰好是儿子的 ${k} 倍？`,
      answer: yrs,
      unit: '年',
      concept: '年龄问题：年龄差永远不变',
      hints: solveHints({
        concept: '年龄差不随时间改变',
        knowns: [`爸爸 ${pa} 岁`, `儿子 ${son} 岁`],
        ask: '几年前爸爸年龄是儿子的 k 倍',
        method: `两人的年龄差始终是 ${pa - son} 岁。当爸爸是儿子的 ${k} 倍时，年龄差正好是儿子当时年龄的 ${k - 1} 倍。`,
        setup: `第一步：${pa} − ${son} = ${pa - son}（年龄差）。第二步：${pa - son} ÷ ${k - 1} = 儿子当时的岁数，再用 ${son} 减它。`,
        first: `儿子当时 ${sonThen} 岁，现在的 ${son} 岁比它大几岁`,
      }),
    })
  }
  // challenge：鸡兔同笼变式（得分/运费）· 盈亏问题
  const type = rng.pick(['score', 'score', 'profit'] as const)
  if (type === 'score') {
    // 答题得分：对 +a 分、错扣 b 分
    const tuples: [number, number, number, number, number][] = [
      [10, 5, 2, 36, 8],
      [10, 5, 2, 29, 7],
      [10, 5, 2, 22, 6],
      [10, 5, 2, 15, 5],
      [20, 3, 1, 28, 12],
      [20, 3, 1, 20, 10],
      [20, 3, 1, 12, 8],
      [20, 3, 1, 40, 15],
    ]
    const [n, a, b, s, right] = rng.pick(tuples)
    return makeQ({ ...M, name: '奥数思维', kind: 'word' }, d, {
      prompt: `数学竞赛共 ${n} 道题，答对一题得 ${a} 分，答错一题扣 ${b} 分（不答按错算）。小华全部作答，最后得了 ${s} 分。他答对了几道题？`,
      answer: right,
      unit: '道',
      concept: '鸡兔同笼变形：得分问题',
      hints: solveHints({
        concept: '假设全对，用总分差反推错题数',
        knowns: [`共 ${n} 题`, `答对得 ${a} 分`, `答错扣 ${b} 分`, `得了 ${s} 分`],
        ask: '答对几道题',
        method: `假设全对应得 ${a * n} 分。每把一道对题换成错题，分数要少 (${a} + ${b}) 分。`,
        setup: `第一步：${a * n} − ${s} = 少得的总分。第二步：÷ (${a} + ${b}) = 错题数，再用 ${n} 减它。`,
        first: `比全对少得了 ${a * n - s} 分，每错一题少 ${a + b} 分`,
      }),
    })
  }
  // 盈亏问题：先定人数 n 正推，保证整除
  const n = rng.int(6, 12)
  const p1 = rng.int(3, 5)
  const g = rng.pick([1, 2])
  const mult = rng.int(1, n - 1) // m1 = g·mult < g·n，保证还有"亏"
  const m1 = g * mult
  const m2 = g * (n - mult)
  const p2 = p1 + g
  const total = n * p1 + m1
  return makeQ({ ...M, name: '奥数思维', kind: 'word' }, d, {
    prompt: `老师给小朋友分苹果：每人分 ${p1} 个，多出 ${m1} 个；每人分 ${p2} 个，还缺 ${m2} 个。一共有多少个苹果？`,
    answer: total,
    unit: '个',
    concept: '盈亏问题：两次分法对比',
    hints: solveHints({
      concept: '盈亏问题：总差 ÷ 每人差 = 人数',
      knowns: [`每人 ${p1} 个多 ${m1} 个`, `每人 ${p2} 个缺 ${m2} 个`],
      ask: '苹果共有多少个',
      method: `两种分法总共相差 (${m1} + ${m2}) 个苹果，是因为每人多分了 (${p2} − ${p1}) 个。先求人数，再代回任一种分法求总数。`,
      setup: `第一步：(${m1} + ${m2}) ÷ (${p2} − ${p1}) = 人数。第二步：人数 × ${p1} + ${m1} = 苹果总数。`,
      first: `人数是 ${n} 人，代回"每人 ${p1} 个多 ${m1} 个"算总数`,
    }),
  })
}

// ---------- 定义新运算与巧算 ----------
function genNewOp(d: Difficulty, rng: Rng) {
  if (d === 'hard') {
    // 直接按新规则计算
    const rules: [string, string, (a: number, b: number) => number, (a: number, b: number) => string][] = [
      ['△', 'a × b + a + b', (a, b) => a * b + a + b, (a: number, b: number) => `先算乘法：${a} × ${b} = ${a * b}`],
      ['◇', '3 × a − 2 × b', (a, b) => 3 * a - 2 * b, (a: number, b: number) => `先算 3 × ${a} = ${3 * a}`],
      ['☆', 'a × 2 + b × 3', (a, b) => a * 2 + b * 3, (a: number, b: number) => `先算 ${a} × 2 = ${a * 2}`],
    ]
    const [sym, ruleStr, fn, firstStep] = rng.pick(rules)
    const a = rng.int(2, 8)
    const b = rng.int(2, 8)
    return makeQ({ ...M, name: '定义新运算', kind: 'calc' }, d, {
      prompt: `规定新运算：a ${sym} b 表示 "${ruleStr}"。按这个规则计算：${a} ${sym} ${b} = ？`,
      answer: fn(a, b),
      concept: '定义新运算：按新规则代入',
      hints: [
        `新运算不难，就是把 ${a} 和 ${b} 按规则"代入"式子里。`,
        `把 a 换成 ${a}、b 换成 ${b}：${ruleStr.replace(/a/g, `(${a})`).replace(/b/g, `(${b})`)}。`,
        `${firstStep(a, b)}，剩下的加减交给你完成！`,
      ],
    })
  }
  // challenge：已知新运算的结果，反求未知数
  // 规则 a☆b = k×a + b；给 a、k、结果 s，反求 x = s − k×a
  const tuples: [string, number, number, number, number][] = [
    ['☆', 4, 3, 15, 3],
    ['☆', 5, 3, 19, 4],
    ['☆', 6, 3, 23, 5],
    ['☆', 7, 3, 27, 6],
    ['☆', 3, 4, 16, 4],
    ['☆', 5, 4, 26, 6],
    ['☆', 6, 2, 19, 7],
    ['☆', 8, 2, 23, 7],
  ]
  const [sym, a, k, s, x] = rng.pick(tuples)
  return makeQ({ ...M, name: '定义新运算', kind: 'calc' }, d, {
    prompt: `规定新运算：a ${sym} b 表示 "a 的 ${k} 倍加上 b"。已知 ${a} ${sym} x = ${s}，x 是多少？`,
    answer: x,
    concept: '新运算 + 逆向求未知数',
    hints: [
      `先把 x 按规则代入：${a} ${sym} x 就是 ${a} 的 ${k} 倍加 x。`,
      `展开成算式：${k} × ${a} + x = ${s}。这就是一个方程了。`,
      `两边同时减去 ${k * a}：x = ${s} − ${k * a}。最后一步你来算！`,
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
  { id: 'g6-journey', grade: 6, name: '行程问题（追及·火车·环形）', kind: 'word', difficulties: ['hard', 'challenge'], term: 2, gen: genJourney },
  { id: 'g6-olympiad', grade: 6, name: '奥数思维（鸡兔同笼·盈亏·年龄）', kind: 'word', difficulties: ['hard', 'challenge'], term: 1, gen: genOlympiad },
  { id: 'g6-newop', grade: 6, name: '定义新运算', kind: 'calc', difficulties: ['hard', 'challenge'], term: 2, gen: genNewOp },
  { id: 'g6-combo', grade: 6, name: '综合应用（相遇·工程·利润）', kind: 'word', difficulties: ['medium', 'hard', 'challenge'], term: 2, gen: genCombo },
]
