// 三年级 · 人教版：万以内加减、多位数×一位数、除数一位数、两位数×两位数、倍的认识、
// 单位换算、周长、分数初步、时间年月日、面积、应用题综合
import type { Difficulty, Rng, TopicDef } from '../types'
import { choicesOf, febDays, makeQ, solveHints } from './helpers'

const M = { id: 'g3', grade: 3 as const }

function calcHintsFrame(concept: string, method: string, setup: string, first?: string): string[] {
  return solveHints({ concept, method, setup, first })
}

// ---------- 万以内加减法 ----------
function genAddSub(d: Difficulty, rng: Rng) {
  if (d === 'easy') {
    const a = rng.pick([340, 450, 560, 640, 720])
    const b = rng.pick([120, 200, 240, 310])
    if (rng.bool())
      return makeQ({ ...M, name: '万以内加减法', kind: 'calc' }, d, {
        prompt: `${a} + ${b} = ？`,
        answer: a + b,
        concept: '整百整十数加法',
        hints: [
          '先把整十数看成多少个十。',
          `十位：${a / 10} + ${b / 10} = ？个十`,
          '算出的几十个十，写成数就是答案。',
        ],
      })
    return makeQ({ ...M, name: '万以内加减法', kind: 'calc' }, d, {
      prompt: `${a} - ${b} = ？`,
      answer: a - b,
      concept: '整百整十数减法',
      hints: [
        '整十数相减，先算十位上的数字。',
        `十位：${a / 10} - ${b / 10} = ？个十`,
        '把结果写成完整的数。',
      ],
    })
  }
  if (d === 'medium') {
    if (rng.bool()) {
      const a = rng.int(238, 689)
      const b = rng.int(145, 289)
      return makeQ({ ...M, name: '万以内加减法', kind: 'calc' }, d, {
        prompt: `${a} + ${b} = ？`,
        answer: a + b,
        concept: '三位数进位加法',
        hints: [
          '列竖式：相同数位对齐，从个位加起。',
          `个位：${a % 10} + ${b % 10} 满 10 了吗？满 10 向十位进 1。`,
          '十位、百位依次相加，别漏掉进位的 1。算出最后得数。',
        ],
      })
    }
    const a = rng.int(512, 986)
    const b = rng.int(187, 389)
    return makeQ({ ...M, name: '万以内加减法', kind: 'calc' }, d, {
      prompt: `${a} - ${b} = ？`,
      answer: a - b,
      concept: '三位数退位减法',
      hints: [
        '列竖式：从个位减起，不够减就向前一位借 1 当 10。',
        `个位：${a % 10} - ${b % 10} 够减吗？不够就先算 10 + ${a % 10} - ${b % 10}。`,
        '哪一位被借了 1，那一位就要少 1 再减。一步步算到底。',
      ],
    })
  }
  if (d === 'hard') {
    // 估算
    const a = rng.pick([298, 402, 509, 693, 312])
    const b = rng.pick([197, 296, 411, 507])
    const ra = Math.round(a / 100) * 100
    const rb = Math.round(b / 100) * 100
    return makeQ({ ...M, name: '万以内加减法', kind: 'calc' }, d, {
      prompt: `估算：${a} + ${b} 大约是多少？（把两个数看成整百数再算）`,
      answer: ra + rb,
      concept: '加减法估算',
      hints: [
        '估算就是把数看成最接近的整百数（或几百几十数）。',
        `${a} 最接近的整百数是 ${ra}，${b} 最接近的是 ${rb}。`,
        `再用整百数相加：${ra} + ${rb} = ？`,
      ],
    })
  }
  // challenge：被减数=减数+差
  const half = rng.int(180, 360)
  const sub = rng.int(120, 260)
  return makeQ({ ...M, name: '万以内加减法', kind: 'word' }, d, {
    prompt: `在一道减法算式里，被减数、减数与差的和是 ${half * 2}，减数是 ${sub}，差是几？`,
    answer: half - sub,
    concept: '减法各部分的关系',
    hints: solveHints({
      concept: '被减数 = 减数 + 差',
      knowns: [`被减数 + 减数 + 差 = ${half * 2}`, `减数 = ${sub}`],
      ask: '差是几',
      method: '被减数 = 减数 + 差，所以三个数的和 = 被减数 × 2。先求被减数，再求差。',
      setup: `第一步：被减数 = ${half * 2} ÷ 2 = ？`,
      first: `第二步：差 = 被减数 - ${sub}`,
    }),
  })
}

