# =============================================================
#  routers/whisper.py
#  Endpoint de transcrição de áudio via Faster-Whisper (modelo local/offline).
#
#  Detecção inteligente de hardware:
#    - GPU (CUDA disponível via torch) → float16, máxima velocidade RTX
#    - CPU (fallback)                  → int8,   compatibilidade universal
# =============================================================

import os
import tempfile
import logging

from faster_whisper import WhisperModel
from fastapi import APIRouter, HTTPException, UploadFile, File

logger = logging.getLogger(__name__)

router = APIRouter()

# ----- Detecção de hardware -----

def _detect_device() -> tuple[str, str]:
    """
    Detecta o melhor dispositivo disponível usando torch.
    Retorna (device, compute_type).

    - GPU com CUDA → ("cuda", "float16")   ideal para RTX 4060 (Ampere/Ada)
    - CPU          → ("cpu",  "int8")       máxima velocidade sem GPU
    """
    try:
        import torch
        if torch.cuda.is_available():
            gpu_name = torch.cuda.get_device_name(0)
            logger.info("🚀 [GPU] %s detectada — usando CUDA float16", gpu_name)
            return "cuda", "float16"
    except ImportError:
        logger.debug("torch não instalado — pulando detecção de GPU")
    except Exception as exc:
        logger.warning("Falha na detecção de GPU: %s — usando CPU", exc)

    logger.info("🐌 [CPU] Modo de Compatibilidade — usando int8")
    return "cpu", "int8"


# ----- Singleton do modelo -----

_whisper_model: WhisperModel | None = None
_whisper_device: str = "cpu"


def _get_model() -> WhisperModel:
    """Carrega o modelo Faster-Whisper uma única vez e reutiliza nas chamadas seguintes."""
    global _whisper_model, _whisper_device
    if _whisper_model is None:
        device, compute_type = _detect_device()
        _whisper_device = device
        logger.info(
            "Carregando modelo Faster-Whisper 'tiny' (device=%s, compute_type=%s)...",
            device, compute_type,
        )
        _whisper_model = WhisperModel(
            model_size_or_path="tiny",
            device=device,
            compute_type=compute_type,
        )
        logger.info("Modelo Faster-Whisper carregado com sucesso.")
    return _whisper_model


# ----- Rota -----

@router.post("/whisper")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Recebe um blob de áudio (webm, wav, mp3…) e retorna o texto transcrito.
    O arquivo temporário é sempre apagado após a transcrição.
    """
    original_name = file.filename or "audio.webm"
    suffix        = os.path.splitext(original_name)[1] or ".webm"

    tmp_path: str | None = None
    try:
        content = await file.read()
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        model = _get_model()
        segments, _ = model.transcribe(tmp_path, beam_size=5)
        text = " ".join(seg.text for seg in segments).strip()

        logger.info("Transcrição concluída: %d caracteres (device=%s)", len(text), _whisper_device)
        return {"text": text, "device": _whisper_device}

    except Exception as exc:
        logger.error("Falha na transcrição: %s", exc)
        raise HTTPException(
            status_code=500,
            detail=f"Falha na transcrição do áudio: {str(exc)}",
        )
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)
