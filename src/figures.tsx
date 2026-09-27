import type { FigureSpec } from './types'

const C = {
  primary: '#2563EB',
  secondary: '#F59E0B',
  accent: '#EC4899',
  green: '#22C55E',
  sky: '#0EA5E9',
  violet: '#8B5CF6',
  ink: '#1E293B',
  soft: '#EEF2FB',
  line: '#94A3B8',
  red: '#EF4444',
}
const PALETTE = [C.primary, C.secondary, C.accent, C.green, C.sky, C.violet]
const NUM_FONT = "'Baloo 2', 'PingFang SC', sans-serif"

function Svg({ w, h, children }: { w: number; h: number; children: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="fig-svg" role="img" preserveAspectRatio="xMidYMid meet">
      {children}
    </svg>
  )
}

/** 圆角标签芯片 */
function Chip({ x, y, text, color = C.primary }: { x: number; y: number; text: string; color?: string }) {
  const w = Math.max(26, text.length * 11 + 12)
  return (
    <g>
      <rect x={x - w / 2} y={y - 11} rx={8} width={w} height={22} fill="#fff" stroke={color} strokeWidth={1.5} />
      <text x={x} y={y + 5} textAnchor="middle" fontSize={13} fontWeight={700} fill={color} fontFamily={NUM_FONT}>
        {text}
      </text>
    </g>
  )
}

// ---------- 实物计数 ----------
function Counting({ emoji = '🍎', groups = [] }: FigureSpec) {
  const perRow = 10
  const rows: JSX.Element[] = []
  let key = 0
  groups.forEach((g, gi) => {
    if (gi > 0) rows.push(<rect key={`gap${gi}`} x={0} y={0} width={0} height={0} />)
    for (let i = 0; i < g; i++) {
      const idx = i % perRow
      const rowN = Math.floor(i / perRow)
      rows.push(
        <text key={key++} x={14 + idx * 36} y={34 + gi * 92 + rowN * 40} fontSize={30} textAnchor="middle">
          {emoji}
        </text>,
      )
    }
  })
  const maxCount = Math.max(...groups, 0)
  const height = groups.length * 92 + Math.floor((maxCount - 1) / perRow) * 40 + 10
  return <Svg w={14 + Math.min(maxCount, perRow) * 36} h={Math.max(height, 60)}>{rows}</Svg>
}

// ---------- 十格阵 ----------
function TenFrame({ filled = 0 }: FigureSpec) {
  const cells = []
  for (let i = 0; i < 10; i++) {
    const x = 16 + (i % 5) * 56
    const y = 26 + Math.floor(i / 5) * 56
    cells.push(
      <g key={i}>
        <rect x={x} y={y} width={48} height={48} rx={10} fill={i < filled ? '#FDE9C8' : '#F6F8FE'} stroke={C.secondary} strokeWidth={2} />
        {i < filled && <circle cx={x + 24} cy={y + 24} r={10} fill={C.secondary} />}
      </g>,
    )
  }
  return <Svg w={312} h={144}>{cells}</Svg>
}

// ---------- 数轴 ----------
function NumberLine({ min = 0, max = 10, marks, questionAt }: FigureSpec) {
  const w = 460
  const pad = 30
  const span = max - min || 1
  const x = (v: number) => pad + ((v - min) / span) * (w - pad * 2)
  const ticks = []
  for (let v = min; v <= max; v++) {
    const isBig = marks?.length ? marks.some((m) => m.at === v) : true
    ticks.push(
      <g key={v}>
        <line x1={x(v)} y1={52} x2={x(v)} y2={62} stroke={C.ink} strokeWidth={2} />
        <text x={x(v)} y={80} textAnchor="middle" fontSize={14} fontWeight={600} fill={C.ink} fontFamily={NUM_FONT}>
          {marks?.find((m) => m.at === v)?.label ?? v}
        </text>
        {isBig ? null : null}
      </g>,
    )
  }
  return (
    <Svg w={w} h={100}>
      <line x1={pad - 10} y1={57} x2={w - pad + 10} y2={57} stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
      <polygon points={`${w - pad + 16},57 ${w - pad + 4},51 ${w - pad + 4},63`} fill={C.ink} />
      {ticks}
      {questionAt !== undefined && (
        <g>
          <circle cx={x(questionAt)} cy={57} r={7} fill={C.red} />
          <text x={x(questionAt)} y={38} textAnchor="middle" fontSize={20} fontWeight={800} fill={C.red}>
            ?
          </text>
        </g>
      )}
    </Svg>
  )
}

