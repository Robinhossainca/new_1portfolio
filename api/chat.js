export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const API_KEY = process.env.GROQ_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ error: 'API key missing' });
    }

    const { contents } = req.body;

    const messages = contents.map(c => ({
      role: c.role === 'model' ? 'assistant' : 'user',
      content: c.parts[0].text
    }));

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: messages,
        max_tokens: 300,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(500).json({ error: data });
    }

    const replyText = data?.choices?.[0]?.message?.content;
    
    if (!replyText) {
      return res.status(500).json({ error: 'No reply from Groq', raw: data });
    }

    res.status(200).json({
      candidates: [{ content: { parts: [{ text: replyText }] } }]
    });

  } catch(err) {
    res.status(500).json({ error: err.message });
  }
}
