// ---------- 解题思路讲解分析 ----------
// 优先调用家长配置的 AI（OpenAI 兼容接口，默认智谱 bigmodel.cn，glm-4-flash 免费/低价）；
// 未配置或调用失败时退回本地规则判定（检查是否说出了"逻辑"而非只报数字）。

import type { Question } from '../types'

export interface AnalysisResult {
  pass: boolean
  /** 给孩子看的点评（讲得好在哪 / 缺了什么） */
  feedback: string
  /** 讲不清时，系统给出的逻辑讲解 */
  explanation: string
  viaAI: boolean
}

const LOGIC_WORDS = [
  '因为', '所以', '先', '再', '然后', '一共', '还剩', '平均', '倍', '份', '每', '多', '少',
  '单位', '进位', '退位', '凑十', '破十', '通分', '约分', '公式', '底', '高', '周长', '面积',
  '体积', '速度', '时间', '路程', '单价', '总价', '份数', '一半', '剩下', '等于', '乘', '除',
  '加', '减', '分成', '合起来', '不够', '满', '折', '百分', '比例', '方程', '左右', '平衡',
]

function ruleAnalyze(q: Question, transcript: string): AnalysisResult {
  const text = transcript.replace(/\s/g, '')
  const hits = LOGIC_WORDS.filter((w) => text.includes(w))
  const enough = text.length >= 12 && hits.length >= 2
  const explanation = q.hints.join('；')
  if (enough) {
    return {
      pass: true,
      feedback: `真棒！你说到了「${hits.slice(0, 3).join('」「')}」，能讲出道理才是真正学会了。${hits.length >= 4 ? '而且讲得很完整！' : ''}`,
      explanation,
      viaAI: false,
    }
  }
  return {
    pass: false,
    feedback:
      text.length < 12
        ? '讲得太短啦。说完整的话，比如：为什么用加法？先算什么，再算什么？'
        : `你提到了「${hits.slice(0, 2).join('」「') || '数字'}」，但听起来更像在报数字。试着讲讲道理：这一步为什么这么做？`,
    explanation,
    viaAI: false,
  }
}

async function aiAnalyze(q: Question, transcript: string, key: string, base: string, model: string): Promise<AnalysisResult> {
  const expected = [`知识点：${q.concept}`, ...q.hints.map((h, i) => `提示${i + 1}：${h}`)].join('\n')
  const sys = [
    '你是一位耐心的小学数学老师，正在听学生口头讲解解题思路。',
    '学生的任务是把"为什么这么解"讲清楚，而不是报出数字。',
    '请你判断讲解是否包含了核心逻辑（概念、方法选择的原因、步骤顺序），只报答案数字不算通过。',
    '要求：用小学生听得懂的中文；反馈要先肯定再指出问题；如果没通过，用一步步的方式把逻辑关系讲明白（可以说出中间步骤，但表述成引导式）。',
    '只输出一个 JSON 对象：{"pass": true/false, "feedback": "给孩子的话", "explanation": "没通过时的完整逻辑讲解，通过则给一句升华"}',
  ].join('\n')
  const user = `【题目】${q.prompt}\n【参考要点】\n${expected}\n【学生的讲解】${transcript}`
  const res = await fetch(`${base.replace(/\/$/, '')}/api/paas/v4/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: user },
      ],
      temperature: 0.3,
      max_tokens: 600,
    }),
  })
  if (!res.ok) throw new Error(`AI ${res.status}`)
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  const raw = data.choices?.[0]?.message?.content ?? ''
  const m = raw.match(/\{[\s\S]*\}/)
  if (!m) throw new Error('bad ai json')
  const parsed = JSON.parse(m[0]) as { pass?: boolean; feedback?: string; explanation?: string }
  return {
    pass: Boolean(parsed.pass),
    feedback: parsed.feedback?.trim() || '继续加油！',
    explanation: parsed.explanation?.trim() || q.hints.join('；'),
    viaAI: true,
  }
}

export async function analyzeExplanation(
  q: Question,
  transcript: string,
  ai?: { key: string; base?: string; model?: string },
): Promise<AnalysisResult> {
  if (ai?.key) {
    try {
      return await aiAnalyze(q, transcript, ai.key, ai.base || 'https://open.bigmodel.cn', ai.model || 'glm-4-flash')
    } catch {
      // 网络/额度/CORS 问题都退回规则判定，保证流程不卡住
      return { ...ruleAnalyze(q, transcript), feedback: `（AI 老师暂时联系不上，先用离线批改～）\n${ruleAnalyze(q, transcript).feedback}` }
    }
  }
  return ruleAnalyze(q, transcript)
}
