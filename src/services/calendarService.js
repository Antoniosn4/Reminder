// =============================================================
//  calendarService.js
//  Camada de integração com o backend Google Calendar.
//  Responsabilidade única: comunicação com os endpoints /api/calendar/*.
//
//  SEGURANÇA: Tokens OAuth ficam em server/token.json (nunca no browser).
// =============================================================

const BASE_URL = "http://localhost:8000/api/calendar";

/**
 * Verifica se o usuário já autorizou o acesso ao Google Calendar.
 * @returns {Promise<boolean>}
 */
export async function getCalendarStatus() {
    try {
        const res = await fetch(`${BASE_URL}/status`);
        if (!res.ok) return false;
        const data = await res.json();
        return data.connected === true;
    } catch {
        return false;
    }
}

/**
 * Dispara o fluxo OAuth2: o backend abre o browser com a URL do Google.
 * O usuário autoriza → Google redireciona para o callback do backend.
 * @returns {Promise<void>}
 */
export async function connectCalendar() {
    try {
        await fetch(`${BASE_URL}/auth`);
    } catch (error) {
        console.error("[calendarService] Falha ao iniciar autorização OAuth:", error);
    }
}

/**
 * Cria ou atualiza um evento no Google Calendar para a tarefa.
 * Se a tarefa já tiver `gcalEventId`, o evento existente é atualizado.
 *
 * @param {object} task - Objeto da tarefa (precisa ter `title`, `time` e opcionalmente `gcalEventId`).
 * @returns {Promise<string|null>} O ID do evento no Google Calendar, ou null em caso de falha.
 */
export async function syncTask(task) {
    try {
        const res = await fetch(`${BASE_URL}/sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ task }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: res.statusText }));
            console.error("[calendarService] Falha ao sincronizar tarefa:", err.detail);
            return null;
        }

        const data = await res.json();
        return data.eventId ?? null;
    } catch (error) {
        console.error("[calendarService] Servidor indisponível:", error);
        return null;
    }
}

/**
 * Remove um evento do Google Calendar pelo seu ID.
 * @param {string} eventId - ID do evento a ser removido.
 * @returns {Promise<boolean>} true se removido com sucesso.
 */
export async function deleteCalendarEvent(eventId) {
    if (!eventId) return false;
    try {
        const res = await fetch(`${BASE_URL}/event/${encodeURIComponent(eventId)}`, {
            method: "DELETE",
        });
        return res.ok;
    } catch (error) {
        console.error("[calendarService] Falha ao remover evento:", error);
        return false;
    }
}
