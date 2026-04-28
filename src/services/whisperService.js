// =============================================================
//  whisperService.js
//  Camada de integração com o endpoint de transcrição de voz.
//  Responsabilidade única: enviar um blob de áudio e retornar o texto.
//
//  SEGURANÇA: O processamento ocorre no servidor local (localhost:8000).
//  Nenhuma chave de API é necessária ou exposta neste arquivo.
// =============================================================

const WHISPER_URL = "http://localhost:8000/api/whisper";

/**
 * Envia um Blob de áudio para o endpoint Whisper local e retorna o texto transcrito.
 *
 * @param {Blob} audioBlob - O blob de áudio gravado pelo MediaRecorder.
 * @returns {Promise<string|null>} O texto transcrito, ou null em caso de falha.
 */
export async function transcribeAudio(audioBlob) {
    try {
        const formData = new FormData();
        // O nome do arquivo informa ao backend a extensão correta para o tempfile
        formData.append("file", audioBlob, "recording.webm");

        const response = await fetch(WHISPER_URL, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: response.statusText }));
            console.error("[whisperService] Erro do servidor:", error.detail);
            return null;
        }

        const data = await response.json();
        if (data.device) {
            console.info(`[Whisper] Device: ${data.device}`);
        }
        return data.text ?? null;
    } catch (error) {
        console.error(
            "[whisperService] Falha ao contatar o servidor de transcrição. Verifique se 'server/main.py' está rodando:",
            error
        );
        return null;
    }
}
