// 一年级 · 人教版：数一数、20以内加减法、数的组成、认识图形、钟表、找规律、人民币、简单应用
import type { Difficulty, Rng, TopicDef } from '../types'
import { SHAPE_CN } from '../figures'
import { calcHints, choicesOf, ITEM_POOL, makeQ, solveHints } from './helpers'

const M = { id: 'g1', grade: 1 as const }

// ---------- 数一数 · 比一比 ----------
function genCount(d: Difficulty, rng: Rng) {
  const item = rng.pick(ITEM_POOL)
  if (d === 'easy') {
    const count = rng.int(5, 10)
    return makeQ({ ...M, name: '数一数·比一比', kind: 'calc' }, d, {
      prompt: `数一数，一共有多少个${item.name}？`,
      figure: { kind: 'counting', emoji: item.e, groups: [count] },
      answer: count,
      unit: '个',
      concept: '一一对应数数',
      hints: [
        '伸出小手指，指着图上的物品，点一个数一个：1、2、3……',
        '从左往右按顺序数，数到最后一个时数到几，答案就是几。',
        '也可以两个两个地数：2、4、6……最后剩单的就再加 1。',
      ],
    })
  }
  const b = rng.int(3, 8)
  const a = b + rng.int(1, 4)
  return makeQ({ ...M, name: '数一数·比一比', kind: 'calc' }, d, {
    prompt: `上面一行比下面一行多几个${item.name}？`,
    figure: { kind: 'counting', emoji: item.e, groups: [a, b] },
    answer: a - b,
    unit: '个',
    concept: '一一对应比多少',
    hints: [
      '比多少时，把两行一上下一一对齐，就像排队一样。',
      `先分别数出两行各有多少个，记在草稿纸上。`,
      '上下对齐后，多出来的部分（没有配对的那几个）就是答案。',
      `用减法验证：多的一行减去少的一行。两行分别是几个，你来数一数。`,
    ],
  })
}

