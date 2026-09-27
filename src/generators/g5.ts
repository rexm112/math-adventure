// 五年级 · 人教版：小数乘除法、简易方程、因数与倍数、分数的意义与加减、
// 多边形面积、长方体正方体、植树问题
import type { Difficulty, Rng, TopicDef } from '../types'
import { choicesOf, makeQ, solveHints } from './helpers'
import { gcd, reduceFrac } from '../lib/math'

const M = { id: 'g5', grade: 5 as const }

// ---------- 小数乘法 ----------
function genDecMult(d: Difficulty, rng: Rng) {
  if (d === 'easy') {
    const a = rng.pick([0.5, 0.25, 0.8, 1.5, 2.5])
    const b = rng.int(2, 9)
    return makeQ({ ...M, name: '小数乘法', kind: 'calc' }, d, {
      prompt: `${a} × ${b} = ？`,
      answer: Math.round(a * b * 1000) / 1000,
      concept: '小数乘整数',
      hints: [
        '先按整数乘法算，再点小数点。',
        `${String(a).replace('0.', '')} × ${b} = ？（先不算小数点）`,
        `因数里有 ${String(a).split('.')[1]?.length ?? 0} 位小数，积也从右往左点 ${String(a).split('.')[1]?.length ?? 0} 位小数。`,
      ],
    })
  }
  if (d === 'medium') {
    const a = rng.int(11, 99) / 10
    const b = rng.int(11, 99) / 10
    return makeQ({ ...M, name: '小数乘法', kind: 'calc' }, d, {
      prompt: `${a.toFixed(1)} × ${b.toFixed(1)} = ？`,
      answer: Math.round(a * b * 100) / 100,
      concept: '小数乘小数',
      hints: [
        '先看成整数乘法：末尾的 0 都不看，先乘。',
        `${Math.round(a * 10)} × ${Math.round(b * 10)} = ？`,
        '两个因数一共 2 位小数，积里也从右数 2 位点小数点。',
      ],
    })
  }
  if (d === 'hard') {
    if (rng.bool()) {
      const base = rng.pick([2.4, 3.6, 4.8, 5.5])
      const n = rng.pick([10, 100])
      return makeQ({ ...M, name: '小数乘法', kind: 'calc' }, d, {
        prompt: `${base} × ${n} = ？`,
        answer: Math.round(base * n * 100) / 100,
        concept: '小数点移动规律',
        hints: [
          `一个数 × ${n}，小数点向右移动 ${n === 10 ? 1 : 2} 位。`,
          `${base} 的小数点向右移 ${n === 10 ? 1 : 2} 位。`,
          '位数不够用 0 补齐，写出结果。',
        ],
      })
    }
    const prod = rng.pick([0.36, 2.5, 7.2, 4.8])
    const k = rng.pick([10, 100])
    return makeQ({ ...M, name: '小数乘法', kind: 'calc' }, d, {
      prompt: `两个因数的积是 ${prod}，一个因数乘 ${k}，另一个因数不变，现在的积是多少？`,
      answer: Math.round(prod * k * 100) / 100,
      concept: '积的变化规律',
      hints: [
        '积的变化规律：一个因数不变，另一个因数乘几，积也乘几。',
        `新的积 = ${prod} × ${k}。`,
        '相当于小数点向右移动，算出结果。',
      ],
    })
  }
  // challenge：小数点移动逆推
  const moved = rng.pick([5.46, 3.7, 8.09, 2.05])
  const places = rng.pick([2, 1])
  const ans = Math.round(moved / 10 ** places * 1000) / 1000
  return makeQ({ ...M, name: '小数乘法', kind: 'concept' }, d, {
    prompt: `一个数的小数点向右移动 ${places} 位后变成 ${moved}，原来的数是多少？`,
    answer: ans,
    concept: '小数点移动的逆推',
    hints: [
      `向右移动 ${places} 位是"变大"，说明原来的数更小。`,
      `求原来的数，就是把 ${moved} 的小数点向左移动 ${places} 位（÷ ${10 ** places}）。`,
      '注意整数部分不够时用 0 补位。',
    ],
  })
}

