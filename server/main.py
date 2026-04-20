# =============================================================
#  main.py — Servidor local FastAPI
#  Proxies: Gemini (NLP) + Whisper (transcrição de voz).
# =============================================================

import os
import httpx
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from routers import whisper as whisper_router
from routers import calendar as calendar_router
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Carrega o .env do mesmo diretório deste arquivo (server/.env)
load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL   = "gemini-2.5-flash"
GEMINI_URL     = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
)

# ----- App -----

app = FastAPI(
    title="Reminder Local Server",
    description="Proxy seguro para Gemini e transcrição Whisper local.",
    version="2.0.0",
)

# ----- CORS -----
# allow_origins=["*"] é seguro aqui porque este servidor NUNCA é exposto
# à internet — roda exclusivamente em localhost durante o desenvolvimento.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----- Routers -----
app.include_router(whisper_router.router, prefix="/api")
app.include_router(calendar_router.router, prefix="/api")

# ----- Schemas -----

class GenerationConfig(BaseModel):
    responseMimeType: str
    responseSchema: Any  # Aceita schemas aninhados (ARRAY/OBJECT com items)

class GeminiRequest(BaseModel):
    contents: list
    generationConfig: GenerationConfig

# ----- Rotas -----

@app.get("/")
async def root():
    """Health check — confirma que o servidor está rodando."""
    key_loaded = bool(GEMINI_API_KEY)
    return {
        "status": "ok",
        "service": "Reminder Local Server",
        "api_key_loaded": key_loaded,
    }

@app.post("/api/gemini")
async def proxy_gemini(payload: GeminiRequest):
    """
    Proxy seguro para o Gemini.
    Injeta a GEMINI_API_KEY do servidor e repassa o payload para o Google.
    """
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY não configurada em server/.env.",
        )

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            GEMINI_URL,
            json=payload.model_dump(),
            headers={"Content-Type": "application/json"},
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Erro da API Gemini: {response.text}",
        )

    return response.json()