// ---------- 20 以内加减法 ----------
function genAddSub(d: Difficulty, rng: Rng) {
  if (d === 'easy') {
    const item = rng.pick(ITEM_POOL)
    if (rng.bool()) {
      const a = rng.int(2, 6)
      const b = rng.int(1, Math.min(4, 10 - a))
      return makeQ({ ...M, name: '20以内加减法', kind: 'calc' }, d, {
        prompt: `左边有 ${a} 个${item.name}，右边有 ${b} 个，一共有多少个？`,
        figure: { kind: 'counting', emoji: item.e, groups: [a, b] },
        answer: a + b,
        unit: '个',
        concept: '把两部分合起来用加法',
        hints: [
          '问"一共"，就是把左右两部分合起来，用加法。',
          `可以接着数：从 ${a} 开始，再往后数 ${b} 个。`,
          `数到最后数到几，答案就是几。试着列式：${a} + ${b} = ？`,
        ],
      })
    }
    const a = rng.int(6, 10)
    const b = rng.int(2, 4)
    return makeQ({ ...M, name: '20以内加减法', kind: 'calc' }, d, {
      prompt: `原来有 ${a} 个${item.name}，拿走了 ${b} 个，还剩多少个？`,
      figure: { kind: 'counting', emoji: item.e, groups: [a - b, b] },
      answer: a - b,
      unit: '个',
      concept: '从总数里去掉一部分用减法',
      hints: [
        '"拿走了"就是从总数里去掉一部分，用减法。',
        `图上第二行就是被拿走的 ${b} 个，剩下的就是第一行。数一数第一行有几个？`,
        `用算式检查：${a} - ${b} = ？`,
      ],
    })
  }
  if (d === 'medium') {
    if (rng.bool()) {
      // 进位加：凑十法
      const a = rng.int(5, 9)
      const b = rng.int(11 - a, 9)
      const c = 10 - a
      return makeQ({ ...M, name: '20以内加减法', kind: 'calc' }, d, {
        prompt: `${a} + ${b} = ？`,
        answer: a + b,
        concept: '凑十法（进位加）',
        hints: [
          '个位相加满十了，用"凑十法"最方便。',
          `把 ${b} 拆成 ${c} 和 ${b - c}：${c} 正好能和 ${a} 凑成 10。`,
          `第一步：${a} + ${c} = 10。`,
          `第二步：10 再加剩下的 ${b - c}，等于多少？你来算！`,
        ],
      })
    }
    // 退位减：破十法
    const a = rng.int(13, 18)
    const b = rng.int(a - 9, 9)
    return makeQ({ ...M, name: '20以内加减法', kind: 'calc' }, d, {
      prompt: `${a} - ${b} = ？`,
      answer: a - b,
      concept: '破十法（退位减）',
      hints: [
        '个位不够减，用"破十法"。',
        `把 ${a} 拆成 10 和 ${a - 10}。`,
        `先用 10 去减：10 - ${b} 你会算吗？`,
        `再把结果加上 ${a} 里的 ${a - 10}，最后等于多少？`,
      ],
    })
  }
  if (d === 'hard') {
    if (rng.bool()) {
      const a = rng.int(3, 9)
      const ans = rng.int(2, Math.min(9, 15 - a))
      return makeQ({ ...M, name: '20以内加减法', kind: 'calc' }, d, {
        prompt: `${a} + □ = ${a + ans}，□ 里应该填几？`,
        answer: ans,
        concept: '求加法里的未知数',
        hints: [
          '□ 是一个"躲起来的加数"：已知总数和另一个加数，求它。',
          '想：一个加数 = 总数 - 另一个加数，所以用减法算。',
          `列出算式：${a + ans} - ${a} = ？`,
          `也可以倒着想：${a} 加上几，就变成 ${a + ans}？从 ${a} 接着数。`,
        ],
      })
    }
    const a = rng.int(2, 6)
    const b = rng.int(1, 5)
    const c = rng.int(1, Math.min(5, 15 - a - b))
    return makeQ({ ...M, name: '20以内加减法', kind: 'calc' }, d, {
      prompt: `${a} + ${b} + ${c} = ？`,
      answer: a + b + c,
      concept: '连加',
      hints: [
        '连加要一步一步算：先算前两个数，再算第三个。',
        `第一步：${a} + ${b} 等于几？先算它。`,
        '第一步的得数记在心里（或写在旁边），再加上第三个数。',
        `最后一步：□ + ${c} = ？由你来完成！`,
      ],
    })
  }
  // challenge：不等式最小值 / 凑十巧算
  if (rng.bool()) {
    const a = rng.int(5, 9)
    const gap = rng.int(2, 4)
    const sum = a + gap
    const ans = gap + 1
    return makeQ({ ...M, name: '20以内加减法', kind: 'calc' }, d, {
      prompt: `${a} + □ > ${sum}，□ 里最小填几？`,
      answer: ans,
      concept: '不等式与最小值',
      hints: [
        `"大于"说明和要比 ${sum} 大，但只大一点点也算对，我们找"最小"的那个。`,
        `先想一个关键问题：${a} 加几正好等于 ${sum}？`,
        `如果 □ 填那个数，和就"等于" ${sum}，不是"大于"，所以还要再大 1。`,
        `比那个数大 1 的数是几？填进去验算一下。`,
      ],
    })
  }
  // 凑十巧算：三个数中两个能凑成十
  const a = rng.int(2, 8)
  const c = 10 - a
  const b = rng.int(2, 9)
  return makeQ({ ...M, name: '20以内加减法', kind: 'calc' }, d, {
    prompt: `巧算：${a} + ${b} + ${c} = ？（先找能凑成十的好朋友）`,
    answer: 10 + b,
    concept: '凑十巧算',
    hints: [
      '先别急着从左往右算，看看有没有两个数是"凑十好朋友"。',
      `${a} 和 ${c} 正好凑成 10，因为 ${a} + ${c} = 10。`,
      '先算这两个数的和，把它们圈起来记作 10。',
      `再用 10 + ${b}，最后等于多少？`,
    ],
  })
}

