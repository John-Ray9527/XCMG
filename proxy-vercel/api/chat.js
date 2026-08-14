// Vercel serverless 反代：DeepSeek
// 密钥通过 Vercel 环境变量注入（DEEPSEEK_API_KEY），只存在服务端，前端 bundle 不携带任何 key。

const DEEPSEEK_ENDPOINT = 'https://api.deepseek.com/chat/completions'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  const body = req.body
  if (req.method !== 'POST' || !body || !Array.isArray(body.messages)) {
    res.status(400).json({ error: 'missing messages' })
    return
  }

  const upstream = await fetch(DEEPSEEK_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: body.model || 'deepseek-chat',
      messages: body.messages,
      temperature: body.temperature ?? 0.7,
      max_tokens: body.max_tokens ?? 1200,
    }),
  })

  const data = await upstream.json().catch(() => null)
  if (!upstream.ok) {
    res.status(upstream.status).json({ error: data?.error?.message || `upstream ${upstream.status}` })
    return
  }

  res.status(200).json({ content: data?.choices?.[0]?.message?.content ?? '' })
}
