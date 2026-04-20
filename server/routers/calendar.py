# =============================================================
#  routers/calendar.py
#  Google Calendar OAuth2 + sincronização de tarefas.
#
#  FIX (PKCE / invalid_grant): A biblioteca google-auth-oauthlib
#  implementa PKCE por padrão e armazena o code_verifier na instância
#  do Flow. Como o FastAPI é stateless, precisamos persistir a mesma
#  instância do Flow entre /auth e /callback usando um dicionário
#  em memória indexado pelo parâmetro `state` do OAuth.
#
#  Fluxo OAuth (Desktop App):
#    1. GET /api/calendar/auth      → cria Flow, guarda em _pending_flows[state]
#                                   → abre browser com auth_url
#    2. GET /api/calendar/callback  → recupera Flow via ?state=... → fetch_token
#                                   → salva token.json → retorna HTML de sucesso
#    3. GET /api/calendar/status    → verifica se token existe e é válido
#
#  Sincronização:
#    POST   /api/calendar/sync               → cria/atualiza evento
#    DELETE /api/calendar/event/{event_id}   → remove evento
# =============================================================

import os
import webbrowser
import logging
from datetime import date, datetime, timezone
from pathlib import Path

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

logger = logging.getLogger(__name__)

router = APIRouter()

# ----- Caminhos -----
BASE_DIR = Path(__file__).resolve().parent.parent
CREDENTIALS_FILE = BASE_DIR / "credentials.json"
TOKEN_FILE = BASE_DIR / "token.json"

# ----- Configuração OAuth -----
SCOPES = ["https://www.googleapis.com/auth/calendar.events"]
REDIRECT_URI = "http://localhost:8000/api/calendar/callback"

# ----- Estado global em memória (PKCE fix) -----
# Mapeia state → instância do Flow criada em /auth.
# Garante que o mesmo Flow (com o code_verifier correto) seja usado em /callback.
_pending_flows: dict[str, Flow] = {}


# ----- Helpers -----

def _credentials_exist() -> bool:
    return CREDENTIALS_FILE.exists()


def _load_token() -> Credentials | None:
    """Carrega e, se necessário, refresca o token salvo em token.json."""
    if not TOKEN_FILE.exists():
        return None
    try:
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
            TOKEN_FILE.write_text(creds.to_json(), encoding="utf-8")
        return creds if creds and creds.valid else None
    except Exception as exc:
        logger.warning("Falha ao carregar token: %s", exc)
        return None


def _get_calendar_service():
    """Retorna um cliente autenticado da Google Calendar API."""
    creds = _load_token()
    if not creds:
        raise HTTPException(
            status_code=401,
            detail="Não autenticado. Acesse /api/calendar/auth para conectar.",
        )
    return build("calendar", "v3", credentials=creds, cache_discovery=False)


def _parse_task_to_event(task: dict) -> dict:
    """
    Converte um objeto de tarefa do Reminder em um recurso de evento GCal.
    - Se `time` contiver ":" (ex: "10:00", "14:30") → evento com hora exata (1h duração)
    - Caso contrário → evento de dia inteiro (all-day)
    """
    today = date.today().isoformat()
    title = task.get("title", "Tarefa sem título")
    raw_time: str = task.get("time", "")

    if ":" in raw_time:
        try:
            hour, minute = map(int, raw_time.split(":")[:2])
            start_dt = datetime(
                date.today().year, date.today().month, date.today().day,
                hour, minute, tzinfo=timezone.utc,
            )
            end_dt = start_dt.replace(hour=min(hour + 1, 23))
            return {
                "summary": title,
                "start": {"dateTime": start_dt.isoformat(), "timeZone": "UTC"},
                "end":   {"dateTime": end_dt.isoformat(),   "timeZone": "UTC"},
            }
        except (ValueError, TypeError):
            pass

    return {
        "summary": title,
        "start": {"date": today},
        "end":   {"date": today},
    }


# ----- Schemas -----

class SyncPayload(BaseModel):
    task: dict


# ----- Rotas -----

@router.get("/calendar/status")
def calendar_status():
    """Informa se o usuário está autenticado no Google Calendar."""
    if not _credentials_exist():
        return {"connected": False, "reason": "credentials.json não encontrado em server/"}
    creds = _load_token()
    return {"connected": creds is not None}