// ---------- 数的组成 ----------
function genCompose(d: Difficulty, rng: Rng) {
  if (d === 'easy') {
    const ones = rng.int(1, 9)
    return makeQ({ ...M, name: '数的组成', kind: 'calc' }, d, {
      prompt: '1 个十和几个一合起来是多少？（看小棒图）',
      figure: { kind: 'rods', tens: 1, ones },
      answer: 10 + ones,
      concept: '位值：几个十和几个一',
      hints: [
        '一捆小棒就是 1 个十，也就是 10 根。',
        `旁边的 ${ones} 根散的，就是 ${ones} 个一。`,
        `合起来就是 10 加 ${ones}，等于多少？`,
      ],
    })
  }
  if (d === 'medium') {
    const tens = rng.int(2, 5)
    const ones = rng.int(1, 9)
    return makeQ({ ...M, name: '数的组成', kind: 'calc' }, d, {
      prompt: `${tens} 个十和 ${ones} 个一合起来是多少？`,
      figure: { kind: 'rods', tens, ones },
      answer: tens * 10 + ones,
      concept: '位值：几个十和几个一',
      hints: [
        '十位上的数字表示几个十，个位上的数字表示几个一。',
        `${tens} 个十要在十位上写 ${tens}。`,
        `${ones} 个一要在个位上写 ${ones}。把两个数字合起来写。`,
      ],
    })
  }
  if (d === 'hard') {
    if (rng.bool()) {
      const n = rng.int(23, 98)
      return makeQ({ ...M, name: '数的组成', kind: 'calc' }, d, {
        prompt: `${n} 的十位上是几？`,
        answer: Math.floor(n / 10),
        concept: '认识数位',
        hints: [
          '从右边起，第一位是个位，第二位是十位。',
          `把 ${n} 写出来，看看左边的数字是几。`,
          '左边的数字所在的数位就是十位，它就是答案。',
        ],
      })
    }
    return makeQ({ ...M, name: '数的组成', kind: 'calc' }, d, {
      prompt: '最小的两位数是几？',
      answer: 10,
      concept: '最小的两位数',
      hints: [
        '两位数要用两个数字表示，十位上不能是 0。',
        '十位上最小是 1，个位上最小是 0。',
        '把这两个数字合起来写，是几？',
      ],
    })
  }
  // challenge：组最大两位数
  const digits = rng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3)
  const sorted = [...digits].sort((a, b) => b - a)
  return makeQ({ ...M, name: '数的组成', kind: 'calc' }, d, {
    prompt: `用数字卡片 ${digits.join('、')} 组成一个最大的两位数，它是几？`,
    answer: sorted[0] * 10 + sorted[1],
    concept: '比较数的大小',
    hints: [
      '比大小先看十位：十位越大，这个两位数就越大。',
      `想让十位最大，就把三张卡片中最大的数字 ${sorted[0]} 放在十位。`,
      `剩下的数字里挑最大的 ${sorted[1]} 放在个位。这个数是几？`,
    ],
  })
}

// ---------- 认识图形 ----------
const SOLID_ITEMS: Record<string, { items: string[]; feature: string }> = {
  球: { items: ['足球', '乒乓球', '皮球'], feature: '圆滚滚的，没有平平的面，可以到处滚' },
  正方体: { items: ['魔方', '骰子', '正方体积木'], feature: '6 个面完全一样，都是正方形' },
  长方体: { items: ['数学书', '牙膏盒', '砖块'], feature: '6 个面都是长方形（也可能有 2 个面是正方形）' },
  圆柱: { items: ['易拉罐', '蜡烛', '没削过的铅笔'], feature: '上下两个平平的圆面，侧面是弯的，能滚动' },
}
function genShapes(d: Difficulty, rng: Rng) {
  if (d === 'easy') {
    const shapes = Object.keys(SOLID_ITEMS)
    const target = rng.pick(shapes)
    const correct = rng.pick(SOLID_ITEMS[target].items)
    const wrongs = rng.shuffle(shapes.filter((s) => s !== target)).map((s) => rng.pick(SOLID_ITEMS[s].items))
    const { choices, answer } = choicesOf(rng, correct, wrongs)
    return makeQ({ ...M, name: '认识图形', kind: 'concept' }, d, {
      prompt: `下面的物品中，哪个的形状是${target}？`,
      choices,
      answer,
      concept: `认识${target}`,
      hints: [
        `${target}的特点：${SOLID_ITEMS[target].feature}。`,
        '逐个选项想一想：它有平平的面吗？面是什么形状？能不能滚动？',
        '排除法：先去掉明显不像的，剩下的再仔细比特点。',
      ],
    })
  }
  const bank: [string, number, string][] = [
    ['正方体有几个完全相同的面？', 6, '正方体上下面、前后面、左右面，一共 3 组，每组 2 个面'],
    ['长方体有几个面？', 6, '长方体也有上下面、前后面、左右面，一共 3 组'],
    ['圆柱有几个平平的面？', 2, '圆柱能滚动的是弯弯的侧面，平平的面只有上、下两个圆'],
  ]
  const [prompt, ans, hint] = rng.pick(bank)
  return makeQ({ ...M, name: '认识图形', kind: 'concept' }, d, {
    prompt,
    answer: ans,
    unit: '个',
    concept: '立体图形的面',
    hints: [
      '找一个真实的物体摸一摸：平平的地方叫"面"。',
      hint + '。',
      '一组一组地数一数，别漏掉也别重复。',
    ],
  })
}