// ---------- 点阵 ----------
function ArrayFig({ rows = 3, cols = 4, emoji }: FigureSpec) {
  const s = 46
  const dots = []
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const cx = 26 + c * s
      const cy = 26 + r * s
      dots.push(
        emoji ? (
          <text key={`${r}-${c}`} x={cx} y={cy + 10} fontSize={28} textAnchor="middle">
            {emoji}
          </text>
        ) : (
          <circle key={`${r}-${c}`} cx={cx} cy={cy} r={13} fill={C.primary} opacity={0.9} />
        ),
      )
    }
  return <Svg w={26 + cols * s} h={26 + rows * s}>{dots}</Svg>
}

// ---------- 钟面 ----------
function Clock({ h = 3, m = 0 }: FigureSpec) {
  const cx = 110
  const cy = 110
  const r = 96
  const ticks = []
  for (let i = 0; i < 60; i++) {
    const a = (i * 6 - 90) * (Math.PI / 180)
    const big = i % 5 === 0
    const r1 = r - (big ? 12 : 6)
    ticks.push(
      <line
        key={i}
        x1={cx + r1 * Math.cos(a)}
        y1={cy + r1 * Math.sin(a)}
        x2={cx + (r - 2) * Math.cos(a)}
        y2={cy + (r - 2) * Math.sin(a)}
        stroke={C.ink}
        strokeWidth={big ? 3 : 1.5}
        opacity={big ? 1 : 0.45}
      />,
    )
  }
  const nums = []
  for (let i = 1; i <= 12; i++) {
    const a = (i * 30 - 90) * (Math.PI / 180)
    nums.push(
      <text key={i} x={cx + (r - 26) * Math.cos(a)} y={cy + (r - 26) * Math.sin(a) + 6} textAnchor="middle" fontSize={18} fontWeight={700} fill={C.ink} fontFamily={NUM_FONT}>
        {i}
      </text>,
    )
  }
  const hAng = (((h % 12) + m / 60) * 30 - 90) * (Math.PI / 180)
  const mAng = (m * 6 - 90) * (Math.PI / 180)
  return (
    <Svg w={220} h={220}>
      <circle cx={cx} cy={cy} r={r} fill="#fff" stroke={C.primary} strokeWidth={6} />
      {ticks}
      {nums}
      <line x1={cx} y1={cy} x2={cx + 50 * Math.cos(hAng)} y2={cy + 50 * Math.sin(hAng)} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={cx + 74 * Math.cos(mAng)} y2={cy + 74 * Math.sin(mAng)} stroke={C.red} strokeWidth={4.5} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={7} fill={C.ink} />
    </Svg>
  )
}

// ---------- 人民币 ----------
const BILL_COLOR: Record<number, string> = { 1: '#7DD3A8', 5: '#93B4F0', 10: '#F3B8B8', 20: '#C6A9E8', 50: '#8FD3C7', 100: '#E8A66E' }
function Money({ items = [] }: FigureSpec) {
  const parts: JSX.Element[] = []
  let x = 10
  items.forEach((it, idx) => {
    const isCoin = (it.unit ?? '元') === '角'
    const count = it.count ?? 1
    const color = isCoin ? C.secondary : BILL_COLOR[it.value] ?? C.primary
    if (isCoin) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        parts.push(
          <g key={`${idx}-${i}`}>
            <circle cx={x + 20 + i * 4} cy={38 - i * 4} r={19} fill="#FDE9C8" stroke={C.secondary} strokeWidth={2.5} />
            <text x={x + 20 + i * 4} y={44 - i * 4} textAnchor="middle" fontSize={13} fontWeight={800} fill="#B45309" fontFamily={NUM_FONT}>
              {it.value}角
            </text>
          </g>,
        )
      }
      x += 50 + Math.min(count, 5) * 4
    } else {
      parts.push(
        <g key={idx}>
          <rect x={x} y={14} width={86} height={44} rx={8} fill={color} stroke="#fff" strokeWidth={3} opacity={0.95} />
          <text x={x + 43} y={43} textAnchor="middle" fontSize={19} fontWeight={800} fill="#fff" fontFamily={NUM_FONT}>
            {it.value}元
          </text>
          {count > 1 && (
            <text x={x + 43} y={74} textAnchor="middle" fontSize={14} fontWeight={700} fill={C.ink}>
              ×{count}张
            </text>
          )}
        </g>,
      )
      x += 100
    }
  })
  return <Svg w={Math.max(x + 10, 200)} h={90}>{parts}</Svg>
}