@router.get("/calendar/auth")
def calendar_auth():
    """
    Inicia o fluxo OAuth2.
    - Cria uma instância do Flow (que gera o code_verifier PKCE internamente).
    - Armazena a instância em _pending_flows[state] para recuperar no callback.
    - Abre o browser com a URL de autorização.
    """
    if not _credentials_exist():
        raise HTTPException(
            status_code=500,
            detail=(
                "Arquivo 'server/credentials.json' não encontrado. "
                "Siga as instruções do plano para criar as credenciais no Google Cloud Console."
            ),
        )

    flow = Flow.from_client_secrets_file(
        str(CREDENTIALS_FILE),
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI,
    )

    # authorization_url() gera o code_verifier/code_challenge PKCE e devolve o state
    auth_url, state = flow.authorization_url(
        prompt="consent",
        access_type="offline",
    )

    # ✅ PKCE fix: guarda a instância do Flow vinculada ao state
    _pending_flows[state] = flow
    logger.info("Flow pendente criado para state=%s", state[:12])

    webbrowser.open(auth_url)
    return {"status": "browser_opened", "message": "Autorizando no browser..."}


@router.get("/calendar/callback", response_class=HTMLResponse)
def calendar_callback(code: str = Query(...), state: str = Query(...)):
    """
    Recebe o authorization code e state do Google.
    Recupera a instância do Flow original (com o code_verifier PKCE intacto),
    troca o code por tokens e salva em token.json.
    """
    # ✅ PKCE fix: recupera o Flow que foi criado em /auth
    flow = _pending_flows.pop(state, None)
    if flow is None:
        logger.error("Flow não encontrado para state=%s. Possível replay ou expiração.", state[:12])
        raise HTTPException(
            status_code=400,
            detail="Sessão OAuth inválida ou expirada. Tente conectar novamente.",
        )

    try:
        flow.fetch_token(code=code)
        creds = flow.credentials
        TOKEN_FILE.write_text(creds.to_json(), encoding="utf-8")
        logger.info("Token OAuth salvo com sucesso em token.json.")
    except Exception as exc:
        logger.error("Falha ao obter token: %s", exc)
        raise HTTPException(status_code=500, detail=f"Falha na autenticação: {str(exc)}")

    return """
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Reminder — Conectado!</title>
      <style>
        body { font-family: system-ui, sans-serif; display:flex; align-items:center;
               justify-content:center; min-height:100vh; margin:0; background:#111827; color:#e5e7eb; }
        .card { text-align:center; padding:2rem; border-radius:1rem;
                background:#1f2937; border:1px solid #374151; max-width:400px; }
        h1 { color:#10b981; margin-bottom:.5rem; }
        p  { color:#9ca3af; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>✅ Conectado ao Google Calendar!</h1>
        <p>Você pode fechar esta aba e voltar ao Reminder.</p>
      </div>
    </body>
    </html>
    """


@router.post("/calendar/sync")
def sync_task(payload: SyncPayload):
    """
    Cria ou atualiza um evento no Google Calendar para a tarefa fornecida.
    - Se `task.gcalEventId` existir → atualiza (PATCH) o evento existente.
    - Caso contrário → cria um novo evento e retorna o `eventId`.
    """
    service = _get_calendar_service()
    event_body = _parse_task_to_event(payload.task)
    existing_event_id: str | None = payload.task.get("gcalEventId")

    try:
        if existing_event_id:
            event = service.events().patch(
                calendarId="primary",
                eventId=existing_event_id,
                body=event_body,
            ).execute()
        else:
            event = service.events().insert(
                calendarId="primary",
                body=event_body,
            ).execute()

        logger.info("Evento sincronizado: %s", event["id"])
        return {"eventId": event["id"]}

    except HttpError as exc:
        logger.error("Erro na API do Google Calendar: %s", exc)
        raise HTTPException(
            status_code=exc.resp.status,
            detail=f"Erro ao sincronizar com Google Calendar: {exc}",
        )


@router.delete("/calendar/event/{event_id}")
def delete_calendar_event(event_id: str):
    """Remove um evento do Google Calendar pelo seu ID."""
    service = _get_calendar_service()
    try:
        service.events().delete(calendarId="primary", eventId=event_id).execute()
        logger.info("Evento removido: %s", event_id)
        return {"deleted": True}
    except HttpError as exc:
        if exc.resp.status == 410:  # Gone — já não existe
            return {"deleted": True}
        logger.error("Erro ao deletar evento: %s", exc)
        raise HTTPException(
            status_code=exc.resp.status,
            detail=f"Erro ao remover evento do Google Calendar: {exc}",
        )