// ---------- 认识钟表 ----------
function genClock(d: Difficulty, rng: Rng) {
  if (d === 'easy') {
    const h = rng.int(7, 11)
    return makeQ({ ...M, name: '认识钟表', kind: 'concept' }, d, {
      prompt: '钟面上是几时？',
      figure: { kind: 'clock', h, m: 0 },
      answer: h,
      unit: '时',
      concept: '认识整时',
      hints: [
        '又细又长的是分针，又短又粗的是时针。',
        '分针指着 12，时针指着几，就是几时。',
        '看看那根短针正对着数字几？',
      ],
    })
  }
  if (d === 'medium') {
    const h = rng.int(1, 9)
    return makeQ({ ...M, name: '认识钟表', kind: 'concept' }, d, {
      prompt: '钟面上表示的是几时半？',
      figure: { kind: 'clock', h, m: 30 },
      answer: h,
      unit: '时',
      concept: '认识半时',
      hints: [
        '分针指着 6，表示"半时"（过了 30 分钟）。',
        '时针走过几，就是几时半。',
        '看时针刚刚走过了数字几？（时针在两个数字中间，读走过的那个）',
      ],
    })
  }
  const h = rng.int(1, 10)
  return makeQ({ ...M, name: '认识钟表', kind: 'concept' }, d, {
    prompt: `现在是 ${h} 时整，再过 1 小时是几时？`,
    figure: { kind: 'clock', h, m: 0 },
    answer: h + 1,
    unit: '时',
    concept: '经过时间',
    hints: [
      '过 1 小时，就是时针从现在的数字走到下一个数字。',
      `时针现在指着 ${h}，下一个数字是几？`,
      '分针转一整圈回到 12，时针正好走一大格。',
    ],
  })
}