// ---------- 小数除法 ----------
function genDecDiv(d: Difficulty, rng: Rng) {
  if (d === 'easy') {
    const q = rng.pick([0.8, 0.9, 1.2, 0.6, 2.5])
    const b = rng.int(3, 9)
    return makeQ({ ...M, name: '小数除法', kind: 'calc' }, d, {
      prompt: `${Math.round(q * b * 10) / 10} ÷ ${b} = ？`,
      answer: q,
      concept: '小数除以整数',
      hints: [
        '按整数除法算，商的小数点和被除数的小数点对齐。',
        `整数部分除完就点上小数点，继续除。`,
        `验算：商 × ${b} = 被除数吗？`,
      ],
    })
  }
  if (d === 'medium') {
    const q = rng.int(12, 45)
    const a = q * rng.int(4, 9)
    const div = rng.pick([0.8, 0.5, 0.2, 0.4])
    return makeQ({ ...M, name: '小数除法', kind: 'calc' }, d, {
      prompt: `${(a / 10).toFixed(1)} ÷ ${div} = ？`,
      answer: Math.round(((a / 10) / div) * 100) / 100,
      concept: '除数是小数：转化为整数',
      hints: [
        '除数是小数时，把除数转化成整数。',
        `除数 ${div} 变成整数要 × 10，被除数也要 × 10（商不变）。`,
        `式子变成 ${(a / 10) * 10} ÷ ${div * 10} = ？`,
      ],
    })
  }
  if (d === 'hard') {
    if (rng.bool()) {
      const a = rng.pick([7.56, 9.18, 6.12, 3.06])
      const b = rng.pick([12, 15, 18])
      const val = a / b
      return makeQ({ ...M, name: '小数除法', kind: 'calc' }, d, {
        prompt: `${a} ÷ ${b} = ？（商保留两位小数）`,
        answer: Math.round(val * 100) / 100,
        concept: '取近似值（四舍五入）',
        hints: [
          '保留两位小数：除到小数点后第三位（千分位）。',
          `列竖式除：${a} ÷ ${b}，除到第三位小数。`,
          '看第三位：满 5 就进 1，不满 5 舍去。写出两位小数。',
        ],
      })
    }
    const total = rng.pick([6.4, 8.1, 4.8])
    const times = rng.int(3, 6)
    return makeQ({ ...M, name: '小数除法', kind: 'word' }, d, {
      prompt: `${total} 米长的彩带，平均分成 ${times} 段，每段长多少米？`,
      answer: Math.round((total / times) * 1000) / 1000,
      unit: '米',
      concept: '小数除法应用',
      hints: solveHints({
        concept: '平均分用除法',
        knowns: [`彩带长 ${total} 米`, `平均分成 ${times} 段`],
        ask: '每段多少米',
        method: '总数 ÷ 份数 = 每份数。',
        setup: `列式：${total} ÷ ${times} = ？`,
      }),
    })
  }
  // challenge：去尾法
  const per = rng.pick([2.5, 1.5])
  const total = per * rng.int(4, 7) + rng.pick([0.5, 1, 1.5])
  return makeQ({ ...M, name: '小数除法', kind: 'word' }, d, {
    prompt: `做一套衣服要 ${per} 米布，${total} 米布最多能做几套这样的衣服？`,
    answer: Math.floor(total / per),
    unit: '套',
    concept: '去尾法',
    hints: solveHints({
      concept: '"最多能做几套"：不够一套的布不能用',
      knowns: [`每套要 ${per} 米`, `共有 ${total} 米布`],
      ask: '最多做几套',
      method: '用布的总米数 ÷ 每套的米数，不管余多少，只要不够一整套就舍去（去尾法）。',
      setup: `列式：${total} ÷ ${per} = ？……看商。`,
      first: '商是几就最多做几套，余下的布不够再做一套',
    }),
  })
}

