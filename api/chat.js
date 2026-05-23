export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const API_KEY = process.env.GROQ_API_KEY;
    const { contents } = req.body;

    const messages = contents.map(c => ({
      role: c.role === 'model' ? 'assistant' : c.role,
      content: c.parts[0].text
    }));

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages,
        max_tokens: 300,
        temperature: 0.7
      })
    });

    const data = await response.json();
    const replyText = data?.choices?.[0]?.message?.content || 'Sorry, no response.';

    res.status(200).json({
      candidates: [{ content: { parts: [{ text: replyText }] } }]
    });

  } catch(err) {
    res.status(500).json({ error: err.message });
  }
}
