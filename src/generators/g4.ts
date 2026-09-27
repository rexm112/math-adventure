// 四年级 · 人教版：大数的认识、三位数×两位数、除数两位数、四则运算、运算定律、
// 角的度量、三角形、平行四边形与梯形、小数、应用题（平均数/行程/鸡兔同笼）
import type { Difficulty, Rng, TopicDef } from '../types'
import { choicesOf, makeQ, solveHints } from './helpers'

const M = { id: 'g4', grade: 4 as const }

// ---------- 大数的认识 ----------
function genBigNum(d: Difficulty, rng: Rng) {
  if (d === 'easy') {
    const bank: [string, number, string][] = [
      ['由 3 个百万和 5 个万组成的数是多少？', 3050000, '3 个百万，百万位写 3；5 个万，万位写 5，其他位补 0'],
      ['由 8 个千万和 6 个十万组成的数是多少？', 80600000, '千万位 8，十万位 6，中间的百万位、万位都要补 0'],
      ['100 个一万是多少？', 1000000, '100 个一万就是一百万'],
      ['100 个一百万是多少？', 100000000, '100 个一百万就是一亿'],
    ]
    const [p, ans, h] = rng.pick(bank)
    return makeQ({ ...M, name: '大数的认识', kind: 'concept' }, d, {
      prompt: p,
      answer: ans,
      concept: '按数位组成写数',
      hints: [
        '先想每个计数单位对应的数位，画一个数位顺序表。',
        h + '。',
        '从高位到低位，一位一位写，空位用 0 占住。',
      ],
    })
  }
  if (d === 'medium') {
    if (rng.bool()) {
      const base = rng.int(1, 99) * rng.pick([10000, 100000])
      const ans = base / 10000
      return makeQ({ ...M, name: '大数的认识', kind: 'calc' }, d, {
        prompt: `${base.toLocaleString('en-US')} = 多少万？`,
        answer: ans,
        unit: '万',
        concept: '改写成"万"作单位',
        hints: [
          '把整万的数改写成"万"作单位：去掉末尾 4 个 0，加上"万"字。',
          `${base} 末尾有 4 个 0，去掉后剩下多少？`,
          '剩下的数就是多少万。',
        ],
      })
    }
    const n = rng.int(100000, 999999)
    const wan = Math.floor(n / 10000)
    const ans = n % 10000 >= 5000 ? wan + 1 : wan
    return makeQ({ ...M, name: '大数的认识', kind: 'calc' }, d, {
      prompt: `把 ${n.toLocaleString('en-US')} 四舍五入到万位，大约是多少万？`,
      answer: ans,
      unit: '万',
      concept: '四舍五入到万位',
      hints: [
        '四舍五入看"千位"：千位上的数决定入还是舍。',
        `${n} 的千位上是 ${Math.floor((n % 10000) / 1000)}。满 5 了吗？`,
        `满 5 就把万位加 1（入），不满 5 万位不变（舍）。${n} 大约是多少万？`,
      ],
    })
  }
  // hard：读数中的 0
  if (rng.bool()) {
    const cases: [number, number, string][] = [
      [30700900, 1, '每级末尾的 0 不读，其他数位有一个或几个 0 都只读一个"零"'],
      [4005000, 1, '万级末尾的 0 和个级开头的 0，只读一个零'],
      [10020030, 2, '逐级分析：个级开头的 0 读一个零，千万位与百万位之间的 0 再读一个'],
    ]
    const [n, zeros, h] = rng.pick(cases)
    return makeQ({ ...M, name: '大数的认识', kind: 'concept' }, d, {
      prompt: `读 ${n.toLocaleString('en-US')} 时，要读出几个"零"？`,
      answer: zeros,
      unit: '个',
      concept: '大数中 0 的读法',
      hints: [
        '读数规则：每级末尾的 0 都不读；其他数位不管有几个连续的 0，都只读一个零。',
        `先分级（万级 | 个级）：${Math.floor(n / 10000)} | ${String(n % 10000).padStart(4, '0')}。逐级看 0 的位置。`,
        h + '。数一数一共读几个零。',
      ],
    })
  }
  const { a, b } = { a: rng.int(10000, 99999) * 10, b: rng.int(1000, 9999) * 100 }
  const ans = a > b ? '>' : a < b ? '<' : '='
  return makeQ({ ...M, name: '大数的认识', kind: 'concept' }, d, {
    prompt: `${a.toLocaleString('en-US')} 〇 ${b.toLocaleString('en-US')}（在〇里填 >、< 或 =）`,
    answer: ans,
    concept: '大数比较大小',
    hints: [
      '先比位数：位数多的数大。',
      `${a} 是 ${String(a).length} 位数，${b} 是 ${String(b).length} 位数。`,
      '位数相同从最高位比起。谁大？',
    ],
  })
}