// ---------- 简易方程 ----------
function genEquation(d: Difficulty, rng: Rng) {
  const hintsOf = (concept: string, steps: string[], answerHint: string) => [
    `解方程的关键：等式两边同时做同一个运算，天平保持平衡。本题考「${concept}」。`,
    ...steps,
    answerHint,
  ]
  if (d === 'easy') {
    const x = rng.int(2, 20)
    const a = rng.int(2, 20)
    return makeQ({ ...M, name: '简易方程', kind: 'calc' }, d, {
      prompt: `解方程：x + ${a} = ${x + a}，x = ？`,
      figure: { kind: 'balance', left: `x + ${a}`, right: `${x + a}` },
      answer: x,
      concept: '等式两边同时减',
      hints: hintsOf('等式性质一', [
        `看天平：左边是 x + ${a}，右边是 ${x + a}，两边一样重。`,
        `两边同时拿走 ${a}，天平仍然平衡：左边只剩 x。`,
      ], `式子变成 x = ${x + a} - ${a}，算出 x。`),
    })
  }
  if (d === 'medium') {
    if (rng.bool()) {
      const x = rng.int(2, 20)
      const a = rng.int(2, 20)
      return makeQ({ ...M, name: '简易方程', kind: 'calc' }, d, {
        prompt: `解方程：x - ${a} = ${x}，x = ？`,
        answer: x + a,
        concept: '等式两边同时加',
        hints: hintsOf('等式性质一（减法变加法）', [
          `x 减 ${a} 等于 ${x}，说明 x 比 ${x} 大 ${a}。`,
          `两边同时加 ${a}：x - ${a} + ${a} = ${x} + ${a}。`,
        ], `x = ${x} + ${a}，算出结果并检验。`),
      })
    }
    const x = rng.int(3, 25)
    const a = rng.int(3, 9)
    return makeQ({ ...M, name: '简易方程', kind: 'calc' }, d, {
      prompt: `解方程：${a}x = ${a * x}，x = ？`,
      figure: { kind: 'balance', left: `${a}x`, right: `${a * x}` },
      answer: x,
      concept: '等式两边同时除',
      hints: hintsOf('等式性质二', [
        `${a}x 表示 ${a} 个 x，一共是 ${a * x}。`,
        `两边同时除以 ${a}（平均分成 ${a} 份），左边只剩 1 个 x。`,
      ], `x = ${a * x} ÷ ${a}，算出 x。`),
    })
  }
  if (d === 'hard') {
    const x = rng.int(3, 15)
    const a = rng.int(2, 9)
    const b = rng.int(2, 20)
    return makeQ({ ...M, name: '简易方程', kind: 'calc' }, d, {
      prompt: `解方程：${a}x + ${b} = ${a * x + b}，x = ？`,
      figure: { kind: 'balance', left: `${a}x + ${b}`, right: `${a * x + b}` },
      answer: x,
      concept: '先把多余的部分去掉',
      hints: hintsOf('两步解方程', [
        `先把 +${b} 处理掉：两边同时减 ${b}，式子变成 ${a}x = ${a * x}。`,
        `再两边同时除以 ${a}，左边就只剩 x。`,
      ], `x = ${a * x} ÷ ${a}，算出得数。`),
    })
  }
  // challenge：列方程
  const x = rng.int(10, 40)
  const more = rng.int(5, 30)
  return makeQ({ ...M, name: '简易方程', kind: 'word' }, d, {
    prompt: `哥哥的邮票比小红多 ${more} 张，两人一共有 ${2 * x + more} 张。小红有 x 张，解方程求 x 是多少？（方程：2x + ${more} = ${2 * x + more}）`,
    figure: { kind: 'barModel', bars: [{ label: '小红 x', q: true }, { label: `哥哥 x+${more}`, value: x + more }] },
    answer: x,
    concept: '列方程解应用题',
    hints: solveHints({
      concept: '找等量关系列方程',
      knowns: [`哥哥比小红多 ${more} 张`, `两人共 ${2 * x + more} 张`, '方程：2x + ' + more + ' = ' + (2 * x + more)],
      ask: 'x（小红的张数）是多少',
      method: '小红是 x，哥哥就是 x + ' + more + '，加起来等于总数。',
      setup: `解方程：两边先减 ${more}，得 2x = ${2 * x}；再两边除以 2。`,
      first: `2x = ${2 * x}，x 就是它的一半`,
    }),
  })
}

