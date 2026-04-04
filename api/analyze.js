export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const geminiRes = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gemini-2.5-flash',
          response_format: { type: 'json_object' },
          max_tokens: 6000,
          messages: req.body.messages
        })
      }
    )

    if (!geminiRes.ok) {
      const err = await geminiRes.text()
      return res.status(geminiRes.status).json({ error: err })
    }

    const data = await geminiRes.json()
    return res.status(200).json(data)

  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