// ---------- 三位数乘两位数 ----------
function genMult(d: Difficulty, rng: Rng) {
  if (d === 'easy') {
    const a = rng.pick([120, 210, 300, 400])
    const b = rng.pick([30, 40, 50])
    return makeQ({ ...M, name: '三位数乘两位数', kind: 'calc' }, d, {
      prompt: `${a} × ${b} = ？`,
      answer: a * b,
      concept: '整十数乘法',
      hints: [
        '先算 0 前面的数相乘。',
        `${a / 10} × ${b / 10} = ？`,
        '两个因数一共有 2 个 0，得数末尾也添 2 个 0。',
      ],
    })
  }
  if (d === 'medium') {
    const a = rng.int(105, 199)
    const b = rng.int(12, 44)
    return makeQ({ ...M, name: '三位数乘两位数', kind: 'calc' }, d, {
      prompt: `${a} × ${b} = ？`,
      answer: a * b,
      concept: '三位数乘两位数笔算',
      hints: [
        '把两位数拆成整十和几个一，分别乘再相加。',
        `第一步：${a} × ${Math.floor(b / 10) * 10} = ？第二步：${a} × ${b % 10} = ？`,
        '两个部分积相加，注意第二层的 0 别丢了。',
      ],
    })
  }
  if (d === 'hard') {
    const a = rng.pick([108, 206, 305, 409])
    const b = rng.int(23, 46)
    return makeQ({ ...M, name: '三位数乘两位数', kind: 'calc' }, d, {
      prompt: `${a} × ${b} = ？`,
      answer: a * b,
      concept: '中间有 0 的乘法',
      hints: [
        '十位上的 0 也要乘：0 × 任何数 = 0，但要加进位。',
        `个位乘完向十位进了几？十位：0 × ${b} + 进位。`,
        '再算百位。用 calculator 不能用哦，列竖式一步一步来。',
      ],
    })
  }
  // challenge：行程
  const speed = rng.pick([65, 85, 105, 110])
  const t = rng.int(6, 14)
  return makeQ({ ...M, name: '三位数乘两位数', kind: 'word' }, d, {
    prompt: `一列火车每小时行 ${speed} 千米，照这样的速度行 ${t} 小时，一共行了多少千米？`,
    answer: speed * t,
    unit: '千米',
    concept: '路程 = 速度 × 时间',
    hints: solveHints({
      concept: '速度、时间、路程的关系',
      knowns: [`每小时行 ${speed} 千米（速度）`, `行了 ${t} 小时（时间）`],
      ask: '一共行了多少千米（路程）',
      method: '路程 = 速度 × 时间。',
      setup: `列式：${speed} × ${t} = ？`,
    }),
  })
}