// ---------- 因数与倍数 ----------
function genFactor(d: Difficulty, rng: Rng) {
  if (d === 'easy') {
    const bank: [number, number][] = [
      [18, 6],
      [24, 8],
      [30, 8],
      [36, 9],
      [28, 6],
      [40, 8],
    ]
    const [n, cnt] = rng.pick(bank)
    return makeQ({ ...M, name: '因数与倍数', kind: 'calc' }, d, {
      prompt: `${n} 的因数一共有几个？`,
      answer: cnt,
      unit: '个',
      concept: '找一个数的因数',
      hints: [
        '找因数一对一对地找：1 和它本身是一对。',
        `想乘法：1 × ${n}，2 × ？，3 × ？……直到重复为止。`,
        `把 ${n} 的因数全部列出来（不重不漏），数一数共几个。`,
      ],
    })
  }
  if (d === 'medium') {
    if (rng.bool()) {
      return makeQ({ ...M, name: '因数与倍数', kind: 'concept' }, d, {
        prompt: '既是 2 的倍数，又是 3 的倍数的最小两位数是几？',
        answer: 12,
        concept: '2 和 3 的公倍数',
        hints: [
          '同时是 2 和 3 的倍数，就是 6 的倍数。',
          '6 的倍数：6、12、18……',
          '其中最小的两位数是几？',
        ],
      })
    }
    const n = rng.pick([30, 36, 48, 60])
    return makeQ({ ...M, name: '因数与倍数', kind: 'concept' }, d, {
      prompt: `${n} 的最大因数和最小倍数的和是多少？`,
      answer: n * 2,
      concept: '最大因数与最小倍数',
      hints: [
        '一个数最大的因数是它自己。',
        '一个数最小的倍数也是它自己。',
        `所以最大因数 + 最小倍数 = ${n} + ${n} = ？`,
      ],
    })
  }
  // hard：质数合数
  if (rng.bool()) {
    const bank: [string, string, string[]][] = [
      ['20 以内最大的质数是几？', '19', ['17', '18', '20']],
      ['最小的合数是几？', '4', ['2', '3', '6']],
      ['既是质数又是偶数的数是几？', '2', ['1', '4', '9']],
      ['1 是质数还是合数？', '都不是', ['质数', '合数', '偶数']],
    ]
    const [p, correct, wrongs] = rng.pick(bank)
    const { choices, answer } = choicesOf(rng, correct, wrongs)
    return makeQ({ ...M, name: '因数与倍数', kind: 'concept' }, d, {
      prompt: p,
      choices,
      answer,
      concept: '质数与合数',
      hints: [
        '质数只有 1 和它本身两个因数；合数有 3 个或更多因数。',
        '1 只有一个因数，所以它既不是质数也不是合数。',
        '逐个选项检验因数的个数，找出答案。',
      ],
    })
  }
  const n = rng.pick([91, 87, 51, 57, 119])
  return makeQ({ ...M, name: '因数与倍数', kind: 'concept' }, d, {
    prompt: `${n} 是质数还是合数？`,
    answer: 0,
    choices: ['质数', '合数'],
    concept: '判断质数合数',
    hints: [
      '别被大数吓到：只要找到 1 和它本身之外的因数，它就是合数。',
      `试一试小的质数：2、3、5、7、11……哪个能整除 ${n}？`,
      `发现能整除的数就找到了别的因数，${n} 是什么数？`,
    ],
  })
}