// ---------- 找规律 ----------
const PAT_SHAPES = ['circle', 'square', 'triangle', 'star', 'heart', 'hex']
function genPattern(d: Difficulty, rng: Rng) {
  if (d === 'medium') {
    const type = rng.pick(['abab', 'aabb', 'abc'] as const)
    let shapes: string[] = []
    if (type === 'abab') {
      const [a, b] = rng.shuffle(PAT_SHAPES).slice(0, 2)
      shapes = [a, b, a, b, a]
    } else if (type === 'aabb') {
      const [a, b] = rng.shuffle(PAT_SHAPES).slice(0, 2)
      shapes = [a, a, b, b, a]
    } else {
      const [a, b, c] = rng.shuffle(PAT_SHAPES).slice(0, 3)
      shapes = [a, b, c, a, b]
    }
    const next = type === 'abab' ? shapes[1] : type === 'aabb' ? shapes[4] : shapes[2]
    const wrongs = rng.shuffle(PAT_SHAPES.filter((s) => s !== next)).slice(0, 3).map((s) => SHAPE_CN[s])
    const { choices, answer } = choicesOf(rng, SHAPE_CN[next], wrongs)
    return makeQ({ ...M, name: '找规律', kind: 'concept' }, d, {
      prompt: '按规律排列，问号处应该是什么图形？',
      figure: { kind: 'shapeRow', shapes, questionAt: shapes.length },
      choices,
      answer,
      concept: '图形排列规律',
      hints: [
        '先找"一组"：看看哪几个图形像小队一样不停地重复出现。',
        '圈出重复的那一小段，数一数几个图形编成一队。',
        '问号排在这一队的第几个位置？对照前面同样位置的图形填。',
      ],
    })
  }
  if (d === 'hard') {
    const start = rng.int(1, 9)
    const step = rng.pick([2, 3, 5])
    const seq = [0, 1, 2, 3, 4].map((i) => start + i * step)
    const ans = seq[4] + step
    return makeQ({ ...M, name: '找规律', kind: 'calc' }, d, {
      prompt: `找规律填数：${seq.slice(0, 4).join('，')}，${seq[4]}，${'（ ？ ）'}，下一个数是几？`,
      answer: ans,
      concept: '等差数列规律',
      hints: [
        '观察这一串数：是越来越大，还是越来越小？',
        `算一算相邻两个数相差几：${seq[1]} - ${seq[0]} = ？其他相邻的也差几吗？`,
        `规律找到了：每次加 ${step}。最后一个数是 ${seq[4]}，加 ${step} 就是答案。`,
      ],
    })
  }
  // challenge：递减或翻倍
  if (rng.bool()) {
    const start = rng.pick([20, 25, 30])
    const step = rng.pick([2, 3])
    const seq = [0, 1, 2, 3].map((i) => start - i * step)
    const ans = seq[3] - step
    return makeQ({ ...M, name: '找规律', kind: 'calc' }, d, {
      prompt: `找规律填数：${seq.join('，')}，（ ？ ）下一个数是几？`,
      answer: ans,
      concept: '递减数列规律',
      hints: [
        '这串数越来越小，说明每次在"减少"。',
        `算一算相邻两个数的差：${seq[0]} - ${seq[1]} = ？后面的差一样吗？`,
        `规律是每次减 ${step}。最后一个数再减 ${step} 就是答案。`,
      ],
    })
  }
  const seq = [1, 2, 4, 8]
  return makeQ({ ...M, name: '找规律', kind: 'calc' }, d, {
    prompt: `找规律填数：${seq.join('，')}，（ ？ ）下一个数是几？`,
    answer: 16,
    concept: '翻倍规律',
    hints: [
      '先试试相邻两数相减：2-1=1，4-2=2，8-4=4……差不相等，不是加法规律。',
      '换一种眼光：每个数和前一个数之间是几倍关系？',
      '1×2=2，2×2=4，4×2=8……每次都乘 2。',
      '8 再乘 2 是多少？',
    ],
  })
}