// ---------- 除数是两位数 ----------
function genDiv(d: Difficulty, rng: Rng) {
  if (d === 'medium') {
    const b = rng.pick([20, 30, 40, 60, 80])
    const q = rng.int(12, 45)
    return makeQ({ ...M, name: '除数是两位数', kind: 'calc' }, d, {
      prompt: `${b * q} ÷ ${b} = ？`,
      answer: q,
      concept: '整十数除法',
      hints: [
        '整十数除法：先不看除数末尾的 0。',
        `想：${b / 10} × 多少 = ${b * q / 10}？`,
        '商不变，直接写出得数。',
      ],
    })
  }
  if (d === 'hard') {
    if (rng.bool()) {
      const b = rng.pick([16, 24, 25, 32, 45])
      const q = rng.int(12, 40)
      return makeQ({ ...M, name: '除数是两位数', kind: 'calc' }, d, {
        prompt: `${b * q} ÷ ${b} = ？`,
        answer: q,
        concept: '试商',
        hints: [
          '试商：把除数看成最接近的整十数来估。',
          `${b} ≈ ${Math.round(b / 10) * 10}。被除数的前两三位里有几个 ${Math.round(b / 10) * 10}？`,
          `初商可能偏大或偏小，用 ${b} × 商 验算调整，算到没有余数。`,
        ],
      })
    }
    const pairs: [number, number, number][] = [
      [3600, 400, 9],
      [2800, 700, 4],
      [5600, 800, 7],
      [1200, 200, 6],
    ]
    const [a, b, q] = rng.pick(pairs)
    return makeQ({ ...M, name: '除数是两位数', kind: 'calc' }, d, {
      prompt: `${a} ÷ ${b} = ？（巧算：商不变）`,
      answer: q,
      concept: '商不变的规律',
      hints: [
        '商不变规律：被除数和除数同时乘或除以同一个数（0 除外），商不变。',
        `${a} 和 ${b} 同时去掉 2 个 0：变成 ${a / 100} ÷ ${b / 100}。`,
        '算出小算式的商，就是原来的商。',
      ],
    })
  }
  // challenge：乘除关系应用
  const per = rng.int(21, 35)
  const boxes = rng.int(11, 25)
  const rest = rng.int(5, 19)
  return makeQ({ ...M, name: '除数是两位数', kind: 'word' }, d, {
    prompt: `包装车间每箱装 ${per} 个玩具，装了 ${boxes} 箱后还剩 ${rest} 个，这批玩具一共有多少个？`,
    answer: per * boxes + rest,
    unit: '个',
    concept: '总数 = 每箱数 × 箱数 + 余下',
    hints: solveHints({
      concept: '总数 = 每份数 × 份数 + 余数',
      knowns: [`每箱 ${per} 个`, `装了 ${boxes} 箱`, `还剩 ${rest} 个没装`],
      ask: '玩具一共多少个',
      method: '先算装箱的总数，再加上没装的。',
      setup: `第一步：${per} × ${boxes} = ？第二步：加上 ${rest}。`,
    }),
  })
}

// ---------- 四则运算 ----------
function genOrder(d: Difficulty, rng: Rng) {
  if (d === 'medium') {
    const a = rng.int(12, 30)
    const b = rng.int(3, 6)
    const c = rng.int(10, a * b - 6)
    return makeQ({ ...M, name: '四则运算', kind: 'calc' }, d, {
      prompt: `${a} × ${b} - ${c} = ？`,
      answer: a * b - c,
      concept: '先乘除后加减',
      hints: [
        '没有括号的混合运算：先算乘除，后算加减。',
        `第一步：先算 ${a} × ${b} = ？`,
        `第二步：用得数减去 ${c}。算出最终结果。`,
      ],
    })
  }
  if (d === 'hard') {
    const div = rng.pick([2, 3, 4, 5])
    const q = rng.int(5, 15)
    const add = rng.int(10, 30)
    const b = rng.int(12, 40)
    const diff = div * q
    const a = diff + b
    return makeQ({ ...M, name: '四则运算', kind: 'calc' }, d, {
      prompt: `(${a} - ${b}) ÷ ${div} + ${add} = ？`,
      answer: q + add,
      concept: '有括号先算括号里',
      hints: [
        '运算顺序：先括号里，再乘除，后加减。',
        `第一步：${a} - ${b} = ？`,
        `第二步：差 ÷ ${div} = ？第三步：再加上 ${add}。`,
      ],
    })
  }
  // challenge：连续减
  const per = rng.pick([25, 50])
  const from = per * rng.int(6, 12)
  const to = rng.pick([100, 200, 300])
  const ans = (from - to) / per
  return makeQ({ ...M, name: '四则运算', kind: 'word' }, d, {
    prompt: `从 ${from} 里连续减去 ${per}，减几次后剩下的正好是 ${to}？`,
    answer: ans,
    unit: '次',
    concept: '包含除思路',
    hints: solveHints({
      concept: '先求一共要减掉多少，再看里面有几个' + per,
      knowns: [`从 ${from} 里减`, `每次减 ${per}`, `最后剩下 ${to}`],
      ask: '减几次',
      method: `一共要减掉的数是 ${from} - ${to}，再看它里面有几个 ${per}。`,
      setup: `第一步：${from} - ${to} = ？第二步：÷ ${per}。`,
    }),
  })
}