// ---------- 多位数乘一位数 ----------
function genMult1(d: Difficulty, rng: Rng) {
  if (d === 'easy') {
    const a = rng.pick([200, 300, 400, 500])
    const b = rng.int(2, 5)
    return makeQ({ ...M, name: '多位数乘一位数', kind: 'calc' }, d, {
      prompt: `${a} × ${b} = ？`,
      answer: a * b,
      concept: '整百数乘一位数',
      hints: [
        '先不看末尾的 0，算 2 × 看得见数字。',
        `${a / 100} × ${b} = ？`,
        `再在得数末尾添上 2 个 0，就是 ${a / 100} × ${b} 的结果添两个零。`,
      ],
    })
  }
  if (d === 'medium') {
    if (rng.bool()) {
      const a = rng.int(213, 498)
      const b = rng.int(2, 4)
      return makeQ({ ...M, name: '多位数乘一位数', kind: 'calc' }, d, {
        prompt: `${a} × ${b} = ？`,
        answer: a * b,
        concept: '三位数乘一位数',
        hints: [
          '从个位起，用一位数依次去乘每一位。',
          `个位：${b} × ${a % 10}，满几十就向前一位进几。`,
          '十位、百位接着乘，加上进位的数。算出完整结果。',
        ],
      })
    }
    const a = rng.pick([120, 340, 260, 450])
    const b = rng.int(3, 6)
    return makeQ({ ...M, name: '多位数乘一位数', kind: 'calc' }, d, {
      prompt: `${a} × ${b} = ？`,
      answer: a * b,
      concept: '末尾有 0 的乘法',
      hints: [
        '末尾有 0：先乘 0 前面的部分。',
        `${a / 10} × ${b} = ？`,
        '算完在得数末尾添 1 个 0。',
      ],
    })
  }
  if (d === 'hard') {
    if (rng.bool()) {
      const a = rng.pick([105, 204, 306, 408, 103])
      const b = rng.int(4, 7)
      return makeQ({ ...M, name: '多位数乘一位数', kind: 'calc' }, d, {
        prompt: `${a} × ${b} = ？`,
        answer: a * b,
        concept: '中间有 0 的乘法',
        hints: [
          '十位上是 0，乘得的积是 0，但如果有进位要加上。',
          `个位：${b} × ${a % 10} = ？向十位进几？`,
          '十位：0 × 一位数 + 进来的数，结果写在十位。继续算百位。',
        ],
      })
    }
    const b = rng.pick([40, 50, 60, 80])
    const ans = rng.int(6, 9)
    return makeQ({ ...M, name: '多位数乘一位数', kind: 'calc' }, d, {
      prompt: `□ × ${b} = ${ans * b}，□ 里填几？`,
      answer: ans,
      concept: '乘法逆运算',
      hints: [
        '□ 是一个因数：积 ÷ 已知因数 = 另一个因数。',
        `列式：${ans * b} ÷ ${b} = ？`,
        `先口算 ${ans * b / 10} ÷ ${b / 10}，再检查末尾的 0。`,
      ],
    })
  }
  // challenge
  const q = rng.int(8, 9)
  const b = rng.int(6, 9)
  const r = rng.int(1, b - 1)
  const dividend = b * q + r
  return makeQ({ ...M, name: '多位数乘一位数', kind: 'word' }, d, {
    prompt: `一道有余数的除法：□ ÷ ${b} = ${q} …… ${r}，□ 里是几？`,
    answer: dividend,
    concept: '被除数 = 商 × 除数 + 余数',
    hints: solveHints({
      concept: '有余数除法各部分的关系',
      knowns: [`除数 ${b}`, `商 ${q}`, `余数 ${r}`],
      ask: '被除数是几',
      method: '被除数 = 商 × 除数 + 余数（不能忘了加余数）。',
      setup: `列式：${q} × ${b} + ${r} = ？`,
    }),
  })
}

// ---------- 除数是一位数 ----------
function genDiv1(d: Difficulty, rng: Rng) {
  if (d === 'easy') {
    const q = rng.int(12, 24)
    const b = rng.pick([2, 4])
    return makeQ({ ...M, name: '除数是一位数', kind: 'calc' }, d, {
      prompt: `${q * b} ÷ ${b} = ？`,
      answer: q,
      concept: '口算除法',
      hints: [
        '口算除法可以想乘法：除数乘几等于被除数？',
        `想：${b} × 多少 = ${q * b}？`,
        `也可以拆数：${Math.floor(q / 10) * 10 * b} ÷ ${b} = ${Math.floor(q / 10) * 10}，${(q % 10) * b} ÷ ${b} = ${q % 10}，再把商合起来。`,
      ],
    })
  }
  if (d === 'medium') {
    const q = rng.int(102, 199)
    const b = rng.int(3, 6)
    return makeQ({ ...M, name: '除数是一位数', kind: 'calc' }, d, {
      prompt: `${q * b} ÷ ${b} = ？`,
      answer: q,
      concept: '三位数除以一位数',
      hints: [
        '从被除数的最高位除起，商写在对应数位上。',
        `先用百位（或前两位）除以 ${b}，看够不够除。`,
        `一位一位除下去，最后用乘法验算：商 × ${b} = ${q * b}。`,
      ],
    })
  }
  if (d === 'hard') {
    if (rng.bool()) {
      const b = rng.pick([6, 7, 8])
      const q = rng.pick([105, 120, 140, 150])
      return makeQ({ ...M, name: '除数是一位数', kind: 'calc' }, d, {
        prompt: `${q * b} ÷ ${b} = ？`,
        answer: q,
        concept: '商末尾有 0 的除法',
        hints: [
          '除到某一位不够商 1，就商 0 占位。',
          `前两位除完之后，剩个位 ${q % 10 === 0 ? '0' : '……'}；不够除时直接商 0。`,
          `验证：商 × ${b} 应该等于 ${q * b}。商的末尾是不是有 0？`,
        ],
      })
    }
    const q = rng.pick([102, 105, 201, 306])
    const b = rng.pick([2, 3, 6])
    return makeQ({ ...M, name: '除数是一位数', kind: 'calc' }, d, {
      prompt: `${q * b} ÷ ${b} = ？`,
      answer: q,
      concept: '商中间有 0 的除法',
      hints: [
        '哪一位上的数除以除数不够商 1，那一位就商 0。',
        `算到十位时：十位是 0（或不够除），商 0。`,
        `最后用乘法验算：商 × ${b} = ${q * b}。`,
      ],
    })
  }
  // challenge：除法竖式迷
  const b = rng.int(4, 8)
  const q = rng.int(110, 240)
  const r = rng.int(1, b - 1)
  return makeQ({ ...M, name: '除数是一位数', kind: 'word' }, d, {
    prompt: `商店运来 ${b * q + r} 个粽子，每 ${b} 个装一袋，装完之后还剩 ${r} 个没装，一共装了多少袋？`,
    answer: q,
    unit: '袋',
    concept: '有余数除法的应用',
    hints: solveHints({
      concept: '总数 = 每袋个数 × 袋数 + 剩下的',
      knowns: [`共 ${b * q + r} 个`, `每袋 ${b} 个`, `剩 ${r} 个没装`],
      ask: '装了多少袋',
      method: '先从总数里去掉剩下的，剩下的都是整袋装好的。',
      setup: `第一步：${b * q + r} - ${r} = ？第二步：再 ÷ ${b}`,
    }),
  })
}

