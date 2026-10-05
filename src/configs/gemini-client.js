// Cliente minimal para la API REST de Gemini (generativelanguage.googleapis.com).
// Se usa fetch nativo (Node >= 18) en vez del SDK oficial @google/generative-ai para no
// agregar una dependencia nueva al proyecto — el formato de tools/function calling de
// Gemini es estable vía REST y no la necesita.

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const REQUEST_TIMEOUT_MS = 30000;
// Espera base antes de cada reintento (1er y 2do); se le suma jitter aleatorio.
const RETRY_DELAYS_MS = [1000, 3000];
const MAX_JITTER_MS = 250;
const TRANSIENT_HTTP_STATUS = [429, 503];
// Valores del campo error.status de Gemini equivalentes a 429 / 503 ("high demand" llega como UNAVAILABLE).
const TRANSIENT_ERROR_STATUS = ['UNAVAILABLE', 'RESOURCE_EXHAUSTED'];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// true si el error de Gemini trae un QuotaFailure cuyo quotaId es de cuota diaria (ej:
// GenerateRequestsPerDayPerProjectPerModel-FreeTier). No se repone esperando segundos, así que no se reintenta.
// Se detecta por quotaId, no por el texto del mensaje.
function isDailyQuotaExceeded(geminiError) {
  const details = Array.isArray(geminiError?.details) ? geminiError.details : [];
  return details.some(
    (detail) =>
      typeof detail?.['@type'] === 'string' &&
      detail['@type'].endsWith('QuotaFailure') &&
      Array.isArray(detail.violations) &&
      detail.violations.some((violation) => typeof violation?.quotaId === 'string' && violation.quotaId.includes('PerDay'))
  );
}

// Devuelve el motivo (sin mensaje ni contenido del chat) si el error es transitorio, o null si es permanente.
function transientReason(httpStatus, geminiError) {
  if (
    TRANSIENT_HTTP_STATUS.includes(httpStatus) ||
    TRANSIENT_HTTP_STATUS.includes(geminiError?.code) ||
    TRANSIENT_ERROR_STATUS.includes(geminiError?.status)
  ) {
    return `HTTP ${httpStatus}${geminiError?.status ? ` ${geminiError.status}` : ''}`;
  }
  return null;
}

// Un intento contra Gemini con timeout. Devuelve { json } si salió bien, o { transient: motivo }
// si hay que reintentar. Lanza directamente ante errores permanentes.
async function attemptGemini(url, apiKey, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    // Un 503 puede venir con cuerpo no JSON; no queremos que eso tape el status real.
    const json = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 429 && isDailyQuotaExceeded(json?.error)) {
        const error = new Error('Se agotó el límite diario de uso del asistente de IA. Probá de nuevo más tarde.');
        error.status = 429;
        throw error;
      }
      const reason = transientReason(response.status, json?.error);
      if (reason) return { transient: reason };
      throw new Error(`Error de la API de Gemini: ${json?.error?.message || response.statusText}`);
    }

    if (json === null) {
      throw new Error('Error de la API de Gemini: respuesta inválida');
    }

    return { json };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { transient: `timeout (${REQUEST_TIMEOUT_MS / 1000}s)` };
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

// Llama a generateContent con function calling habilitado.
// Reintenta (máx. 2 veces, con backoff) solo ante errores transitorios: 503, 429 y timeout.
// contents: array de objetos Content ({ role: 'user'|'model', parts: [...] })
// tools: array de function declarations ({ name, description, parameters })
export async function callGemini({ systemInstruction, contents, tools }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no configurado en el entorno');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

  const body = {
    contents,
    ...(tools?.length ? { tools: [{ functionDeclarations: tools }] } : {}),
    ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {})
  };

  const url = `${GEMINI_API_BASE}/${model}:generateContent`;

  for (let intento = 0; ; intento++) {
    const resultado = await attemptGemini(url, apiKey, body);

    if (resultado.json) {
      return resultado.json;
    }

    if (intento >= RETRY_DELAYS_MS.length) {
      const error = new Error('El asistente de IA está con alta demanda o no respondió a tiempo. Intentá de nuevo en unos segundos.');
      error.status = 503;
      throw error;
    }

    const espera = RETRY_DELAYS_MS[intento] + Math.floor(Math.random() * MAX_JITTER_MS);
    console.warn(`gemini-client: reintento ${intento + 1}/${RETRY_DELAYS_MS.length} en ${espera}ms (motivo: ${resultado.transient})`);
    await sleep(espera);
  }
}