// ---------- 运算定律 ----------
function genLaws(d: Difficulty, rng: Rng) {
  if (d === 'medium') {
    const a = rng.pick([25, 125])
    const b = a === 25 ? 44 : 16
    const ans = a * b
    const four = a === 25 ? 4 : 8
    return makeQ({ ...M, name: '运算定律', kind: 'calc' }, d, {
      prompt: `用简便方法算：${a} × ${b} = ？`,
      answer: ans,
      concept: '乘法结合律简算',
      hints: [
        `看见 ${a} 就想它的好朋友：${a} × ${four} = ${a * four}（整数）`,
        `把 ${b} 拆成 ${four} × ${b / four}。`,
        `式子变成 ${a} × ${four} × ${b / four}：先算 ${a} × ${four} = ${a * four}，再乘 ${b / four}。`,
      ],
    })
  }
  if (d === 'hard') {
    if (rng.bool()) {
      const base = rng.int(23, 78)
      const ans = base * 101
      return makeQ({ ...M, name: '运算定律', kind: 'calc' }, d, {
        prompt: `用简便方法算：${base} × 101 = ？`,
        answer: ans,
        concept: '乘法分配律',
        hints: [
          '把 101 拆成 100 + 1。',
          `式子变成 ${base} × 100 + ${base} × 1。`,
          `两部分相加：${base * 100} + ${base} = ？`,
        ],
      })
    }
    const base = rng.int(24, 68)
    const ans = base * 99
    return makeQ({ ...M, name: '运算定律', kind: 'calc' }, d, {
      prompt: `用简便方法算：${base} × 99 = ？`,
      answer: ans,
      concept: '乘法分配律（凑整）',
      hints: [
        '99 差 1 就是 100，先当 100 算。',
        `${base} × 99 = ${base} × 100 - ${base} × 1。`,
        `先算 ${base} × 100 = ${base * 100}，再减去 ${base}。`,
      ],
    })
  }
  // challenge
  if (rng.bool()) {
    return makeQ({ ...M, name: '运算定律', kind: 'calc' }, d, {
      prompt: '用简便方法算：125 × 32 × 25 = ？',
      answer: 100000,
      concept: '连乘凑整',
      hints: [
        '好朋友数：125 × 8 = 1000，25 × 4 = 100。',
        '把 32 拆成 8 × 4。',
        '式子变成 (125 × 8) × (25 × 4)：两个整数再相乘。',
      ],
    })
  }
  const base = rng.int(36, 89)
  return makeQ({ ...M, name: '运算定律', kind: 'calc' }, d, {
    prompt: `用简便方法算：${base} × 99 + ${base} = ？`,
    answer: base * 100,
    concept: '乘法分配律（提取公因数）',
    hints: [
      `${base} × 99 和 ${base} 有共同的因数 ${base}。`,
      `提取公因数：${base} × (99 + 1)。`,
      '括号里 = 100，再乘出来。',
    ],
  })
}

// ---------- 角的度量 ----------
function genAngle(d: Difficulty, rng: Rng) {
  if (d === 'medium') {
    const a = rng.pick([25, 35, 40, 55])
    return makeQ({ ...M, name: '角的度量', kind: 'calc' }, d, {
      prompt: `一个角 ${a}°，与它拼成直角的另一个角是多少度？`,
      figure: { kind: 'angle', deg: a, showDeg: true },
      answer: 90 - a,
      unit: '°',
      concept: '直角 = 90°',
      hints: [
        '直角是 90°。',
        `两个角拼成直角，说明两个角的和是 90°。`,
        `列式：90 - ${a} = ？`,
      ],
    })
  }
  if (d === 'hard') {
    const a = rng.pick([35, 40, 45, 60, 75])
    return makeQ({ ...M, name: '角的度量', kind: 'calc' }, d, {
      prompt: `一条射线绕它的端点转了半圈，形成的角（平角）里包含一个 ${a}° 的角，另一个角是多少度？`,
      answer: 180 - a,
      unit: '°',
      concept: '平角 = 180°',
      hints: [
        '半圈是平角，等于 180°。',
        '平角被分成两个角，两个角的和是 180°。',
        `列式：180 - ${a} = ？`,
      ],
    })
  }
  // challenge：钟面角
  const h = rng.pick([1, 2, 3, 4, 5])
  return makeQ({ ...M, name: '角的度量', kind: 'concept' }, d, {
    prompt: `${h} 时整，钟面上时针和分针的夹角（较小角）是多少度？`,
    figure: { kind: 'clock', h, m: 0 },
    answer: h * 30,
    unit: '°',
    concept: '钟面每大格 30°',
    hints: [
      '分针一圈 360°，钟面 12 个大格。',
      '每个大格：360 ÷ 12 = 30°。',
      `${h} 时整，时针和分针相隔 ${h} 个大格：30 × ${h} = ？`,
    ],
  })
}