// ---------- 两位数乘两位数 ----------
function genMult2(d: Difficulty, rng: Rng) {
  if (d === 'medium') {
    const a = rng.int(21, 34)
    const b = rng.int(21, 44)
    return makeQ({ ...M, name: '两位数乘两位数', kind: 'calc' }, d, {
      prompt: `${a} × ${b} = ？`,
      answer: a * b,
      concept: '两位数乘两位数',
      hints: [
        '把第二个因数拆成整十数和一位数，分别乘再相加。',
        `第一步：${a} × ${Math.floor(b / 10) * 10} = ？第二步：${a} × ${b % 10} = ？`,
        '把两个积加起来，就是最终答案。',
      ],
    })
  }
  if (d === 'hard') {
    if (rng.bool()) {
      const a = rng.pick([35, 45, 55, 65])
      const b = rng.pick([40, 50, 60])
      return makeQ({ ...M, name: '两位数乘两位数', kind: 'calc' }, d, {
        prompt: `${a} × ${b} = ？`,
        answer: a * b,
        concept: '末尾有 0 的乘法',
        hints: [
          '0 前面的数先乘。',
          `${a} × ${b / 10} = ？`,
          `得数末尾添 1 个 0（因为 ${b} 有一个 0）。`,
        ],
      })
    }
    const a = rng.pick([42, 38, 51, 63])
    const b = rng.pick([29, 31, 42])
    return makeQ({ ...M, name: '两位数乘两位数', kind: 'calc' }, d, {
      prompt: `估算：${a} × ${b} 大约是多少？（看成整十数）`,
      answer: Math.round(a / 10) * 10 * Math.round(b / 10) * 10,
      concept: '乘法估算',
      hints: [
        '把两个因数分别看成最接近的整十数。',
        `${a} ≈ ${Math.round(a / 10) * 10}，${b} ≈ ${Math.round(b / 10) * 10}。`,
        `估算：${Math.round(a / 10) * 10} × ${Math.round(b / 10) * 10} = ？`,
      ],
    })
  }
  // challenge（在 g3-word 里已有应用，此处出概念）
  return makeQ({ ...M, name: '两位数乘两位数', kind: 'concept' }, d, {
    prompt: '两位数乘两位数，积最少是几位数？',
    answer: 3,
    unit: '位数',
    concept: '积的位数',
    hints: [
      '找最小的例子试一试：最小的两位数是 10。',
      '10 × 10 = 100，是几位数？',
      '积不可能比 100 还小（两位数都 ≥ 10），所以最少是几位？',
    ],
  })
}