// ---------- 分数的意义 ----------
function genFrac(d: Difficulty, rng: Rng) {
  if (d === 'medium') {
    const parts = rng.pick([5, 6, 7, 8])
    const filled = rng.int(1, parts - 2)
    const reduced = reduceFrac(filled, parts)
    const whole = rng.bool()
    if (whole) {
      return makeQ({ ...M, name: '分数的意义', kind: 'concept' }, d, {
        prompt: `把一根绳子平均分成 ${parts} 段，每段是这根绳子的几分之几？`,
        figure: { kind: 'fracBar', parts, filled: 1 },
        answer: { n: 1, d: parts },
        concept: '分数表示部分与整体',
        hints: [
          '分的是"整根绳子"，跟绳子多长没有关系。',
          `平均分成 ${parts} 段，每段就是其中的一份。`,
          `分母是 ${parts}，分子是 1，这个分数是几分之几？`,
        ],
      })
    }
    return makeQ({ ...M, name: '分数的意义', kind: 'concept' }, d, {
      prompt: '看图，涂色部分占整个图形的几分之几？（能约分要约分）',
      figure: { kind: 'fracPie', parts, filled },
      answer: reduced,
      requireReduced: true,
      concept: '分数与约分',
      hints: [
        `先数：平均分成 ${parts} 份，涂了 ${filled} 份，分数是 ${filled}/${parts}。`,
        `检查能不能约分：找 ${filled} 和 ${parts} 的公因数（最大公因数是 ${gcd(filled, parts)}）。`,
        `分子分母同时除以 ${gcd(filled, parts)}，得到最简分数。`,
      ],
    })
  }
  if (d === 'hard') {
    const pairs: [number, number][] = [
      [12, 18],
      [16, 24],
      [9, 12],
      [10, 15],
      [18, 27],
      [8, 20],
    ]
    const [n, dd] = rng.pick(pairs)
    const g = gcd(n, dd)
    return makeQ({ ...M, name: '分数的意义', kind: 'calc' }, d, {
      prompt: `把 ${n}/${dd} 化成最简分数（先填分子，再填分母）`,
      answer: reduceFrac(n, dd),
      requireReduced: true,
      concept: '约分',
      hints: [
        '约分：找分子和分母的最大公因数。',
        `${n} 和 ${dd} 的最大公因数是 ${g}。`,
        `分子分母同时 ÷ ${g}，得到最简分数。`,
      ],
    })
  }
  // challenge：通分比较
  const pairs: [number, number, number, number][] = [
    [3, 4, 5, 6],
    [2, 3, 3, 5],
    [4, 7, 3, 5],
    [5, 8, 7, 12],
  ]
  const [a1, b1, a2, b2] = rng.pick(pairs)
  const ans = a1 / b1 > a2 / b2 ? '>' : a1 / b1 < a2 / b2 ? '<' : '='
  return makeQ({ ...M, name: '分数的意义', kind: 'concept' }, d, {
    prompt: `比较大小：${a1}/${b1} 〇 ${a2}/${b2}（分母不同，先通分）`,
    figure: { kind: 'fracBar', parts: b1, filled: a1 },
    answer: ans,
    concept: '通分比较大小',
    hints: [
      '分母不同不能直接比，先通分：找两个分母的最小公倍数作公分母。',
      `${b1} 和 ${b2} 的最小公倍数是 ${lcmOf(b1, b2)}。`,
      `两个分数都化成分母是 ${lcmOf(b1, b2)} 的分数后，比较分子的大小。`,
    ],
  })
}
function lcmOf(a: number, b: number): number {
  return (a * b) / gcd(a, b)
}

// ---------- 分数加减法 ----------
function genFracAdd(d: Difficulty, rng: Rng) {
  if (d === 'medium') {
    const dd = rng.pick([4, 5, 6, 8])
    const a = rng.int(1, dd - 2)
    const b = rng.int(1, dd - a)
    const raw = { n: a + b, d: dd }
    const ans = reduceFrac(raw.n, raw.d)
    return makeQ({ ...M, name: '分数加减法', kind: 'calc' }, d, {
      prompt: `${a}/${dd} + ${b}/${dd} = ？（结果要约成最简分数）`,
      figure: { kind: 'fracBar', parts: dd, filled: a },
      answer: ans,
      requireReduced: true,
      concept: '同分母分数加法',
      hints: [
        '同分母相加：分母不变，分子相加。',
        `分子：${a} + ${b}，分母还是 ${dd}，先得到 ${a + b}/${dd}。`,
        `检查约分：${a + b} 和 ${dd} 的最大公因数是 ${gcd(a + b, dd)}，约成最简分数。`,
      ],
    })
  }
  if (d === 'hard') {
    const pairs: [number, number, number, number][] = [
      [1, 2, 1, 3],
      [1, 2, 1, 4],
      [1, 3, 1, 4],
      [2, 3, 1, 6],
      [3, 4, 1, 6],
      [1, 2, 2, 5],
    ]
    const [a1, b1, a2, b2] = rng.pick(pairs)
    const g = gcd(a1 * b2 + a2 * b1, b1 * b2)
    return makeQ({ ...M, name: '分数加减法', kind: 'calc' }, d, {
      prompt: `${a1}/${b1} + ${a2}/${b2} = ？（先通分再相加，结果化简）`,
      answer: reduceFrac((a1 * b2 + a2 * b1) / g, (b1 * b2) / g),
      requireReduced: true,
      concept: '异分母分数加法',
      hints: [
        `先通分：公分母是 ${b1} 和 ${b2} 的最小公倍数 ${lcmOf(b1, b2)}。`,
        `${a1}/${b1} = ？/${lcmOf(b1, b2)}，${a2}/${b2} = ？/${lcmOf(b1, b2)}（分子分母同时乘同一个数）。`,
        '通分后分子相加、分母不变，最后约成最简分数。',
      ],
    })
  }
  // challenge：1 减两个分数
  const b1 = rng.pick([4, 5])
  const b2 = rng.pick([2, 5, 4, 10].filter((x) => x !== b1))
  const a1 = rng.int(1, b1 - 1)
  const a2 = rng.int(1, b2 - 1)
  const L = lcmOf(b1, b2)
  const num = L - (a1 * L) / b1 - (a2 * L) / b2
  return makeQ({ ...M, name: '分数加减法', kind: 'calc' }, d, {
    prompt: `1 - ${a1}/${b1} - ${a2}/${b2} = ？（把 1 看作分子分母相同的分数，结果化简）`,
    answer: reduceFrac(num, L),
    requireReduced: true,
    concept: '单位"1"的减法',
    hints: [
      `先把 1 化成用公分母表示的分数：公分母是 ${b1} 和 ${b2} 的最小公倍数 ${L}，所以 1 = ${L}/${L}。`,
      `再把 ${a1}/${b1} 和 ${a2}/${b2} 都通分成分母是 ${L} 的分数。`,
      `最后用 ${L}/${L} 连续减去两个分数，分子相减、分母不变，再化简。`,
    ],
  })
}

