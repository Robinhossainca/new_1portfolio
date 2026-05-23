exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    const API_KEY = process.env.GROQ_API_KEY;
    const body = JSON.parse(event.body);

    const messages = body.contents.map(c => ({
      role: c.role === 'model' ? 'assistant' : c.role,
      content: c.parts[0].text
    }));

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: messages,
        max_tokens: 300,
        temperature: 0.7
      })
    });

    const data = await res.json();
    const replyText = data?.choices?.[0]?.message?.content || 'Sorry, no response.';

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        candidates: [{ content: { parts: [{ text: replyText }] } }]
      })
    };

  } catch(err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
