# =============================================================
#  routers/gemini.py
#  Router FastAPI — Proxy seguro para a API Gemini do Google.
#  A API Key NUNCA trafega pelo frontend; reside apenas no .env.
# =============================================================

import os
import httpx
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any
from dotenv import load_dotenv

# Carrega o .env relativo ao diretório deste arquivo (seguro independente do cwd).
# Sem isso, o .env não é encontrado se uvicorn for iniciado de fora de server/.
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

router = APIRouter()

# Lê a chave APÓS o load_dotenv para garantir que o .env foi processado.
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = "gemini-1.5-flash"


def _build_gemini_url() -> str:
    """Monta a URL usando a chave carregada do .env."""
    return (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    )


# ----- Schemas de entrada -----

class GenerationConfig(BaseModel):
    responseMimeType: str
    responseSchema: Any  # Any aceita dicts aninhados (ARRAY/OBJECT com items)


class GeminiRequest(BaseModel):
    contents: list
    generationConfig: GenerationConfig


# ----- Rota -----

@router.post("")
async def proxy_gemini(payload: GeminiRequest):
    """
    Recebe o payload do frontend, injeta a API Key do servidor
    e repassa a requisição para a API Gemini do Google.
    Retorna a resposta JSON da IA diretamente para o frontend.
    """
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY não configurada. Edite server/.env e reinicie o servidor.",
        )

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            _build_gemini_url(),
            json=payload.model_dump(),
            headers={"Content-Type": "application/json"},
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Erro da API Gemini: {response.text}",
        )

    return response.json()