// ---------- 图形规律排列 ----------
const SHAPE_DRAWERS: Record<string, (x: number, y: number, s: number, color: string) => JSX.Element> = {
  circle: (x, y, s, c) => <circle cx={x} cy={y} r={s} fill={c} />,
  square: (x, y, s, c) => <rect x={x - s} y={y - s} width={s * 2} height={s * 2} rx={5} fill={c} />,
  triangle: (x, y, s, c) => <polygon points={`${x},${y - s} ${x + s},${y + s * 0.8} ${x - s},${y + s * 0.8}`} fill={c} />,
  star: (x, y, s, c) => {
    const pts: string[] = []
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? s : s * 0.45
      const a = (i * 36 - 90) * (Math.PI / 180)
      pts.push(`${x + r * Math.cos(a)},${y + r * Math.sin(a)}`)
    }
    return <polygon points={pts.join(' ')} fill={c} />
  },
  heart: (x, y, s, c) => (
    <path
      d={`M ${x} ${y + s * 0.85} C ${x - s * 1.4} ${y - s * 0.2}, ${x - s * 0.5} ${y - s * 1.1}, ${x} ${y - s * 0.35} C ${x + s * 0.5} ${y - s * 1.1}, ${x + s * 1.4} ${y - s * 0.2}, ${x} ${y + s * 0.85} Z`}
      fill={c}
    />
  ),
  hex: (x, y, s, c) => {
    const pts: string[] = []
    for (let i = 0; i < 6; i++) {
      const a = (i * 60 - 30) * (Math.PI / 180)
      pts.push(`${x + s * Math.cos(a)},${y + s * Math.sin(a)}`)
    }
    return <polygon points={pts.join(' ')} fill={c} />
  },
}
const SHAPE_CN: Record<string, string> = { circle: '圆形', square: '正方形', triangle: '三角形', star: '五角星', heart: '爱心', hex: '六边形' }
function ShapeRow({ shapes = [], questionAt }: FigureSpec) {
  const s = 26
  const gap = 78
  return (
    <Svg w={shapes.length * gap + 30} h={110}>
      {shapes.map((name, i) => {
        const x = 45 + i * gap
        const y = 48
        const color = PALETTE[i % PALETTE.length]
        return (
          <g key={i}>
            {i === questionAt ? (
              <>
                <rect x={x - s - 4} y={y - s - 8} width={(s + 4) * 2} height={(s + 8) * 2} rx={12} fill="#FEF3F7" stroke={C.accent} strokeWidth={2.5} strokeDasharray="7 5" />
                <text x={x} y={y + 14} textAnchor="middle" fontSize={34} fontWeight={800} fill={C.accent}>
                  ?
                </text>
              </>
            ) : (
              SHAPE_DRAWERS[name]?.(x, y, s, color)
            )}
          </g>
        )
      })}
      <text x={45} y={104} fontSize={13} fill={C.line}>
        {shapes.map((s2, i) => (i === questionAt ? '？' : SHAPE_CN[s2] ?? '')).filter(Boolean).join(' · ')}
      </text>
    </Svg>
  )
}

// ---------- 直尺 ----------
function Ruler({ cm = 8, from, to }: FigureSpec) {
  const px = 44
  const w = cm * px + 80
  const ticks = []
  for (let i = 0; i <= cm; i++) {
    ticks.push(
      <g key={i}>
        <line x1={40 + i * px} y1={30} x2={40 + i * px} y2={i % 1 === 0 ? 58 : 48} stroke={C.ink} strokeWidth={2} />
        <text x={40 + i * px} y={80} textAnchor="middle" fontSize={15} fontWeight={700} fill={C.ink} fontFamily={NUM_FONT}>
          {i}
        </text>
      </g>,
    )
    if (i < cm)
      for (let mm = 1; mm <= 9; mm++) {
        const x = 40 + i * px + (mm * px) / 10
        ticks.push(<line key={`${i}-${mm}`} x1={x} y1={30} x2={x} y2={mm === 5 ? 50 : 40} stroke={C.line} strokeWidth={1.4} />)
      }
  }
  const f = from ?? 0
  const t = to ?? cm
  return (
    <Svg w={w} h={110}>
      <rect x={30} y={26} width={cm * px + 20} height={38} rx={8} fill="#FBE8C8" stroke={C.secondary} strokeWidth={2} />
      {ticks}
      {to !== undefined && (
        <g>
          <line x1={40 + f * px} y1={92} x2={40 + t * px} y2={92} stroke={C.red} strokeWidth={5} strokeLinecap="round" />
          <circle cx={40 + f * px} cy={92} r={4} fill={C.red} />
          <circle cx={40 + t * px} cy={92} r={4} fill={C.red} />
        </g>
      )}
    </Svg>
  )
}