// ---------- 三角形 ----------
function genTriangle(d: Difficulty, rng: Rng) {
  if (d === 'medium') {
    const a = rng.int(30, 70)
    const b = rng.int(30, 180 - a - 20)
    return makeQ({ ...M, name: '三角形', kind: 'calc' }, d, {
      prompt: `三角形中两个角分别是 ${a}° 和 ${b}°，第三个角是多少度？`,
      figure: { kind: 'polygon', ptype: 'triangle', labels: {} },
      answer: 180 - a - b,
      unit: '°',
      concept: '三角形内角和 180°',
      hints: [
        '任何三角形的内角和都是 180°。',
        `三个角的总和 - 已知两个角 = 第三个角。`,
        `列式：180 - ${a} - ${b} = ？`,
      ],
    })
  }
  if (d === 'hard') {
    if (rng.bool()) {
      const top = rng.pick([40, 60, 80, 100])
      return makeQ({ ...M, name: '三角形', kind: 'calc' }, d, {
        prompt: `等腰三角形的一个顶角是 ${top}°，一个底角是多少度？`,
        answer: (180 - top) / 2,
        unit: '°',
        concept: '等腰三角形两底角相等',
        hints: [
          '等腰三角形的两个底角完全相等。',
          `顶角 ${top}°，剩下两个底角一共 180 - ${top} 度。`,
          '把剩下的度数平均分成 2 份，就是一个底角。',
        ],
      })
    }
    const a = rng.int(4, 9)
    const b = rng.int(a + 2, a + 7)
    return makeQ({ ...M, name: '三角形', kind: 'calc' }, d, {
      prompt: `三角形两条边分别长 ${a} 厘米和 ${b} 厘米，第三边最长是几厘米？（取整数）`,
      answer: a + b - 1,
      unit: '厘米',
      concept: '两边之和大于第三边',
      hints: [
        '三角形三边关系：任意两边之和 > 第三边。',
        `第三边必须小于 ${a} + ${b}。`,
        `取整数，比 ${a + b} 小 1 的数是几？`,
      ],
    })
  }
  // challenge：等腰+内角和综合
  const base = rng.pick([40, 50, 70])
  return makeQ({ ...M, name: '三角形', kind: 'calc' }, d, {
    prompt: `等腰三角形的一个底角是 ${base}°，顶角是多少度？它是什么三角形？先答顶角度数`,
    answer: 180 - base * 2,
    unit: '°',
    concept: '等腰三角形与内角和',
    hints: [
      '两个底角相等，都是 ' + base + '°。',
      `两个底角一共 ${base} × 2 度。`,
      `顶角 = 180 - ${base * 2} = ？`,
    ],
  })
}

// ---------- 平行四边形与梯形 ----------
function genQuad(d: Difficulty, rng: Rng) {
  if (d === 'easy') {
    const bank: [string, string, string[]][] = [
      ['只有一组对边平行的四边形叫做什么？', '梯形', ['长方形', '正方形', '平行四边形']],
      ['两组对边分别平行的四边形叫做什么？', '平行四边形', ['梯形', '三角形', '正六边形']],
      ['平行四边形容易变形，具有什么特性？', '不稳定性', ['稳定性', '对称性', '旋转性']],
    ]
    const [p, correct, wrongs] = rng.pick(bank)
    const { choices, answer } = choicesOf(rng, correct, wrongs)
    return makeQ({ ...M, name: '平行四边形与梯形', kind: 'concept' }, d, {
      prompt: p,
      choices,
      answer,
      concept: '四边形的分类',
      hints: [
        '回忆三种图形的边有什么特点。',
        '平行四边形两组对边平行；梯形只有一组对边平行。',
        '对照定义，选出正确的名称。',
      ],
    })
  }
  const perpendicular = rng.bool()
  const correct = perpendicular ? '互相垂直' : '互相平行'
  const { choices, answer } = choicesOf(rng, correct, ['互相平行', '互相垂直', '相交', '重合'].filter((x) => x !== correct))
  return makeQ({ ...M, name: '平行四边形与梯形', kind: 'concept' }, d, {
    prompt: perpendicular
      ? '两条直线相交成直角，这两条直线叫做什么关系？'
      : '在同一平面内永不相交的两条直线叫做什么关系？',
    choices,
    answer,
    concept: perpendicular ? '垂直' : '平行',
    hints: [
      perpendicular ? '注意题目中的关键词"直角"。' : '注意关键词"永不相交"。',
      perpendicular ? '相交成 90° 的两条直线，有专门的称呼。' : '同一平面内不相交的两条直线，也有专门的称呼。',
      '垂直用直角符号 ⊥ 表示，平行用 ∥ 表示。选一选。',
    ],
  })
}