// ---------- 多边形面积 ----------
function genArea(d: Difficulty, rng: Rng) {
  if (d === 'medium') {
    const base = rng.pick([12, 15, 18, 24, 25])
    const h = rng.pick([6, 8, 10, 12])
    return makeQ({ ...M, name: '多边形面积', kind: 'calc' }, d, {
      prompt: `平行四边形的底是 ${base} 厘米，高是 ${h} 厘米，面积是多少平方厘米？`,
      figure: { kind: 'polygon', ptype: 'parallelogram', labels: { bottom: `${base}厘米`, height: `${h}厘米` }, showHeight: true },
      answer: base * h,
      unit: '平方厘米',
      concept: '平行四边形面积 = 底 × 高',
      hints: solveHints({
        concept: '平行四边形面积公式',
        knowns: [`底 ${base} 厘米`, `高 ${h} 厘米`],
        ask: '面积',
        method: '沿高剪开、平移，平行四边形能变成长方形：面积 = 底 × 高。',
        setup: `列式：${base} × ${h} = ？`,
      }),
    })
  }
  if (d === 'hard') {
    if (rng.bool()) {
      const base = rng.pick([10, 12, 16, 20])
      const h = rng.pick([6, 9, 12, 15])
      return makeQ({ ...M, name: '多边形面积', kind: 'calc' }, d, {
        prompt: `三角形的底是 ${base} 厘米，高是 ${h} 厘米，面积是多少平方厘米？`,
        figure: { kind: 'polygon', ptype: 'triangle', labels: { bottom: `${base}厘米` }, showHeight: true },
        answer: (base * h) / 2,
        unit: '平方厘米',
        concept: '三角形面积 = 底 × 高 ÷ 2',
        hints: solveHints({
          concept: '三角形面积公式',
          knowns: [`底 ${base} 厘米`, `高 ${h} 厘米`],
          ask: '面积',
          method: '两个完全一样的三角形能拼成一个平行四边形，所以三角形面积是它的一半。',
          setup: `列式：${base} × ${h} ÷ 2 = ？`,
          first: `第一步：${base} × ${h} = ？再除以 2`,
        }),
      })
    }
    const base = rng.pick([6, 8, 10, 12])
    const h = rng.pick([3, 4, 5, 6])
    const area = base * h
    return makeQ({ ...M, name: '多边形面积', kind: 'calc' }, d, {
      prompt: `平行四边形的面积是 ${area} 平方厘米，底是 ${base} 厘米，高是多少厘米？`,
      answer: h,
      unit: '厘米',
      concept: '面积公式的逆用',
      hints: solveHints({
        concept: '平行四边形面积公式逆用',
        knowns: [`面积 ${area} 平方厘米`, `底 ${base} 厘米`],
        ask: '高是多少厘米',
        method: '面积 = 底 × 高，反过来：高 = 面积 ÷ 底。',
        setup: `列式：${area} ÷ ${base} = ？`,
      }),
    })
  }
  // challenge：梯形
  const top = rng.pick([4, 6, 8])
  const bottom = rng.pick([10, 12, 14])
  const h = rng.pick([5, 6, 8])
  return makeQ({ ...M, name: '多边形面积', kind: 'calc' }, d, {
    prompt: `梯形的上底 ${top} 厘米，下底 ${bottom} 厘米，高 ${h} 厘米，面积是多少平方厘米？`,
    figure: { kind: 'polygon', ptype: 'trapezoid', labels: { top: `${top}厘米`, bottom: `${bottom}厘米` }, showHeight: true },
    answer: ((top + bottom) * h) / 2,
    unit: '平方厘米',
    concept: '梯形面积 = (上底 + 下底) × 高 ÷ 2',
    hints: solveHints({
      concept: '梯形面积公式',
      knowns: [`上底 ${top}`, `下底 ${bottom}`, `高 ${h}`],
      ask: '面积',
      method: '两个完全一样的梯形能拼成一个平行四边形，底 = 上底 + 下底。',
      setup: `第一步：${top} + ${bottom} = ？第二步：× ${h} 再 ÷ 2。`,
    }),
  })
}