// ---------- 角 ----------
function AngleFig({ deg = 45, showDeg }: FigureSpec) {
  const a = (-deg * Math.PI) / 180
  const cx = 60
  const cy = 150
  const len = 150
  const arcR = 44
  const arcEnd = {
    x: cx + arcR * Math.cos(a),
    y: cy + arcR * Math.sin(a),
  }
  const large = deg > 180 ? 1 : 0
  return (
    <Svg w={250} h={190}>
      <circle cx={cx} cy={cy} r={5} fill={C.ink} />
      <line x1={cx} y1={cy} x2={cx + len} y2={cy} stroke={C.primary} strokeWidth={5} strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={cx + len * Math.cos(a)} y2={cy + len * Math.sin(a)} stroke={C.primary} strokeWidth={5} strokeLinecap="round" />
      {deg <= 180 && <path d={`M ${cx + arcR} ${cy} A ${arcR} ${arcR} 0 ${large} 0 ${arcEnd.x} ${arcEnd.y}`} fill="none" stroke={C.accent} strokeWidth={3} />}
      {showDeg && (
        <text x={cx + 66} y={cy - 12} fontSize={17} fontWeight={800} fill={C.accent} fontFamily={NUM_FONT}>
          {deg}°
        </text>
      )}
    </Svg>
  )
}

// ---------- 多边形 ----------
function PolygonFig({ ptype = 'rect', labels = {}, showHeight }: FigureSpec) {
  const stroke = C.primary
  const dashed = (x1: number, y1: number, x2: number, y2: number) => (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.accent} strokeWidth={2.5} strokeDasharray="7 5" />
      <path d={`M ${x1} ${y1} l 10 0 l 0 10`} fill="none" stroke={C.accent} strokeWidth={2} />
    </g>
  )
  if (ptype === 'triangle') {
    return (
      <Svg w={280} h={220}>
        <polygon points="60,180 240,180 150,55" fill="#EDF2FE" stroke={stroke} strokeWidth={3.5} />
        {labels.bottom && <Chip x={150} y={200} text={labels.bottom} />}
        {labels.left && <Chip x={95} y={110} text={labels.left} />}
        {labels.right && <Chip x={205} y={110} text={labels.right} />}
        {showHeight && dashed(150, 55, 150, 180)}
        {labels.height && <Chip x={150} y={120} text={`高${labels.height}`} color={C.accent} />}
      </Svg>
    )
  }
  if (ptype === 'parallelogram') {
    return (
      <Svg w={300} h={220}>
        <polygon points="50,180 230,180 280,60 100,60" fill="#EDF2FE" stroke={stroke} strokeWidth={3.5} />
        {labels.bottom && <Chip x={140} y={200} text={labels.bottom} />}
        {labels.top && <Chip x={190} y={44} text={labels.top} />}
        {labels.left && <Chip x={62} y={120} text={labels.left} />}
        {showHeight && dashed(100, 60, 100, 180)}
        {labels.height && <Chip x={85} y={135} text={`高${labels.height}`} color={C.accent} />}
      </Svg>
    )
  }
  if (ptype === 'trapezoid') {
    return (
      <Svg w={300} h={220}>
        <polygon points="40,180 260,180 200,60 100,60" fill="#EDF2FE" stroke={stroke} strokeWidth={3.5} />
        {labels.bottom && <Chip x={150} y={200} text={`下底${labels.bottom}`} />}
        {labels.top && <Chip x={150} y={44} text={`上底${labels.top}`} />}
        {labels.left && <Chip x={55} y={120} text={labels.left} />}
        {labels.right && <Chip x={240} y={120} text={labels.right} />}
        {showHeight && dashed(100, 60, 100, 180)}
        {labels.height && <Chip x={128} y={135} text={`高${labels.height}`} color={C.accent} />}
      </Svg>
    )
  }
  // rect / square
  const x = 60
  const y = 40
  const w = ptype === 'square' ? 140 : 180
  const h = ptype === 'square' ? 140 : 110
  return (
    <Svg w={320} h={220}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill="#EDF2FE" stroke={stroke} strokeWidth={3.5} />
      {labels.top && <Chip x={x + w / 2} y={y - 16} text={labels.top} />}
      {labels.bottom && <Chip x={x + w / 2} y={y + h + 24} text={labels.bottom} />}
      {labels.left && <Chip x={x - 32} y={y + h / 2} text={labels.left} />}
      {labels.right && <Chip x={x + w + 32} y={y + h / 2} text={labels.right} />}
      {labels.height && <Chip x={x - 32} y={y + h / 2} text={labels.height} color={C.accent} />}
      {labels.w && <Chip x={x + w / 2} y={y - 16} text={`长${labels.w}`} />}
      {labels.h && <Chip x={x + w + 34} y={y + h / 2} text={`宽${labels.h}`} />}
    </Svg>
  )
}

