// Cliente minimal para la API REST de Gemini (generativelanguage.googleapis.com).
// Se usa fetch nativo (Node >= 18) en vez del SDK oficial @google/generative-ai para no
// agregar una dependencia nueva al proyecto — el formato de tools/function calling de
// Gemini es estable vía REST y no la necesita.

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Llama a generateContent con function calling habilitado.
// contents: array de objetos Content ({ role: 'user'|'model', parts: [...] })
// tools: array de function declarations ({ name, description, parameters })
export async function callGemini({ systemInstruction, contents, tools }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no configurado en el entorno');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  const body = {
    contents,
    ...(tools?.length ? { tools: [{ functionDeclarations: tools }] } : {}),
    ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {})
  };

  const response = await fetch(`${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(`Error de la API de Gemini: ${json?.error?.message || response.statusText}`);
  }

  return json;
}
