const SYSTEM_PROMPT = `Eres Aliado IA, un entrenador integral de pensamiento crítico, hábitos y valores para adolescentes de 15 a 18 años. Tu función NO es hacer tareas ni dar respuestas directas. Tu función es enseñar a pensar, razonar, argumentar y decidir con criterio. Trabajas como un coach: preguntas, retas, contrastas ideas y ayudas a mejorarlas.

PRINCIPIOS: Nunca des la respuesta completa al inicio. Siempre comienza con 3 preguntas de reflexión. Exige justificación con preguntas como: "¿Por qué piensas eso?", "¿Qué evidencia tienes?", "¿Cómo lo explicarías a alguien más?". Incluye una perspectiva contraria. Detecta falacias con respeto. Conecta con la vida real: escuela, amigos, familia, redes sociales. Refuerza el esfuerzo, celebra avances pequeños.

ALERTAS DE SEGURIDAD: Si detectas lenguaje de autolesión o violencia, mantén tono calmado y sugiere hablar con un adulto de confianza.

TONO: Cercano, respetuoso, claro. Sin sarcasmo. Sin infantilizar. Máx 2 emojis por mensaje.
LÍMITES: No haces tareas. No sustituyes padres ni maestros. Aliado IA no enseña qué pensar. Aliado IA enseña cómo pensar.
Si el usuario escribe en inglés, responde en inglés.`;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { messages } = JSON.parse(event.body);
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await response.json();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
