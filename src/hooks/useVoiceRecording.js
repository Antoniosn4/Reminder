// =============================================================
//  useVoiceRecording.js
//  Custom Hook — Gravação de áudio real via MediaRecorder + transcrição Whisper.
//  Feature 3 — Dictation.
//
//  Fluxo: usuário abre painel de gravação → timer inicia → clica ✔️ para transcrever
//         (auto-submit via onTranscribed) ou ❌ para cancelar.
// =============================================================

import { useState, useRef, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { transcribeAudio } from "../services/whisperService";

/**
 * @param {(value: string) => void} setInputValue - Setter do estado do input.
 * @param {(text: string) => void} [onTranscribed] - Callback chamado após a transcrição (auto-submit).
 */
export function useVoiceRecording(setInputValue, onTranscribed) {
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    // ✅ Usar useState (não useRef) para que mudanças disparem re-render no SmartInput
    const [mediaStream, setMediaStream] = useState(null);

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);
    const cancelledRef = useRef(false);
    // Mantém referência estável ao callback para evitar stale closures
    const onTranscribedRef = useRef(onTranscribed);
    useEffect(() => { onTranscribedRef.current = onTranscribed; }, [onTranscribed]);

    // ── Timer ───────────────────────────────────────────────────────────────
    useEffect(() => {
        if (isRecording) {
            setElapsedTime(0);
            timerRef.current = setInterval(() => {
                setElapsedTime((prev) => prev + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        return () => clearInterval(timerRef.current);
    }, [isRecording]);

    // ── Parar e transcrever ─────────────────────────────────────────────────
    const _stopAndTranscribe = useCallback(async () => {
        const recorder = mediaRecorderRef.current;
        if (!recorder || recorder.state === "inactive") return;

        cancelledRef.current = false;

        await new Promise((resolve) => {
            recorder.addEventListener("stop", resolve, { once: true });
            recorder.stop();
        });

        // Libera o microfone (Bug 2 fix)
        if (recorder.stream) {
            recorder.stream.getTracks().forEach((t) => t.stop());
        }

        // Se o usuário cancelou enquanto aguardávamos, abort
        if (cancelledRef.current) return;

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = [];
        mediaRecorderRef.current = null;
        setMediaStream(null);

        setIsRecording(false);
        setIsTranscribing(true);

        const text = await transcribeAudio(blob);

        setIsTranscribing(false);

        if (text === null) {
            // Bug 3 fix: toast quando o Whisper falha (backend offline, etc.)
            toast.error("Falha na transcrição. Verifique se o servidor está rodando.");
            return;
        }

        if (text.trim()) {
            setInputValue(text);
            // Auto-submit via ref estável (evita stale closure)
            onTranscribedRef.current?.(text);
        }
    }, [setInputValue]);

    // ── Iniciar gravação ────────────────────────────────────────────────────
    const _startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);

            chunksRef.current = [];
            cancelledRef.current = false;

            recorder.addEventListener("dataavailable", (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            });

            recorder.start();
            mediaRecorderRef.current = recorder;
            // ✅ Setar mediaStream via state ANTES de isRecording,
            // garantindo que no re-render o SmartInput já tem a stream
            setMediaStream(stream);
            setIsRecording(true);
        } catch (error) {
            console.error("[useVoiceRecording] Permissão de microfone negada:", error);
            toast.error("Permissão de microfone negada. Verifique as configurações do navegador.");
        }
    }, []);

    // ── Cancelar (descartar) ────────────────────────────────────────────────
    const cancelRecording = useCallback(() => {
        const recorder = mediaRecorderRef.current;
        if (!recorder) return;

        cancelledRef.current = true;

        // Para o recorder; o listener de "stop" acima vai ver cancelledRef=true e abortar
        recorder.addEventListener("stop", () => {
            chunksRef.current = [];
            mediaRecorderRef.current = null;
        }, { once: true });
        recorder.stop();

        // Libera o microfone imediatamente
        if (recorder.stream) {
            recorder.stream.getTracks().forEach((t) => t.stop());
        }

        setIsRecording(false);
        setElapsedTime(0);
        setMediaStream(null);
    }, []);

    // ── Toggle ──────────────────────────────────────────────────────────────
    const toggleRecording = useCallback(() => {
        if (isRecording) {
            _stopAndTranscribe();
        } else {
            _startRecording();
        }
    }, [isRecording, _startRecording, _stopAndTranscribe]);

    return { isRecording, isTranscribing, elapsedTime, toggleRecording, cancelRecording, mediaStream };
}
