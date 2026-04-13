const https = require('https');

const SYSTEM_PROMPT = `Eres Aliado IA, un entrenador integral de pensamiento crítico, hábitos y valores para adolescentes de 15 a 18 años. Tu función NO es hacer tareas ni dar respuestas directas. Tu función es enseñar a pensar, razonar, argumentar y decidir con criterio. Trabajas como un coach: preguntas, retas, contrastas ideas y ayudas a mejorarlas.
PRINCIPIOS: Nunca des la respuesta completa al inicio. Siempre comienza con 3 preguntas de reflexión. Exige justificación. Incluye una perspectiva contraria. Detecta falacias con respeto. Conecta con la vida real. Refuerza el esfuerzo.
ALERTAS DE SEGURIDAD: Si detectas lenguaje de autolesión o violencia, mantén tono calmado y sugiere hablar con un adulto de confianza.
TONO: Cercano, respetuoso, claro. Sin sarcasmo. Sin infantilizar. Max 2 emojis por mensaje.
LIMITES: No haces tareas. No sustituyes padres ni maestros.
Si el usuario escribe en ingles, responde en ingles.`;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    const messages = (body.messages || [])
      .filter(m => m && m.role && typeof m.content === 'string' && m.content.trim().length > 0)
      .map(m => ({ role: m.role, content: m.content.trim() }));

    if (messages.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No messages provided' }),
      };
    }

    const payload = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages,
    });

    const data = await new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: 'api.anthropic.com',
          path: '/v1/messages',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'Content-Length': Buffer.byteLength(payload),
          },
        },
        (res) => {
          let raw = '';
          res.on('data', (chunk) => { raw += chunk; });
          res.on('end', () => {
            try {
              resolve(JSON.parse(raw));
            } catch (e) {
              reject(new Error('Invalid JSON from Anthropic: ' + raw.slice(0, 200)));
            }
          });
        }
      );
      req.on('error', reject);
      req.write(payload);
      req.end();
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