// ---------- 长方体和正方体 ----------
function genSolid(d: Difficulty, rng: Rng) {
  if (d === 'medium') {
    const a = rng.pick([5, 6, 7, 8])
    return makeQ({ ...M, name: '长方体和正方体', kind: 'calc' }, d, {
      prompt: `一个正方体的棱长是 ${a} 厘米，它的棱长总和是多少厘米？`,
      figure: { kind: 'box3d', labels: { w: `${a}厘米`, h: `${a}厘米`, d: `${a}厘米` } },
      answer: a * 12,
      unit: '厘米',
      concept: '正方体有 12 条相等的棱',
      hints: solveHints({
        concept: '正方体棱长总和',
        knowns: [`棱长 ${a} 厘米`],
        ask: '棱长总和',
        method: '正方体有 12 条棱，每条都一样长。',
        setup: `列式：${a} × 12 = ？`,
      }),
    })
  }
  if (d === 'hard') {
    if (rng.bool()) {
      const w = rng.pick([5, 7, 8])
      const h = rng.pick([3, 4])
      const dep = rng.pick([6, 9])
      const s = 2 * (w * h + w * dep + h * dep)
      return makeQ({ ...M, name: '长方体和正方体', kind: 'calc' }, d, {
        prompt: `长方体长 ${w} 厘米、宽 ${dep} 厘米、高 ${h} 厘米，表面积是多少平方厘米？`,
        figure: { kind: 'box3d', labels: { w: `长${w}`, d: `宽${dep}`, h: `高${h}` } },
        answer: s,
        unit: '平方厘米',
        concept: '表面积 = 上下 + 前后 + 左右',
        hints: solveHints({
          concept: '长方体表面积',
          knowns: [`长 ${w}`, `宽 ${dep}`, `高 ${h}`],
          ask: '表面积',
          method: '6 个面分成 3 组，每组 2 个：上下面、前后面、左右面。表面积 = (长×宽 + 长×高 + 宽×高) × 2。',
          setup: `第一步：${w}×${dep} + ${w}×${h} + ${dep}×${h} = ？第二步：× 2。`,
        }),
      })
    }
    const w = rng.pick([6, 8])
    const dep = rng.pick([4, 5])
    const h = rng.pick([3, 2])
    return makeQ({ ...M, name: '长方体和正方体', kind: 'calc' }, d, {
      prompt: `长方体长 ${w} 厘米、宽 ${dep} 厘米、高 ${h} 厘米，体积是多少立方厘米？`,
      figure: { kind: 'box3d', labels: { w: `长${w}`, d: `宽${dep}`, h: `高${h}` } },
      answer: w * dep * h,
      unit: '立方厘米',
      concept: '长方体体积 = 长 × 宽 × 高',
      hints: solveHints({
        concept: '长方体体积公式',
        knowns: [`长 ${w}`, `宽 ${dep}`, `高 ${h}`],
        ask: '体积',
        method: '体积就是里面能放多少个 1 立方厘米的小方块：V = 长 × 宽 × 高。',
        setup: `列式：${w} × ${dep} × ${h} = ？`,
      }),
    })
  }
  // challenge：棱长总和逆推
  const total = rng.pick([48, 60, 72])
  const edge = total / 12
  return makeQ({ ...M, name: '长方体和正方体', kind: 'calc' }, d, {
    prompt: `一个正方体的棱长总和是 ${total} 厘米，它的体积是多少立方厘米？`,
    figure: { kind: 'box3d', labels: {} },
    answer: edge ** 3,
    unit: '立方厘米',
    concept: '先求棱长再求体积',
    hints: solveHints({
      concept: '棱长总和 = 棱长 × 12',
      knowns: [`棱长总和 ${total} 厘米`],
      ask: '体积',
      method: '先用棱长总和 ÷ 12 求出一条棱的长度，再用棱长 × 棱长 × 棱长求体积。',
      setup: `第一步：${total} ÷ 12 = ？第二步：得数 × 得数 × 得数。`,
    }),
  })
}