// ---------- 方格长方形 ----------
function GridRect({ rows = 3, cols = 5 }: FigureSpec) {
  const s = 34
  const x0 = 50
  const y0 = 26
  const lines = []
  for (let i = 0; i <= cols; i++)
    lines.push(<line key={`v${i}`} x1={x0 + i * s} y1={y0} x2={x0 + i * s} y2={y0 + rows * s} stroke={C.line} strokeWidth={i === 0 || i === cols ? 2.5 : 1.2} />)
  for (let j = 0; j <= rows; j++)
    lines.push(<line key={`h${j}`} x1={x0} y1={y0 + j * s} x2={x0 + cols * s} y2={y0 + j * s} stroke={C.line} strokeWidth={j === 0 || j === rows ? 2.5 : 1.2} />)
  return (
    <Svg w={x0 * 2 + cols * s} h={y0 + rows * s + 44}>
      <rect x={x0} y={y0} width={cols * s} height={rows * s} fill="#E9F8EF" />
      {lines}
      <Chip x={x0 + (cols * s) / 2} y={y0 + rows * s + 22} text={`${cols} 格`} color={C.green} />
      <Chip x={x0 - 30} y={y0 + (rows * s) / 2} text={`${rows} 格`} color={C.green} />
    </Svg>
  )
}

// ---------- 分数条 ----------
function FracBar({ parts = 4, filled = 1 }: FigureSpec) {
  const w = 330
  const cells = []
  const cw = w / parts
  for (let i = 0; i < parts; i++)
    cells.push(
      <rect
        key={i}
        x={4 + i * cw}
        y={18}
        width={cw - 3}
        height={64}
        rx={7}
        fill={i < filled ? C.secondary : '#F3F6FD'}
        stroke={C.line}
        strokeWidth={1.5}
      />,
    )
  return <Svg w={w + 8} h={100}>{cells}</Svg>
}

// ---------- 扇形分数/百分数 ----------
function FracPie({ parts = 4, filled = 1 }: FigureSpec) {
  const cx = 110
  const cy = 110
  const r = 92
  const slices = []
  const startAt = -90
  for (let i = 0; i < parts; i++) {
    const a0 = startAt + (i * 360) / parts
    const a1 = startAt + ((i + 1) * 360) / parts
    const rad = (d: number) => (d * Math.PI) / 180
    const p0 = { x: cx + r * Math.cos(rad(a0)), y: cy + r * Math.sin(rad(a0)) }
    const p1 = { x: cx + r * Math.cos(rad(a1)), y: cy + r * Math.sin(rad(a1)) }
    slices.push(
      <path
        key={i}
        d={`M ${cx} ${cy} L ${p0.x} ${p0.y} A ${r} ${r} 0 ${(360 / parts) > 180 ? 1 : 0} 1 ${p1.x} ${p1.y} Z`}
        fill={i < filled ? C.secondary : '#F3F6FD'}
        stroke="#fff"
        strokeWidth={2.5}
      />,
    )
  }
  return <Svg w={220} h={220}>{slices}</Svg>
}

// ---------- 条形示意图（应用题） ----------
function BarModel({ bars = [] }: FigureSpec) {
  const maxV = Math.max(...bars.map((b) => b.value ?? 0), 1)
  const rowH = 66
  const labelW = 86
  const barMax = 300
  const w = labelW + barMax + 70
  const h = bars.length * rowH + 24
  return (
    <Svg w={w} h={h}>
      {bars.map((b, i) => {
        const y = 18 + i * rowH
        const bw = b.value ? Math.max(26, (b.value / maxV) * barMax) : b.q ? barMax * 0.55 : 40
        const color = b.color ?? PALETTE[i % PALETTE.length]
        return (
          <g key={i}>
            <text x={labelW - 12} y={y + 26} textAnchor="end" fontSize={15} fontWeight={700} fill={C.ink}>
              {b.label}
            </text>
            <rect x={labelW} y={y - 8} width={bw} height={36} rx={9} fill={color} opacity={0.85} />
            <text x={labelW + bw + 12} y={y + 17} fontSize={16} fontWeight={800} fill={C.ink} fontFamily={NUM_FONT}>
              {b.q ? '?' : b.value}
            </text>
          </g>
        )
      })}
    </Svg>
  )
}

// ---------- 条形统计图 ----------
function BarChart({ chartItems = [] }: FigureSpec) {
  const maxY = Math.max(...chartItems.map((c) => c.value), 1)
  const step = maxY <= 10 ? Math.max(1, Math.ceil(maxY / 5)) : Math.ceil(maxY / 5 / 10) * 10
  const top = Math.ceil(maxY / step) * step
  const x0 = 44
  const y0 = 170
  const ch = 130
  const cw = Math.min(56, 280 / chartItems.length - 14)
  const gap = (340 - cw * chartItems.length) / (chartItems.length + 1)
  const grid = []
  for (let v = 0; v <= top; v += step)
    grid.push(
      <g key={v}>
        <line x1={x0} y1={y0 - (v / top) * ch} x2={360} y2={y0 - (v / top) * ch} stroke={C.line} strokeWidth={1} opacity={0.5} />
        <text x={x0 - 8} y={y0 - (v / top) * ch + 5} textAnchor="end" fontSize={13} fill={C.ink} fontFamily={NUM_FONT}>
          {v}
        </text>
      </g>,
    )
  return (
    <Svg w={390} h={215}>
      {grid}
      <line x1={x0} y1={y0} x2={360} y2={y0} stroke={C.ink} strokeWidth={2.5} />
      {chartItems.map((c, i) => {
        const bh = (c.value / top) * ch
        const x = x0 + gap + i * (cw + gap)
        return (
          <g key={i}>
            <rect x={x} y={y0 - bh} width={cw} height={bh} rx={6} fill={c.color ?? PALETTE[i % PALETTE.length]} />
            <text x={x + cw / 2} y={y0 - bh - 8} textAnchor="middle" fontSize={14} fontWeight={800} fill={C.ink} fontFamily={NUM_FONT}>
              {c.value}
            </text>
            <text x={x + cw / 2} y={y0 + 18} textAnchor="middle" fontSize={13} fontWeight={600} fill={C.ink}>
              {c.label}
            </text>
          </g>
        )
      })}
    </Svg>
  )
}