// ---------- 倍的认识 ----------
function genMultiple(d: Difficulty, rng: Rng) {
  if (d === 'easy') {
    const small = rng.int(3, 8)
    const k = rng.int(2, 5)
    return makeQ({ ...M, name: '倍的认识', kind: 'word' }, d, {
      prompt: `黄花有 ${small} 朵，红花是黄花的 ${k} 倍，红花有多少朵？`,
      figure: { kind: 'barModel', bars: [{ label: '黄花', value: small, color: '#F59E0B' }, { label: '红花', value: small * k, color: '#EC4899', q: false }] },
      answer: small * k,
      unit: '朵',
      concept: '求一个数的几倍',
      hints: solveHints({
        concept: '几倍就是几个几',
        knowns: [`黄花 ${small} 朵`, `红花是黄花的 ${k} 倍`],
        ask: '红花有多少朵',
        method: `"${k} 倍"就是把 ${small} 朵看作一份，红花有这样的 ${k} 份。看条形图更清楚。`,
        setup: `列式：${small} × ${k} = ？`,
      }),
    })
  }
  if (d === 'medium') {
    const small = rng.int(2, 9)
    const k = rng.int(3, 8)
    return makeQ({ ...M, name: '倍的认识', kind: 'word' }, d, {
      prompt: `蓝球有 ${small * k} 个，是黄球的 ${k} 倍，黄球有多少个？`,
      figure: { kind: 'barModel', bars: [{ label: '黄球', q: true, color: '#F59E0B' }, { label: '蓝球', value: small * k, color: '#0EA5E9' }] },
      answer: small,
      unit: '个',
      concept: '已知几倍，求一倍量',
      hints: solveHints({
        concept: '已知总量和倍数，求一倍的量',
        knowns: [`蓝球 ${small * k} 个`, `蓝球是黄球的 ${k} 倍`],
        ask: '黄球有多少个',
        method: `黄球是"1 倍量"，${small * k} 里有 ${k} 个黄球那么多。`,
        setup: `列式：${small * k} ÷ ${k} = ？`,
      }),
    })
  }
  if (d === 'hard') {
    // 差倍
    const small = rng.int(4, 12)
    const k = rng.pick([3, 4, 5])
    return makeQ({ ...M, name: '倍的认识', kind: 'word' }, d, {
      prompt: `苹果的个数是梨的 ${k} 倍，苹果比梨多 ${small * (k - 1)} 个，梨有多少个？`,
      figure: { kind: 'barModel', bars: [{ label: '梨', q: true, color: '#F59E0B' }, { label: '苹果', value: small * k, color: '#EC4899' }] },
      answer: small,
      unit: '个',
      concept: '差倍问题',
      hints: solveHints({
        concept: '差倍问题：差 = (倍数 - 1) × 一倍量',
        knowns: [`苹果是梨的 ${k} 倍`, `苹果比梨多 ${small * (k - 1)} 个`],
        ask: '梨有多少个',
        method: `把梨看作 1 份，苹果就是 ${k} 份，苹果比梨多 ${k - 1} 份。多的 ${small * (k - 1)} 个正好是 ${k - 1} 份。`,
        setup: `第一步：求 1 份：${small * (k - 1)} ÷ ${k - 1} = ？`,
      }),
    })
  }
  // challenge：和倍
  const small = rng.int(6, 24)
  const k = rng.pick([3, 4, 5])
  return makeQ({ ...M, name: '倍的认识', kind: 'word' }, d, {
    prompt: `哥哥和弟弟一共有 ${small * (k + 1)} 张邮票，哥哥的张数是弟弟的 ${k} 倍，弟弟有多少张？`,
    figure: { kind: 'barModel', bars: [{ label: '弟弟', q: true, color: '#0EA5E9' }, { label: '哥哥', value: small * k, color: '#8B5CF6' }] },
    answer: small,
    unit: '张',
    concept: '和倍问题',
    hints: solveHints({
      concept: '和倍问题：和 = (倍数 + 1) × 一倍量',
      knowns: [`两人共 ${small * (k + 1)} 张`, `哥哥是弟弟的 ${k} 倍`],
      ask: '弟弟有多少张',
      method: `把弟弟看作 1 份，哥哥 ${k} 份，总数一共 ${k + 1} 份。`,
      setup: `第一步：${small * (k + 1)} ÷ ${k + 1} = ？（1 份就是弟弟的）`,
    }),
  })
}

