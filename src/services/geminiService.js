// =============================================================
//  geminiService.js
//  Camada de integração com a API Gemini.
//  Responsabilidade única: comunicação HTTP com retry automático.
// =============================================================

const API_KEY = ""; // Injetada automaticamente pelo ambiente de execução
const MODEL = "gemini-2.5-flash-preview-09-2025";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

const RETRY_DELAYS_MS = [1000, 2000, 4000, 8000, 16000];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Envia um prompt para a API Gemini e retorna a resposta parseada como JSON.
 * Realiza até 5 tentativas com backoff exponencial em caso de falha.
 *
 * @param {string} prompt - O prompt de texto a ser enviado ao modelo.
 * @param {object} schema - O JSON Schema descrevendo a estrutura da resposta esperada.
 * @returns {Promise<object|null>} O objeto JSON gerado pela IA, ou null em caso de falha total.
 */
export async function callGemini(prompt, schema) {
  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  };

  for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt++) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error — status: ${response.status}`);
      }

      const data = await response.json();
      return JSON.parse(data.candidates[0].content.parts[0].text);
    } catch (error) {
      const isLastAttempt = attempt === RETRY_DELAYS_MS.length - 1;
      if (isLastAttempt) {
        console.error("Falha ao contatar Gemini API após várias tentativas:", error);
        return null;
      }
      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }

  return null;
}