// ---------- 扇形统计图 ----------
function PieChart({ slices = [] }: FigureSpec) {
  const cx = 95
  const cy = 105
  const r = 82
  let acc = -90
  const paths = slices.map((s, i) => {
    const a0 = acc
    const a1 = acc + (s.percent / 100) * 360
    acc = a1
    const rad = (d: number) => (d * Math.PI) / 180
    const large = s.percent > 50 ? 1 : 0
    const p0 = { x: cx + r * Math.cos(rad(a0)), y: cy + r * Math.sin(rad(a0)) }
    const p1 = { x: cx + r * Math.cos(rad(a1)), y: cy + r * Math.sin(rad(a1)) }
    return { d: `M ${cx} ${cy} L ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y} Z`, s, i }
  })
  return (
    <Svg w={390} h={210}>
      {paths.map(({ d, s, i }) => (
        <path key={i} d={d} fill={s.color ?? PALETTE[i % PALETTE.length]} stroke="#fff" strokeWidth={2.5} />
      ))}
      {slices.map((s, i) => (
        <g key={i}>
          <rect x={200} y={30 + i * 34} width={16} height={16} rx={4} fill={s.color ?? PALETTE[i % PALETTE.length]} />
          <text x={224} y={43 + i * 34} fontSize={15} fontWeight={700} fill={C.ink}>
            {s.label} {s.percent}%
          </text>
        </g>
      ))}
    </Svg>
  )
}

// ---------- 长方体/正方体 ----------
function Box3d({ labels = {} }: FigureSpec) {
  const x = 40
  const y = 50
  const w = 150
  const h = 105
  const dx = 44
  const dy = 30
  return (
    <Svg w={300} h={230}>
      <polygon points={`${x},${y} ${x + dx},${y - dy} ${x + w + dx},${y - dy} ${x + w},${y}`} fill="#DBE7FD" stroke={C.primary} strokeWidth={2.5} />
      <polygon points={`${x + w},${y} ${x + w + dx},${y - dy} ${x + w + dx},${y + h - dy} ${x + w},${y + h}`} fill="#C3D4F7" stroke={C.primary} strokeWidth={2.5} />
      <rect x={x} y={y} width={w} height={h} fill="#EDF2FE" stroke={C.primary} strokeWidth={2.5} />
      {labels.w && <Chip x={x + w / 2} y={y + h + 22} text={labels.w} />}
      {labels.h && <Chip x={x - 28} y={y + h / 2} text={labels.h} />}
      {labels.d && <Chip x={x + w + dx + 22} y={y + h - dy / 2 - 18} text={labels.d} color={C.violet} />}
    </Svg>
  )
}

// ---------- 圆柱 ----------
function Cylinder({ labels = {} }: FigureSpec) {
  const cx = 160
  const top = 26
  const ry = 26
  const rx = 78
  const bh = 130
  return (
    <Svg w={330} h={220}>
      <path d={`M ${cx - rx} ${top} L ${cx - rx} ${top + bh} A ${rx} ${ry} 0 0 0 ${cx + rx} ${top + bh} L ${cx + rx} ${top}`} fill="#EDF2FE" stroke={C.primary} strokeWidth={2.5} />
      <ellipse cx={cx} cy={top} rx={rx} ry={ry} fill="#DBE7FD" stroke={C.primary} strokeWidth={2.5} />
      <path d={`M ${cx - rx} ${top} A ${rx} ${ry} 0 0 0 ${cx + rx} ${top}`} fill="none" stroke={C.primary} strokeWidth={2.5} />
      <line x1={cx - rx} y1={top} x2={cx - rx} y2={top + bh} stroke={C.primary} strokeWidth={2.5} />
      <line x1={cx + rx} y1={top} x2={cx + rx} y2={top + bh} stroke={C.primary} strokeWidth={2.5} />
      {labels.r && (
        <g>
          <line x1={cx} y1={top} x2={cx + rx} y2={top} stroke={C.accent} strokeWidth={3} />
          <Chip x={cx + rx / 2} y={top - 14} text={`r=${labels.r}`} color={C.accent} />
        </g>
      )}
      {labels.h && <Chip x={cx - rx - 34} y={top + bh / 2} text={`高${labels.h}`} color={C.green} />}
    </Svg>
  )
}