// ---------- 毫米分米千米吨 ----------
function genUnit(d: Difficulty, rng: Rng) {
  const bank: [string, number, string][] = [
    ['5 米 = 多少分米？', 50, '1 米 = 10 分米，5 米就是 5 个 10'],
    ['3 吨 = 多少千克？', 3000, '1 吨 = 1000 千克，3 吨就是 3 个 1000'],
    ['4000 米 = 多少千米？', 4, '1000 米 = 1 千米，4000 米里有 4 个 1000'],
    ['7 厘米 = 多少毫米？', 70, '1 厘米 = 10 毫米，7 厘米就是 7 个 10'],
    ['60 分米 = 多少米？', 6, '10 分米 = 1 米，60 分米里有 6 个 10'],
    ['2000 千克 = 多少吨？', 2, '1000 千克 = 1 吨，2000 千克正好 2 个 1000'],
  ]
  if (d === 'easy') {
    const [p, ans, h] = rng.pick(bank)
    return makeQ({ ...M, name: '单位换算', kind: 'concept' }, d, {
      prompt: p,
      answer: ans,
      concept: '长度/质量单位进率',
      hints: ['先想这两个单位之间的进率是多少。', h + '。', '用乘进率或除以进率算出得数。'],
    })
  }
  if (d === 'medium') {
    if (rng.bool()) {
      const km = rng.int(2, 9)
      const m = rng.pick([800, 500, 900, 300, 100])
      const a = km * 1000 + 0
      const cmVal = rng.pick([4800, 3900, 5200, 2900, 4500])
      const ans = cmVal > km * 1000 ? '<' : '>'
      return makeQ({ ...M, name: '单位换算', kind: 'concept' }, d, {
        prompt: `${cmVal} 米 〇 ${km} 千米（在〇里填 >、< 或 =）`,
        answer: ans,
        concept: '统一单位再比较',
        hints: [
          '单位不同先统一：把千米换成米。',
          `${km} 千米 = ${km}000 米。`,
          `再比较 ${cmVal} 和 ${km * 1000} 的大小。`,
        ],
      })
    }
    return makeQ({ ...M, name: '单位换算', kind: 'calc' }, d, {
      prompt: '1 吨 - 400 千克 = 多少千克？',
      answer: 600,
      unit: '千克',
      concept: '质量单位计算',
      hints: [
        '单位不同不能直接减，先统一成千克。',
        '1 吨 = 1000 千克。',
        `再算 1000 - 400 = ？`,
      ],
    })
  }
  // hard：填单位
  const items: [string, string][] = [
    ['一节课大约上 40（ ）', '分钟'],
    ['一枚硬币厚约 2（ ）', '毫米'],
    ['一头大象重约 4（ ）', '吨'],
    ['长江全长约 6300（ ）', '千米'],
    ['数学课本厚约 8（ ）', '毫米'],
    ['一袋大米重 25（ ）', '千克'],
  ]
  const [p, correct] = rng.pick(items)
  const wrongs = ['毫米', '厘米', '分米', '米', '千米', '克', '千克', '吨', '秒', '分钟', '小时'].filter((u) => u !== correct)
  const picked = rng.shuffle(wrongs).slice(0, 3)
  const { choices, answer } = choicesOf(rng, correct, picked)
  return makeQ({ ...M, name: '单位换算', kind: 'concept' }, d, {
    prompt: p,
    choices,
    answer,
    concept: '选择合适的单位',
    hints: [
      '先想这个东西有多大、多重：很小很薄用毫米，很重很大会用吨、千米。',
      '再和身边的东西比：1 枚硬币约 1 克、1 袋米 25 千克、操场跑道一圈 400 米。',
      '代入读一读，哪个单位读起来最合理？',
    ],
  })
}

// ---------- 周长 ----------
function genPerimeter(d: Difficulty, rng: Rng) {
  if (d === 'medium') {
    const w = rng.int(3, 9)
    const h = rng.int(2, w - 1)
    return makeQ({ ...M, name: '周长', kind: 'calc' }, d, {
      prompt: `长方形的长是 ${w} 厘米，宽是 ${h} 厘米，周长是多少厘米？`,
      figure: { kind: 'polygon', ptype: 'rect', labels: { w: `${w}厘米`, h: `${h}厘米` } },
      answer: (w + h) * 2,
      unit: '厘米',
      concept: '长方形周长 = (长 + 宽) × 2',
      hints: calcHintsFrame(
        `周长就是绕图形一周的长度`,
        `长方形对边相等，一组长 + 一宽，再 × 2。`,
        `列式：(${w} + ${h}) × 2 = ？`,
        `先算括号：${w} + ${h} = ？`,
      ),
    })
  }
  if (d === 'hard') {
    if (rng.bool()) {
      const c = rng.pick([24, 32, 36, 40, 48])
      const len = c / 2 - rng.int(2, Math.floor(c / 2) - 3)
      return makeQ({ ...M, name: '周长', kind: 'calc' }, d, {
        prompt: `长方形的周长是 ${c} 厘米，长是 ${len} 厘米，宽是多少厘米？`,
        answer: c / 2 - len,
        unit: '厘米',
        concept: '周长公式的逆用',
        hints: calcHintsFrame(
          '已知周长求宽，是公式的倒过来用',
          `周长 ÷ 2 = 长 + 宽。先求"长 + 宽"是多少。`,
          `第一步：${c} ÷ 2 = ？第二步：再减去长 ${len}。`,
        ),
      })
    }
    const a = rng.int(3, 12)
    return makeQ({ ...M, name: '周长', kind: 'calc' }, d, {
      prompt: `正方形的边长是 ${a} 厘米，周长是多少厘米？`,
      figure: { kind: 'polygon', ptype: 'square', labels: { bottom: `${a}厘米` } },
      answer: a * 4,
      unit: '厘米',
      concept: '正方形周长 = 边长 × 4',
      hints: calcHintsFrame(
        '正方形四条边一样长',
        '周长 = 边长 × 4。',
        `列式：${a} × 4 = ？`,
      ),
    })
  }
  // challenge：靠墙围篱笆
  const len = rng.int(10, 20)
  const wid = rng.int(4, 9)
  return makeQ({ ...M, name: '周长', kind: 'word' }, d, {
    prompt: `一块长方形菜地，长 ${len} 米，宽 ${wid} 米。一面靠墙（墙足够长），其余三面围篱笆，至少需要多少米篱笆？`,
    figure: { kind: 'polygon', ptype: 'rect', labels: { w: `${len}米`, h: `${wid}米` } },
    answer: len + wid * 2,
    unit: '米',
    concept: '靠墙围篱笆（求三边和最小）',
    hints: solveHints({
      concept: '靠墙的那条边不用围篱笆',
      knowns: [`长 ${len} 米`, `宽 ${wid} 米`, '一面靠墙'],
      ask: '至少要多少米篱笆',
      method: '"至少"就要让靠墙的边尽可能长——让长边靠墙，只围两条宽 + 一条长。',
      setup: `列式：${wid} + ${wid} + ${len} = ？`,
    }),
  })
}