// ---------- 认识人民币 ----------
function genMoney(d: Difficulty, rng: Rng) {
  if (d === 'medium') {
    const a = rng.pick([1, 5, 10])
    const n = rng.int(2, 3)
    const b = rng.pick([1, 2, 5].filter((x) => x !== a))
    const total = a * n + b
    return makeQ({ ...M, name: '认识人民币', kind: 'calc' }, d, {
      prompt: '图中的钱一共是多少元？',
      figure: { kind: 'money', items: [{ value: a, unit: '元', count: n }, { value: b, unit: '元' }] },
      answer: total,
      unit: '元',
      concept: '人民币面值与加法',
      hints: [
        '先看每张纸币的面值（上面的数字），再数各有几张。',
        `第一组：${a} 元 × ${n} 张；第二组：${b} 元 × 1 张。`,
        '把两组的钱加起来，一共几元？',
      ],
    })
  }
  if (d === 'hard') {
    const pairs: [number, number][] = [
      [10, 5],
      [10, 2],
      [20, 10],
      [50, 10],
      [100, 20],
    ]
    const p = rng.pick(pairs)
    const ans = p[0] / p[1]
    return makeQ({ ...M, name: '认识人民币', kind: 'calc' }, d, {
      prompt: `1 张 ${p[0]} 元，可以换几张 ${p[1]} 元？`,
      answer: ans,
      unit: '张',
      concept: '等值换钱',
      hints: [
        '换钱前后，总钱数不能变。',
        `想一想：几个 ${p[1]} 相加，正好等于 ${p[0]}？`,
        `列式：${p[0]} ÷ ${p[1]} = ？`,
      ],
    })
  }
  // challenge：元角换算 / 购物找零
  if (rng.bool()) {
    const j = rng.int(1, 9)
    return makeQ({ ...M, name: '认识人民币', kind: 'calc' }, d, {
      prompt: `1 元 ${j} 角 = 多少角？`,
      answer: 10 + j,
      unit: '角',
      concept: '元角换算',
      hints: [
        '1 元和 1 角是"邻居"关系：1 元 = 10 角。',
        `先把 1 元换成 10 角，再加上旁边的 ${j} 角。`,
        `10 角 + ${j} 角 = ？`,
      ],
    })
  }
  // 购物找零：两件商品，付 10 元
  const p1 = rng.int(2, 5)
  const p2 = rng.int(1, 10 - p1 - 1)
  return makeQ({ ...M, name: '认识人民币', kind: 'word' }, d, {
    prompt: `小明买了一支 ${p1} 元的铅笔和一本 ${p2} 元的笔记本，付给阿姨 10 元，应找回多少元？`,
    answer: 10 - p1 - p2,
    unit: '元',
    concept: '购物找零（两步计算）',
    hints: solveHints({
      concept: '先算一共花去多少元，再算找回多少元',
      knowns: [`铅笔 ${p1} 元`, `笔记本 ${p2} 元`, `付出 10 元`],
      ask: '找回多少元',
      method: '买东西花掉的钱要先加起来，再用 10 元减去花掉的。',
      setup: `第一步：${p1} + ${p2} = 一共花的钱。第二步：10 − 这个得数 = 找回的钱。`,
      first: `两件一共 ${p1 + p2} 元，10 元里去掉它`,
    }),
  })
}

// ---------- 简单应用 ----------
function genWord(d: Difficulty, rng: Rng) {
  if (d === 'medium') {
    const a = rng.int(9, 16)
    const b = rng.int(2, 7)
    return makeQ({ ...M, name: '解决问题', kind: 'word' }, d, {
      prompt: `树上原来有 ${a} 只小鸟，飞走了 ${b} 只，树上还剩几只？`,
      figure: { kind: 'barModel', bars: [{ label: '原有', value: a }, { label: '飞走', value: b, color: '#94A3B8' }, { label: '还剩', q: true }] },
      answer: a - b,
      unit: '只',
      concept: '减法：求剩余',
      hints: solveHints({
        concept: '从总数里去掉一部分，求还剩多少',
        knowns: [`原来有 ${a} 只`, `飞走了 ${b} 只`],
        ask: '还剩几只',
        method: '去掉一部分用减法。看图：原来的长条里，去掉"飞走"的那段，剩下的就是答案。',
        setup: `列出算式：${a} - ${b} = ？`,
      }),
    })
  }
  if (d === 'hard') {
    const a = rng.int(10, 15)
    const b = rng.int(2, 5)
    const c = rng.int(2, 5)
    return makeQ({ ...M, name: '解决问题', kind: 'word' }, d, {
      prompt: `妈妈买了 ${a} 个苹果，吃掉 ${b} 个，爸爸又买回来 ${c} 个，现在家里有几个苹果？`,
      answer: a - b + c,
      unit: '个',
      concept: '加减混合两步计算',
      hints: solveHints({
        concept: '事情分两步发生，就分两步算',
        knowns: [`买了 ${a} 个`, `吃掉 ${b} 个`, `又买回 ${c} 个`],
        ask: '现在有几个',
        method: '按事情发生的顺序算：先减去吃掉的，再加上买回的。',
        setup: `第一步：${a} - ${b} = ？第二步：得数 + ${c}。`,
        first: `也可以列成综合算式：${a} - ${b} + ${c}，从左往右算`,
      }),
    })
  }
  // challenge：一样多问题 / 逆推"原来"
  if (rng.bool()) {
    const a = rng.int(12, 20)
    const b = rng.int(2, 4)
    return makeQ({ ...M, name: '解决问题', kind: 'word' }, d, {
      prompt: `哥哥有 ${a} 颗糖，给妹妹 ${b} 颗后，两人的糖就一样多。妹妹原来有几颗糖？`,
      answer: a - 2 * b,
      unit: '颗',
      concept: '移多补少',
      hints: solveHints({
        concept: '移多补少：给出一些后两人同样多',
        knowns: [`哥哥原来有 ${a} 颗`, `给了妹妹 ${b} 颗后两人一样多`],
        ask: '妹妹原来有几颗',
        method: '关键句是"一样多"：先算给完之后哥哥有多少颗，那时妹妹也是这么多。',
        setup: `第一步：${a} − ${b} = ？这就是两人现在各自的颗数`,
        first: `妹妹现在这么多里，有 ${b} 颗是哥哥给的，去掉才是原来的`,
      }),
    })
  }
  // 逆推：已知变化后的结果，倒推原来
  const start = rng.int(10, 15)
  const flew = rng.int(3, 6)
  const came = rng.int(1, 3)
  return makeQ({ ...M, name: '解决问题', kind: 'word' }, d, {
    prompt: `树枝上停着一群小鸟，先飞走了 ${flew} 只，又飞来了 ${came} 只，现在还有 ${start} 只。树上原来有多少只小鸟？`,
    answer: start + flew - came,
    unit: '只',
    concept: '倒推法（逆向思考）',
    hints: solveHints({
      concept: '知道现在、倒推原来：把过程倒着走一遍',
      knowns: [`飞走 ${flew} 只`, `又飞来 ${came} 只`, `现在有 ${start} 只`],
      ask: '原来有多少只',
      method: '倒着想：飞来的要"退回去"，飞走的要"请回来"。',
      setup: `第一步：${start} − ${came}（去掉后飞来的）。第二步：得数 + ${flew}（补回飞走的）。`,
      first: `倒推第一步得 ${start - came}，再把飞走的 ${flew} 只加回来`,
    }),
  })
}