// ---------- 圆锥 ----------
function Cone({ labels = {} }: FigureSpec) {
  const cx = 150
  const base = 168
  const rx = 84
  const ry = 24
  const apex = 30
  return (
    <Svg w={320} h={220}>
      <polygon points={`${cx},${apex} ${cx - rx},${base} ${cx + rx},${base}`} fill="#EDF2FE" stroke={C.primary} strokeWidth={2.5} />
      <ellipse cx={cx} cy={base} rx={rx} ry={ry} fill="#DBE7FD" stroke={C.primary} strokeWidth={2.5} />
      <path d={`M ${cx - rx} ${base} A ${rx} ${ry} 0 0 0 ${cx + rx} ${base}`} fill="none" stroke={C.primary} strokeWidth={2.5} strokeDasharray="6 5" />
      {labels.r && (
        <g>
          <line x1={cx} y1={base} x2={cx + rx} y2={base} stroke={C.accent} strokeWidth={3} />
          <Chip x={cx + rx / 2} y={base + 18} text={`r=${labels.r}`} color={C.accent} />
        </g>
      )}
      {labels.h && (
        <g>
          <line x1={cx} y1={apex} x2={cx} y2={base} stroke={C.green} strokeWidth={3} strokeDasharray="7 5" />
          <Chip x={cx + 26} y={base / 2 + 20} text={`高${labels.h}`} color={C.green} />
        </g>
      )}
    </Svg>
  )
}

// ---------- 圆 ----------
function CircleFig({ labels = {} }: FigureSpec) {
  const cx = 110
  const cy = 110
  const r = 88
  return (
    <Svg w={230} h={230}>
      <circle cx={cx} cy={cy} r={r} fill="#EDF2FE" stroke={C.primary} strokeWidth={3.5} />
      {labels.d && (
        <g>
          <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke={C.accent} strokeWidth={3.5} />
          <Chip x={cx} y={cy - 16} text={`d=${labels.d}`} color={C.accent} />
        </g>
      )}
      {labels.r && !labels.d && (
        <g>
          <line x1={cx} y1={cy} x2={cx + r * Math.cos(-0.6)} y2={cy + r * Math.sin(-0.6)} stroke={C.accent} strokeWidth={3.5} />
          <circle cx={cx} cy={cy} r={4.5} fill={C.ink} />
          <Chip x={cx + 42} y={cy - 34} text={`r=${labels.r}`} color={C.accent} />
        </g>
      )}
    </Svg>
  )
}

// ---------- 天平（方程） ----------
function Balance({ left = '?', right = '?' }: FigureSpec) {
  const cx = 170
  const beamY = 46
  const panDrop = 64
  return (
    <Svg w={340} h={200}>
      <line x1={50} y1={beamY} x2={290} y2={beamY} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
      <polygon points={`${cx},${beamY} ${cx - 16},160 ${cx + 16},160`} fill={C.soft} stroke={C.ink} strokeWidth={3} />
      <rect x={cx - 38} y={158} width={76} height={12} rx={6} fill={C.ink} />
      <line x1={70} y1={beamY} x2={70} y2={beamY + panDrop - 18} stroke={C.line} strokeWidth={2} />
      <line x1={270} y1={beamY} x2={270} y2={beamY + panDrop - 18} stroke={C.line} strokeWidth={2} />
      <path d={`M 20 ${beamY + panDrop} A 50 28 0 0 0 120 ${beamY + panDrop}`} fill="#FDE9C8" stroke={C.secondary} strokeWidth={3} />
      <path d={`M 220 ${beamY + panDrop} A 50 28 0 0 0 320 ${beamY + panDrop}`} fill="#DBF3E2" stroke={C.green} strokeWidth={3} />
      <text x={70} y={beamY + panDrop - 6} textAnchor="middle" fontSize={21} fontWeight={800} fill={C.ink} fontFamily={NUM_FONT}>
        {left}
      </text>
      <text x={270} y={beamY + panDrop - 6} textAnchor="middle" fontSize={21} fontWeight={800} fill={C.ink} fontFamily={NUM_FONT}>
        {right}
      </text>
    </Svg>
  )
}

