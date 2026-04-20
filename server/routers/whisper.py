# =============================================================
#  routers/whisper.py
#  Endpoint de transcrição de áudio via Whisper (modelo local/offline).
#  Responsabilidade: receber um arquivo de áudio, transcrevê-lo e
#  retornar o texto sem expor nenhuma chave no frontend.
#
#  Modelo padrão: "tiny" (~75 MB, baixado automaticamente na 1ª chamada).
# =============================================================

import os
import tempfile
import logging

import whisper
from fastapi import APIRouter, HTTPException, UploadFile, File

logger = logging.getLogger(__name__)

router = APIRouter()

# ----- Singleton do modelo -----
# O modelo é carregado uma vez e reutilizado em todas as requisições
# para evitar a latência de ~1s de carregamento a cada chamada.
_whisper_model = None


def _get_model() -> whisper.Whisper:
    """Retorna o modelo Whisper, carregando-o na primeira chamada."""
    global _whisper_model
    if _whisper_model is None:
        logger.info("Carregando modelo Whisper 'tiny'... (apenas na primeira chamada)")
        _whisper_model = whisper.load_model("tiny")
        logger.info("Modelo Whisper carregado com sucesso.")
    return _whisper_model


# ----- Rota -----

@router.post("/whisper")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Recebe um blob de áudio (webm, wav, mp3, etc.) e retorna o texto transcrito.

    O arquivo é salvo temporariamente em disco, transcrito pelo Whisper
    e então apagado - nenhum dado de áudio é persistido.
    """
    # Determina a extensão para o arquivo temporário
    original_name = file.filename or "audio.webm"
    suffix = os.path.splitext(original_name)[1] or ".webm"

    tmp_path: str | None = None
    try:
        # Salva o blob em um arquivo temporário
        content = await file.read()
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        # Transcreve com o modelo Whisper local
        model = _get_model()
        result = model.transcribe(tmp_path, fp16=False)
        text = result.get("text", "").strip()

        logger.info("Transcrição concluída: %d caracteres", len(text))
        return {"text": text}

    except Exception as exc:
        logger.error("Falha na transcrição: %s", exc)
        raise HTTPException(
            status_code=500,
            detail=f"Falha na transcrição do áudio: {str(exc)}",
        )
    finally:
        # Garante que o arquivo temporário seja sempre apagado
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)