// ---------- 思维乐园（排队 · 锯木头 · 爬楼 · 数方块） ----------
function genThink(d: Difficulty, rng: Rng) {
  if (d === 'hard') {
    const type = rng.pick(['queue', 'queue', 'saw', 'stairs'] as const)
    if (type === 'queue') {
      const front = rng.int(3, 7)
      const back = rng.int(2, 6)
      return makeQ({ ...M, name: '思维乐园', kind: 'word' }, d, {
        prompt: `小朋友们排队做操，小红前面有 ${front} 人，后面有 ${back} 人。这一队一共有多少人？（别忘了我哦）`,
        answer: front + back + 1,
        unit: '人',
        concept: '排队问题：别忘了自己',
        hints: solveHints({
          concept: '排队的总人数 = 前面的 + 后面的 + 自己',
          knowns: [`小红前面 ${front} 人`, `小红后面 ${back} 人`],
          ask: '一共有多少人',
          method: '画一排圆圈代表队伍，把小红标出来：她前面一段、她自己一个、她后面一段。',
          setup: `第一步：${front} + ${back} = 前后的人数。第二步：再 + 1（小红自己）。`,
          first: `前后一共 ${front + back} 人，加上小红自己`,
        }),
      })
    }
    if (type === 'saw') {
      const seg = rng.int(4, 8)
      return makeQ({ ...M, name: '思维乐园', kind: 'word' }, d, {
        prompt: `把一根木头锯成 ${seg} 段，需要锯几次？`,
        answer: seg - 1,
        unit: '次',
        concept: '锯木头：段数比次数多 1',
        hints: [
          '拿笔画一画：一条线段上每锯一次，就多出一个"切口"。',
          `锯 1 次变 2 段，锯 2 次变 3 段……每锯一次，段数只多 1。`,
          `所以要变成 ${seg} 段，锯的次数比段数少 1。是几次？`,
        ],
      })
    }
    const floor = rng.int(3, 9)
    return makeQ({ ...M, name: '思维乐园', kind: 'word' }, d, {
      prompt: `乐乐家住 ${floor} 楼，他从 1 楼走楼梯回家，要走几层楼梯？`,
      answer: floor - 1,
      unit: '层',
      concept: '爬楼问题：楼层数差 1',
      hints: [
        '从 1 楼到 2 楼要走 1 层楼梯，从 1 楼到 3 楼要走 2 层……',
        '楼梯的"层数"比楼的"层数"少 1，因为 1 楼不用爬楼梯。',
        `住 ${floor} 楼，就是 ${floor} − 1 层楼梯。算一算！`,
      ],
    })
  }
  // challenge：排队变式 / 数方块
  if (rng.bool()) {
    const x = rng.int(4, 9)
    const y = rng.int(3, 8)
    return makeQ({ ...M, name: '思维乐园', kind: 'word' }, d, {
      prompt: `排队时从前面数，小明是第 ${x} 个；从后面数，他是第 ${y} 个。这一队一共有多少人？`,
      answer: x + y - 1,
      unit: '人',
      concept: '排队问题：自己被数了两次',
      hints: solveHints({
        concept: '从前数和从后数，小明都被算到了',
        knowns: [`从前面数是第 ${x} 个`, `从后面数是第 ${y} 个`],
        ask: '一共有多少人',
        method: '两段人数相加时，小明被数了 2 次，所以要去掉多余的 1 次。',
        setup: `第一步：${x} + ${y} = ？第二步：再 − 1（多算的小明自己）。`,
        first: `两段加起来是 ${x + y}，小明被数了两次`,
      }),
    })
  }
  const layouts: [number[], number][] = [
    [[4, 3, 2, 1], 10],
    [[3, 2, 1], 6],
    [[5, 4, 3, 2, 1], 15],
    [[4, 2, 1], 7],
    [[3, 3, 1], 7],
    [[4, 4, 2, 1], 11],
    [[5, 3, 2], 10],
    [[6, 4, 2, 1], 13],
  ]
  const [levels, total] = rng.pick(layouts)
  return makeQ({ ...M, name: '思维乐园', kind: 'word' }, d, {
    prompt: '数一数，下图中小正方体一共有多少个？（藏着的小正方体也要算哦）',
    figure: { kind: 'cubeStack', levels },
    answer: total,
    unit: '个',
    concept: '数方块：分层数再相加',
    hints: [
      '看不见的小方块藏在下面，被上面的压住了，别漏掉。',
      `分层数：从下往上每层分别是 ${levels.join(' 个、')} 个。`,
      `把每层的个数加起来：${levels.join(' + ')} = ？`,
    ],
  })
}