// ---------- 分数的初步认识 ----------
function genFraction(d: Difficulty, rng: Rng) {
  if (d === 'medium') {
    const parts = rng.pick([4, 6, 8])
    const filled = rng.int(1, parts - 1)
    return makeQ({ ...M, name: '分数的初步认识', kind: 'concept' }, d, {
      prompt: '看图，涂色部分占整个图形的几分之几？（分数输入：先填分子，再填分母）',
      figure: { kind: 'fracBar', parts, filled },
      answer: { n: filled, d: parts },
      concept: '几分之几',
      hints: [
        '分数线下面的数表示"平均分成几份"。',
        `数一数：整条被平均分成了 ${parts} 份。`,
        `分数线上面的数表示"涂了几份"：数数涂色的有 ${filled} 份。分子 ${filled}、分母 ${parts}。`,
      ],
    })
  }
  if (d === 'hard') {
    const d0 = rng.pick([5, 7, 9])
    const a = rng.int(1, d0 - 2)
    const b = rng.int(1, d0 - a - 1)
    return makeQ({ ...M, name: '分数的初步认识', kind: 'calc' }, d, {
      prompt: `${a}/${d0} + ${b}/${d0} = ？（同分母相加，填分数）`,
      answer: { n: a + b, d: d0 },
      concept: '同分母分数加法',
      hints: [
        '分母相同的分数相加：分母不变，只把分子相加。',
        `像切披萨：每块都是 1/${d0}，先拿 ${a} 块再拿 ${b} 块。`,
        `分子：${a} + ${b} = ？分母还是 ${d0}。`,
      ],
    })
  }
  // challenge：比较大小
  if (rng.bool()) {
    const n = rng.int(2, 5)
    const d1 = rng.pick([3, 4, 5])
    const d2pool = [6, 8, 10, 12, 7, 9].filter((x) => x > d1)
    const d2 = rng.pick(d2pool)
    const ans = n / d1 > n / d2 ? '>' : '<'
    return makeQ({ ...M, name: '分数的初步认识', kind: 'concept' }, d, {
      prompt: `比较大小：${n}/${d1} 〇 ${n}/${d2}（分子相同）`,
      figure: { kind: 'fracBar', parts: d1, filled: n },
      answer: ans,
      concept: '分子相同的分数比较',
      hints: [
        '分子相同，说明取的份数一样多。',
        '分母越大，说明平均分得越细，每一份反而越小。',
        `想象两张饼：都拿 ${n} 份，${d1} 份的和 ${d2} 份的，哪边每份更大？`,
      ],
    })
  }
  const d1 = rng.pick([3, 4, 5, 6])
  const a = rng.int(1, d1 - 1)
  const b = rng.int(1, d1 - 1)
  const ans = a > b ? '>' : a < b ? '<' : '='
  return makeQ({ ...M, name: '分数的初步认识', kind: 'concept' }, d, {
    prompt: `比较大小：${a}/${d1} 〇 ${b}/${d1}（分母相同）`,
    figure: { kind: 'fracPie', parts: d1, filled: a },
    answer: ans,
    concept: '分母相同的分数比较',
    hints: [
      '分母相同，说明每一份一样大。',
      '那就看谁取的份数多。',
      `${a} 份和 ${b} 份，谁多？`,
    ],
  })
}

