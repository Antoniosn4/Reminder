// =============================================================
//  geminiService.js
//  Camada de integração com a API Gemini via proxy local.
//
//  SEGURANÇA: A chave de API reside APENAS em server/.env.
//  Este arquivo aponta para http://localhost:8000/api/gemini (proxy Python).
//
//  TIMEOUT: 5s por tentativa — se o servidor local não está rodando,
//  falha rapidamente (connection refused é instantâneo, mas garantimos
//  o timeout para outros casos). Máximo 2 tentativas (antes eram 5/31s).
// =============================================================

const LOCAL_API_URL = "http://localhost:8000/api/gemini";
const FETCH_TIMEOUT_MS = 5_000;   // 5s por tentativa
const MAX_RETRIES = 2;        // 1 tentativa + 1 retry = falha em ≤10s
const RETRY_DELAY_MS = 1_000;   // 1s entre tentativas

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Cria um fetch com timeout controlado por AbortController.
 * Se o servidor local não responder em FETCH_TIMEOUT_MS, aborta.
 */
async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

/**
 * Envia um prompt para a API Gemini via proxy local e retorna a resposta parseada.
 * Falha rapidamente (≤10s) se o servidor estiver offline.
 * Retorna null em caso de falha total (nunca lança exceção).
 *
 * @param {string} prompt - O prompt de texto.
 * @param {object} schema - O JSON Schema da resposta.
 * @returns {Promise<object|null>}
 */
export async function callGemini(prompt, schema) {
  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  };

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetchWithTimeout(LOCAL_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return JSON.parse(data.candidates[0].content.parts[0].text);

    } catch (error) {
      const isLast = attempt === MAX_RETRIES;
      if (isLast) {
        console.warn(
          `[geminiService] Falha após ${MAX_RETRIES} tentativa(s). ` +
          "Verifique se server/main.py está rodando.",
          error?.message ?? error
        );
        return null;
      }
      await sleep(RETRY_DELAY_MS);
    }
  }

  return null;
}