// ---------- 植树问题 ----------
function genPlant(d: Difficulty, rng: Rng) {
  if (d === 'hard') {
    const gap = rng.pick([5, 6, 8, 10])
    const n = rng.int(12, 30)
    const len = gap * n
    return makeQ({ ...M, name: '植树问题', kind: 'word' }, d, {
      prompt: `一条 ${len} 米长的小路一侧栽树，每隔 ${gap} 米栽一棵（两端都栽），一共要栽多少棵树？`,
      figure: { kind: 'numberline', min: 0, max: n, marks: [] },
      answer: n + 1,
      unit: '棵',
      concept: '两端都栽：棵数 = 间隔数 + 1',
      hints: solveHints({
        concept: '植树问题（两端都栽）',
        knowns: [`小路长 ${len} 米`, `每隔 ${gap} 米一棵`, '两端都栽'],
        ask: '要栽多少棵',
        method: `先算间隔数：总长 ÷ 每隔长度。两端都栽时，棵数比间隔数多 1。`,
        setup: `第一步：${len} ÷ ${gap} = ？（间隔数）`,
        first: `间隔数求出来后，加 1 就是棵数`,
      }),
    })
  }
  // challenge：封闭图形
  const gap = rng.pick([8, 10, 12])
  const n = rng.int(15, 40)
  const len = gap * n
  return makeQ({ ...M, name: '植树问题', kind: 'word' }, d, {
    prompt: `圆形池塘周围每隔 ${gap} 米栽一棵树，一共栽了 ${n} 棵，池塘一周的长是多少米？`,
    answer: len,
    unit: '米',
    concept: '封闭图形：棵数 = 间隔数',
    hints: solveHints({
      concept: '封闭图形的植树问题',
      knowns: [`每隔 ${gap} 米一棵`, `共栽 ${n} 棵`],
      ask: '一周长多少米',
      method: '首尾相接的封闭图形：棵数正好等于间隔数（不多不少）。',
      setup: `第一步：确认间隔数 = ${n}。第二步：${gap} × ${n} = ？`,
    }),
  })
}

export const G5_TOPICS: TopicDef[] = [
  { id: 'g5-decmult', grade: 5, name: '小数乘法', kind: 'calc', difficulties: ['easy', 'medium', 'hard', 'challenge'], term: 1, gen: genDecMult },
  { id: 'g5-decdiv', grade: 5, name: '小数除法', kind: 'calc', difficulties: ['easy', 'medium', 'hard', 'challenge'], term: 1, gen: genDecDiv },
  { id: 'g5-eq', grade: 5, name: '简易方程', kind: 'calc', difficulties: ['easy', 'medium', 'hard', 'challenge'], term: 1, gen: genEquation },
  { id: 'g5-factor', grade: 5, name: '因数与倍数', kind: 'concept', difficulties: ['easy', 'medium', 'hard'], term: 2, gen: genFactor },
  { id: 'g5-frac', grade: 5, name: '分数的意义', kind: 'concept', difficulties: ['medium', 'hard', 'challenge'], term: 2, gen: genFrac },
  { id: 'g5-fracadd', grade: 5, name: '分数加减法', kind: 'calc', difficulties: ['medium', 'hard', 'challenge'], term: 2, gen: genFracAdd },
  { id: 'g5-area', grade: 5, name: '多边形面积', kind: 'calc', difficulties: ['medium', 'hard', 'challenge'], term: 1, gen: genArea },
  { id: 'g5-solid', grade: 5, name: '长方体和正方体', kind: 'calc', difficulties: ['medium', 'hard', 'challenge'], term: 2, gen: genSolid },
  { id: 'g5-plant', grade: 5, name: '植树问题', kind: 'word', difficulties: ['hard', 'challenge'], term: 1, gen: genPlant },
]