// ---------- 时分秒 · 年月日 ----------
function genTime(d: Difficulty, rng: Rng) {
  if (d === 'medium') {
    const h = rng.int(7, 10)
    const m = rng.pick([0, 5, 10, 15, 20, 40, 45])
    const add = rng.pick([15, 20, 25, 30])
    const total = h * 60 + m + add
    const nh = Math.floor(total / 60)
    const nm = total % 60
    const correct = `${nh}时${nm}分`
    const wrongs = [`${h}时${m + add}分`, `${nh}时${nm === 0 ? 5 : nm - 5}分`, `${nh + 1}时${nm}分`]
    const { choices, answer } = choicesOf(rng, correct, wrongs)
    return makeQ({ ...M, name: '时间计算', kind: 'concept' }, d, {
      prompt: `钟面时间是 ${h} 时${m === 0 ? '整' : m + '分'}，再过 ${add} 分钟是几时几分？`,
      figure: { kind: 'clock', h, m },
      choices,
      answer,
      concept: '经过时间',
      hints: [
        '分钟相加，满 60 要换成 1 小时。',
        `先算：${m} + ${add} = ？分`,
        '满 60 就减 60、时加 1；不满就时不变。选出正确时刻。',
      ],
    })
  }
  if (d === 'hard') {
    if (rng.bool()) {
      const h1 = rng.int(8, 10)
      const m1 = rng.pick([10, 20, 30, 40])
      const durH = rng.int(1, 2)
      const h2 = h1 + durH
      const m2 = rng.pick([5, 10, 30, 50])
      const start = h1 * 60 + m1
      const end = h2 * 60 + m2
      return makeQ({ ...M, name: '时间计算', kind: 'word' }, d, {
        prompt: `一场电影 ${h1}:${String(m1).padStart(2, '0')} 开始，${h2}:${String(m2).padStart(2, '0')} 结束，放映了多少分钟？`,
        answer: end - start,
        unit: '分',
        concept: '求经过时间',
        hints: solveHints({
          concept: '经过时间 = 结束时刻 - 开始时刻',
          knowns: [`${h1} 时 ${m1} 分开始`, `${h2} 时 ${m2} 分结束`],
          ask: '放映了多少分钟',
          method: '分段算：先算到下一个整时，再算整时到结束。',
          setup: `第一步：${h1}:${String(m1).padStart(2, '0')} 到 ${h1 + 1}:00 是多少分？第二步：${h1 + 1}:00 到 ${h2}:${String(m2).padStart(2, '0')} 又是多少分？`,
        }),
      })
    }
    const year = rng.pick([2024, 2025, 2026, 2028, 2030, 2100])
    return makeQ({ ...M, name: '时间计算', kind: 'concept' }, d, {
      prompt: `${year} 年的 2 月有多少天？`,
      answer: febDays(year),
      unit: '天',
      concept: '平年闰年',
      hints: [
        '2 月的天数取决于这年是平年还是闰年。',
        `判断：${year} ÷ 4 有余数吗？（整百年要 ÷ 400）`,
        `如果 ÷ 4 没有余数（整百年 ÷ 400 没有余数），就是闰年，2 月 29 天；否则 28 天。算算 ${year} ÷ 4 = ？`,
      ],
    })
  }
  // challenge：赶车问题
  const now = rng.int(7, 9)
  const nm = rng.pick([10, 20, 25])
  const leave = rng.pick([15, 25, 30])
  const depM = nm + leave
  const need = rng.pick([20, 25, 30])
  return makeQ({ ...M, name: '时间计算', kind: 'word' }, d, {
    prompt: `火车 ${now + 1} 时 ${depM} 分出发，从家到车站要 ${need} 分钟。爸爸现在出门（${now} 时 ${nm} 分），他会提前多少分钟到达车站？`,
    answer: (now + 1) * 60 + depM - (now * 60 + nm + need),
    unit: '分',
    concept: '时间综合计算',
    hints: solveHints({
      concept: '提前量 = 发车时刻 - 出门时刻 - 路上时间',
      knowns: [`火车 ${now + 1} 时 ${depM} 分出发`, `现在 ${now} 时 ${nm} 分出门`, `路上要 ${need} 分钟`],
      ask: '提前多少分钟到站',
      method: '先算从出门到发车一共有多少分钟，再减去路上用的。',
      setup: `第一步：从 ${now} 时 ${nm} 分到 ${now + 1} 时 ${depM} 分，共多少分？第二步：减去 ${need}。`,
    }),
  })
}

// ---------- 面积 ----------
function genArea(d: Difficulty, rng: Rng) {
  if (d === 'medium') {
    const w = rng.int(3, 8)
    const h = rng.int(2, 6)
    return makeQ({ ...M, name: '面积', kind: 'concept' }, d, {
      prompt: `数一数方格图，长方形的面积是多少平方厘米？（每小格 1 平方厘米）`,
      figure: { kind: 'gridRect', rows: h, cols: w },
      answer: w * h,
      unit: '平方厘米',
      concept: '面积就是铺满图形的小方格数',
      hints: [
        '面积就是里面能铺多少个 1 平方厘米的小格子。',
        `每行有 ${w} 格，一共有 ${h} 行。`,
        `列式：${w} × ${h} = ？`,
      ],
    })
  }
  if (d === 'hard') {
    if (rng.bool()) {
      const w = rng.int(4, 12)
      const h = rng.int(2, 9)
      return makeQ({ ...M, name: '面积', kind: 'calc' }, d, {
        prompt: `长方形长 ${w} 厘米，宽 ${h} 厘米，面积是多少平方厘米？`,
        figure: { kind: 'polygon', ptype: 'rect', labels: { w: `${w}厘米`, h: `${h}厘米` } },
        answer: w * h,
        unit: '平方厘米',
        concept: '长方形面积 = 长 × 宽',
        hints: calcHintsFrame('长方形面积公式', '长 × 宽 = 面积（和数格子结果一样）。', `列式：${w} × ${h} = ？`),
      })
    }
    const a = rng.int(3, 15)
    return makeQ({ ...M, name: '面积', kind: 'calc' }, d, {
      prompt: `正方形边长 ${a} 分米，面积是多少平方分米？`,
      figure: { kind: 'polygon', ptype: 'square', labels: { bottom: `${a}分米` } },
      answer: a * a,
      unit: '平方分米',
      concept: '正方形面积 = 边长 × 边长',
      hints: calcHintsFrame('正方形面积公式', '边长 × 边长 = 面积。', `列式：${a} × ${a} = ？`),
    })
  }
  // challenge：周长求面积
  const per = rng.pick([12, 16, 20, 24, 36])
  const side = per / 4
  return makeQ({ ...M, name: '面积', kind: 'word' }, d, {
    prompt: `用一根 ${per} 米长的铁丝，正好围成一个正方形，这个正方形的面积是多少平方米？`,
    figure: { kind: 'polygon', ptype: 'square', labels: {} },
    answer: side * side,
    unit: '平方米',
    concept: '先由周长求边长，再求面积',
    hints: solveHints({
      concept: '正方形周长 = 边长 × 4',
      knowns: [`铁丝长（周长）${per} 米`, '围成正方形'],
      ask: '面积是多少平方米',
      method: '铁丝的长就是周长。先用周长 ÷ 4 求边长，再用边长 × 边长求面积。',
      setup: `第一步：${per} ÷ 4 = ？第二步：边长 × 边长。`,
    }),
  })
}