// ---------- 小数 ----------
function genDecimal(d: Difficulty, rng: Rng) {
  if (d === 'easy') {
    const bank: [string, string, string[]][] = [
      ['0.35 里面有多少个 0.01？', '35个', ['3个', '350个', '5个']],
      ['0.7 里面有多少个 0.1？', '7个', ['70个', '3个', '0个']],
      ['1 里面有多少个 0.01？', '100个', ['10个', '1000个', '1个']],
    ]
    const [p, correct, wrongs] = rng.pick(bank)
    const { choices, answer } = choicesOf(rng, correct, wrongs)
    return makeQ({ ...M, name: '小数的意义', kind: 'concept' }, d, {
      prompt: p,
      choices,
      answer,
      concept: '小数的计数单位',
      hints: [
        '一位小数表示十分之几，计数单位是 0.1。',
        '两位小数表示百分之几，计数单位是 0.01。',
        '看看小数点后有几位，再数一数有几个这样的单位。',
      ],
    })
  }
  if (d === 'medium') {
    if (rng.bool()) {
      const yuan = rng.int(1, 9)
      const jiao = rng.int(1, 9)
      return makeQ({ ...M, name: '小数的意义', kind: 'calc' }, d, {
        prompt: `${yuan} 元 ${jiao} 角 = 多少元？（用小数表示）`,
        answer: yuan + jiao / 10,
        unit: '元',
        concept: '复名数化小数',
        hints: [
          '角和元之间的进率是 10。',
          `${jiao} 角就是 ${jiao}/10 元，写成小数是 0.${jiao}。`,
          `整数部分写 ${yuan}，小数部分写 ${jiao}，是几元？`,
        ],
      })
    }
    const a = rng.pick([0.609, 0.65, 0.6, 0.61, 6.1])
    const b = rng.pick([0.61, 0.609, 0.65, 0.6])
    const ans = a > b ? '>' : a < b ? '<' : '='
    return makeQ({ ...M, name: '小数的意义', kind: 'concept' }, d, {
      prompt: `${a} 〇 ${b}（在〇里填 >、< 或 =）`,
      answer: ans,
      concept: '小数比较大小',
      hints: [
        '先比整数部分，再从十分位起一位一位比。',
        '位数不同不要慌，0.609 的百分位是 0。',
        '一位一位比下去，谁大？',
      ],
    })
  }
  // hard：小数加减
  if (rng.bool()) {
    const a = rng.int(101, 999) / 100
    const b = rng.int(10, 99) / 100
    return makeQ({ ...M, name: '小数加减法', kind: 'calc' }, d, {
      prompt: `${a.toFixed(2)} - ${b.toFixed(2)} = ？`,
      answer: Math.round((a - b) * 100) / 100,
      concept: '小数减法',
      hints: [
        '小数点对齐（数位对齐），再按整数减法算。',
        `末位对齐：${a.toFixed(2)} - ${b.toFixed(2)}，从百分位减起。`,
        '得数点上小数点，末尾有 0 可以化简。',
      ],
    })
  }
  const a = rng.int(11, 99) / 10
  const b = rng.int(11, 99) / 10
  return makeQ({ ...M, name: '小数加减法', kind: 'calc' }, d, {
    prompt: `${a.toFixed(1)} + ${b.toFixed(1)} = ？`,
    answer: Math.round((a + b) * 10) / 10,
    concept: '小数加法',
    hints: [
      '小数点对齐，也就是相同数位对齐。',
      '从最低位加起，满十向前一位进 1。',
      '最后在得数里点上小数点。',
    ],
  })
}

