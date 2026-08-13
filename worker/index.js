// Cloudflare Worker：DeepSeek 反代
// 密钥通过 Secret 注入（wrangler secret put DEEPSEEK_API_KEY），
// 只存在服务端，前端 bundle 不再携带任何 key。

const DEEPSEEK_ENDPOINT = 'https://api.deepseek.com/chat/completions'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS })
    }

    const url = new URL(request.url)

    if (request.method === 'GET' && url.pathname === '/') {
      return new Response('deepseek-proxy ok', { headers: CORS })
    }

    if (url.pathname !== '/chat') {
      return json({ error: 'not found' }, 404)
    }

    const body = await request.json().catch(() => null)
    if (!body || !Array.isArray(body.messages)) {
      return json({ error: 'missing messages' }, 400)
    }

    const res = await fetch(DEEPSEEK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: body.model || 'deepseek-chat',
        messages: body.messages,
        temperature: body.temperature ?? 0.7,
        max_tokens: body.max_tokens ?? 1200,
      }),
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      return json({ error: data?.error?.message || `upstream ${res.status}` }, res.status)
    }

    const content = data?.choices?.[0]?.message?.content ?? ''
    return json({ content })
  },
}