// ---------- 应用题综合（归一归总、和差） ----------
function genWord(d: Difficulty, rng: Rng) {
  if (d === 'hard') {
    // 归一
    const per = rng.int(6, 12)
    const t1 = rng.int(3, 5)
    const t2 = rng.int(6, 9)
    return makeQ({ ...M, name: '应用题综合', kind: 'word' }, d, {
      prompt: `小明 ${t1} 分钟做了 ${per * t1} 道口算题，照这样的速度，${t2} 分钟能做多少道题？`,
      answer: per * t2,
      unit: '道',
      concept: '归一问题：先求一份量',
      hints: solveHints({
        concept: '归一问题：先算"每分钟做几道"',
        knowns: [`${t1} 分钟做 ${per * t1} 道`, '速度不变'],
        ask: `${t2} 分钟能做多少道`,
        method: '先求 1 分钟做几道（一份数），再乘分钟数。',
        setup: `第一步：${per * t1} ÷ ${t1} = ？第二步：得数 × ${t2}。`,
      }),
    })
  }
  // challenge：和差
  const small = rng.int(20, 40)
  const diff = rng.pick([8, 12, 16, 20, 24])
  return makeQ({ ...M, name: '应用题综合', kind: 'word' }, d, {
    prompt: `两筐苹果一共 ${small * 2 + diff} 个，第一筐比第二筐多 ${diff} 个，第二筐有多少个苹果？`,
    figure: { kind: 'barModel', bars: [{ label: '第二筐', q: true, color: '#0EA5E9' }, { label: '第一筐', value: small + diff, color: '#EC4899' }] },
    answer: small,
    unit: '个',
    concept: '和差问题',
    hints: solveHints({
      concept: '和差问题：(和 + 差) ÷ 2 = 大数，(和 - 差) ÷ 2 = 小数',
      knowns: [`两筐共 ${small * 2 + diff} 个`, `第一筐比第二筐多 ${diff} 个`],
      ask: '第二筐（较少的）有多少个',
      method: '假设把第一筐多出的部分拿走，两筐就一样多了，总数也变少了。这时除以 2 就是小筐。',
      setup: `第一步：${small * 2 + diff} - ${diff} = ？第二步：÷ 2 就是第二筐。`,
    }),
  })
}

export const G3_TOPICS: TopicDef[] = [
  { id: 'g3-addsub', grade: 3, name: '万以内加减法', kind: 'calc', difficulties: ['easy', 'medium', 'hard', 'challenge'], term: 1, gen: genAddSub },
  { id: 'g3-mult1', grade: 3, name: '多位数乘一位数', kind: 'calc', difficulties: ['easy', 'medium', 'hard', 'challenge'], term: 1, gen: genMult1 },
  { id: 'g3-div1', grade: 3, name: '除数是一位数', kind: 'calc', difficulties: ['easy', 'medium', 'hard', 'challenge'], term: 2, gen: genDiv1 },
  { id: 'g3-mul2', grade: 3, name: '两位数乘两位数', kind: 'calc', difficulties: ['medium', 'hard', 'challenge'], term: 2, gen: genMult2 },
  { id: 'g3-multiple', grade: 3, name: '倍的认识', kind: 'word', difficulties: ['easy', 'medium', 'hard', 'challenge'], term: 1, gen: genMultiple },
  { id: 'g3-unit', grade: 3, name: '毫米分米千米吨', kind: 'concept', difficulties: ['easy', 'medium', 'hard'], term: 1, gen: genUnit },
  { id: 'g3-perimeter', grade: 3, name: '周长', kind: 'word', difficulties: ['medium', 'hard', 'challenge'], term: 1, gen: genPerimeter },
  { id: 'g3-fraction', grade: 3, name: '分数的初步认识', kind: 'concept', difficulties: ['medium', 'hard', 'challenge'], term: 1, gen: genFraction },
  { id: 'g3-time', grade: 3, name: '时间·年月日', kind: 'word', difficulties: ['medium', 'hard', 'challenge'], term: 1, gen: genTime },
  { id: 'g3-area', grade: 3, name: '面积', kind: 'word', difficulties: ['medium', 'hard', 'challenge'], term: 2, gen: genArea },
  { id: 'g3-word', grade: 3, name: '应用题综合', kind: 'word', difficulties: ['hard', 'challenge'], term: 2, gen: genWord },
]