export const G1_TOPICS: TopicDef[] = [
  { id: 'g1-count', grade: 1, name: '数一数·比一比', kind: 'calc', difficulties: ['easy', 'medium'], term: 1, gen: genCount },
  { id: 'g1-addsub', grade: 1, name: '20以内加减法', kind: 'calc', difficulties: ['easy', 'medium', 'hard', 'challenge'], term: 1, gen: genAddSub },
  { id: 'g1-compose', grade: 1, name: '数的组成', kind: 'calc', difficulties: ['easy', 'medium', 'hard', 'challenge'], term: 1, gen: genCompose },
  { id: 'g1-shapes', grade: 1, name: '认识图形', kind: 'concept', difficulties: ['easy', 'medium'], term: 1, gen: genShapes },
  { id: 'g1-clock', grade: 1, name: '认识钟表', kind: 'concept', difficulties: ['easy', 'medium', 'hard'], term: 1, gen: genClock },
  { id: 'g1-money', grade: 1, name: '认识人民币', kind: 'calc', difficulties: ['medium', 'hard', 'challenge'], term: 2, gen: genMoney },
  { id: 'g1-pattern', grade: 1, name: '找规律', kind: 'concept', difficulties: ['medium', 'hard', 'challenge'], term: 2, gen: genPattern },
  { id: 'g1-think', grade: 1, name: '思维乐园（排队·锯木头·数方块）', kind: 'word', difficulties: ['hard', 'challenge'], term: 2, gen: genThink },
  { id: 'g1-word', grade: 1, name: '解决问题', kind: 'word', difficulties: ['medium', 'hard', 'challenge'], term: 1, gen: genWord },
]