// ---------- 小正方体堆叠 ----------
function CubeStack({ levels = [3, 2, 1] }: FigureSpec) {
  const s = 15
  const cube = (x: number, y: number, key: number) => {
    const top = `M ${x} ${y} l ${s} ${-s / 2} l ${s} ${s / 2} l ${-s} ${s / 2} Z`
    const left = `M ${x} ${y} l ${s} ${s / 2} l 0 ${s} l ${-s} ${-s / 2} Z`
    const right = `M ${x + s} ${y + s / 2} l ${s} ${-s / 2} l 0 ${s} l ${-s} ${s / 2} Z`
    return (
      <g key={key}>
        <path d={top} fill="#C3D4F7" stroke={C.primary} strokeWidth={1.4} />
        <path d={left} fill="#EDF2FE" stroke={C.primary} strokeWidth={1.4} />
        <path d={right} fill="#A9C3F2" stroke={C.primary} strokeWidth={1.4} />
      </g>
    )
  }
  const cubes = []
  let key = 0
  const baseY = 40 + levels.length * s
  for (let j = levels.length - 1; j >= 0; j--) {
    const n = levels[j]
    for (let i = 0; i < n; i++) {
      const x = 60 + i * s * 2 + j * s
      const y = baseY + j * (s / 2) - i * 0
      cubes.push(cube(x, y - j * s, key++))
    }
  }
  return <Svg w={340} h={190}>{cubes}</Svg>
}

// ---------- 小棒（tens/ones） ----------
function Rods({ tens = 1, ones = 3 }: FigureSpec) {
  const parts: JSX.Element[] = []
  for (let t = 0; t < tens; t++) {
    const x = 30 + t * 100
    const sticks = []
    for (let i = 0; i < 6; i++) sticks.push(<line key={i} x1={x + i * 6} y1={30} x2={x + i * 6} y2={100} stroke={C.primary} strokeWidth={4} strokeLinecap="round" />)
    parts.push(
      <g key={`t${t}`}>
        {sticks}
        <rect x={x - 6} y={48} width={42} height={16} rx={8} fill={C.secondary} opacity={0.9} />
        <text x={x + 15} y={122} textAnchor="middle" fontSize={13} fontWeight={700} fill={C.ink}>
          10根
        </text>
      </g>,
    )
  }
  for (let o = 0; o < ones; o++) {
    const x = 30 + tens * 100 + o * 26
    parts.push(<line key={`o${o}`} x1={x} y1={44} x2={x} y2={100} stroke={C.red} strokeWidth={4.5} strokeLinecap="round" />)
  }
  if (ones > 0)
    parts.push(
      <text key="olabel" x={30 + tens * 100 + ((ones - 1) * 26) / 2} y={122} textAnchor="middle" fontSize={13} fontWeight={700} fill={C.ink}>
        {ones}根
      </text>,
    )
  return <Svg w={Math.max(60 + tens * 100 + ones * 26 + 30, 200)} h={140}>{parts}</Svg>
}

// ---------- 百格图 ----------
function PercentGrid({ filled = 30 }: FigureSpec) {
  const s = 20
  const cells = []
  for (let i = 0; i < 100; i++) {
    const r = Math.floor(i / 10)
    const c = i % 10
    cells.push(<rect key={i} x={8 + c * s} y={8 + r * s} width={s - 2} height={s - 2} rx={3} fill={i < filled ? C.secondary : '#F3F6FD'} stroke={C.line} strokeWidth={0.8} />)
  }
  return <Svg w={216} h={216}>{cells}</Svg>
}

// ---------- 主入口 ----------
export function Figure({ spec }: { spec: FigureSpec }) {
  switch (spec.kind) {
    case 'counting':
      return <Counting {...spec} />
    case 'tenFrame':
      return <TenFrame {...spec} />
    case 'numberline':
      return <NumberLine {...spec} />
    case 'array':
      return <ArrayFig {...spec} />
    case 'clock':
      return <Clock {...spec} />
    case 'money':
      return <Money {...spec} />
    case 'shapeRow':
      return <ShapeRow {...spec} />
    case 'ruler':
      return <Ruler {...spec} />
    case 'angle':
      return <AngleFig {...spec} />
    case 'polygon':
      return <PolygonFig {...spec} />
    case 'gridRect':
      return <GridRect {...spec} />
    case 'fracBar':
      return <FracBar {...spec} />
    case 'fracPie':
      return <FracPie {...spec} />
    case 'barModel':
      return <BarModel {...spec} />
    case 'barChart':
      return <BarChart {...spec} />
    case 'pieChart':
      return <PieChart {...spec} />
    case 'box3d':
      return <Box3d {...spec} />
    case 'cylinder':
      return <Cylinder {...spec} />
    case 'cone':
      return <Cone {...spec} />
    case 'circleFig':
      return <CircleFig {...spec} />
    case 'balance':
      return <Balance {...spec} />
    case 'cubeStack':
      return <CubeStack {...spec} />
    case 'rods':
      return <Rods {...spec} />
    case 'percentGrid':
      return <PercentGrid {...spec} />
    default:
      return null
  }
}

export { SHAPE_CN }