// ---------- 应用题（平均数 / 鸡兔同笼） ----------
function genWord(d: Difficulty, rng: Rng) {
  if (d === 'hard') {
    const scores = [rng.int(85, 99), rng.int(88, 100), rng.int(84, 98)]
    const sum = scores[0] + scores[1] + scores[2]
    const avg = sum / 3
    return makeQ({ ...M, name: '应用题·平均数', kind: 'word' }, d, {
      prompt: `小华前三次数学成绩分别是 ${scores[0]} 分、${scores[1]} 分、${scores[2]} 分，他这三次的平均分是多少？`,
      answer: Math.round(avg * 100) / 100,
      unit: '分',
      concept: '平均数 = 总数量 ÷ 总份数',
      hints: solveHints({
        concept: '平均数 = 总数量 ÷ 总份数',
        knowns: scores.map((s, i) => `第${['一', '二', '三'][i]}次 ${s} 分`),
        ask: '平均分是多少',
        method: '先把三次的成绩加起来求总数，再平均分成 3 份。',
        setup: `第一步：${scores[0]} + ${scores[1]} + ${scores[2]} = ？第二步：总和 ÷ 3。`,
      }),
    })
  }
  // challenge：鸡兔同笼
  const rabbits = rng.int(3, 8)
  const chickens = rng.int(4, 10)
  const heads = rabbits + chickens
  const legs = rabbits * 4 + chickens * 2
  return makeQ({ ...M, name: '应用题·鸡兔同笼', kind: 'word' }, d, {
    prompt: `笼子里有鸡和兔，从上面数有 ${heads} 个头，从下面数有 ${legs} 只脚。兔有多少只？`,
    figure: { kind: 'barModel', bars: [{ label: '鸡·2脚', value: chickens * 2 }, { label: '兔·4脚', value: rabbits * 4 }] },
    answer: rabbits,
    unit: '只',
    concept: '假设法解鸡兔同笼',
    hints: solveHints({
      concept: '鸡兔同笼：假设法',
      knowns: [`共 ${heads} 个头（鸡 + 兔 = ${heads}）`, `共 ${legs} 只脚（鸡 2 脚、兔 4 脚）`],
      ask: '兔有多少只',
      method: '假设笼子里全是鸡，算出脚的总数会和实际相差多少，差是兔比鸡多出的脚造成的。',
      setup: `第一步：假设全是鸡，脚有 ${heads} × 2 = ？只`,
      first: `第二步：实际多出 ${legs} - ${heads * 2} = ？只脚，每只兔比鸡多 2 只脚，多出的脚里有几个 2，就有几只兔`,
    }),
  })
}

export const G4_TOPICS: TopicDef[] = [
  { id: 'g4-bignum', grade: 4, name: '大数的认识', kind: 'concept', difficulties: ['easy', 'medium', 'hard'], term: 1, gen: genBigNum },
  { id: 'g4-mult', grade: 4, name: '三位数乘两位数', kind: 'calc', difficulties: ['easy', 'medium', 'hard', 'challenge'], term: 1, gen: genMult },
  { id: 'g4-div', grade: 4, name: '除数是两位数', kind: 'calc', difficulties: ['medium', 'hard'], term: 1, gen: genDiv },
  { id: 'g4-order', grade: 4, name: '四则运算', kind: 'calc', difficulties: ['medium', 'hard', 'challenge'], term: 2, gen: genOrder },
  { id: 'g4-laws', grade: 4, name: '运算定律·简算', kind: 'calc', difficulties: ['medium', 'hard', 'challenge'], term: 2, gen: genLaws },
  { id: 'g4-angle', grade: 4, name: '角的度量', kind: 'calc', difficulties: ['medium', 'hard', 'challenge'], term: 1, gen: genAngle },
  { id: 'g4-tri', grade: 4, name: '三角形', kind: 'calc', difficulties: ['medium', 'hard', 'challenge'], term: 2, gen: genTriangle },
  { id: 'g4-quad', grade: 4, name: '平行四边形与梯形', kind: 'concept', difficulties: ['easy', 'medium'], term: 2, gen: genQuad },
  { id: 'g4-decimal', grade: 4, name: '小数的意义与加减', kind: 'calc', difficulties: ['easy', 'medium', 'hard'], term: 2, gen: genDecimal },
  { id: 'g4-word', grade: 4, name: '应用题·鸡兔同笼', kind: 'word', difficulties: ['hard', 'challenge'], term: 2, gen: genWord },
]
