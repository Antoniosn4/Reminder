// =============================================================
//  useVoiceRecording.js
//  Custom Hook — Gravação de áudio real via MediaRecorder + transcrição Whisper.
//  Feature 3 — Dictation.
//
//  Fluxo: usuário clica mic → MediaRecorder inicia → usuário clica novamente →
//  MediaRecorder para → blob é enviado ao backend → texto preenche o input.
// =============================================================

import { useState, useRef, useCallback } from "react";
import { transcribeAudio } from "../services/whisperService";

/**
 * @param {(value: string) => void} setInputValue - Setter do estado do input.
 * @returns {{
 *   isRecording: boolean,
 *   isTranscribing: boolean,
 *   toggleRecording: () => void,
 * }}
 */
export function useVoiceRecording(setInputValue) {
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);

    const mediaRecorderRef = useRef(/** @type {MediaRecorder|null} */(null));
    const chunksRef = useRef(/** @type {Blob[]} */([]));

    /**
     * Para a gravação ativa, consolida os chunks em um Blob,
     * envia ao backend Whisper e injeta o texto transcrito no input.
     */
    const _stopAndTranscribe = useCallback(async () => {
        const recorder = mediaRecorderRef.current;
        if (!recorder || recorder.state === "inactive") return;

        // Resolve após o evento 'stop' do MediaRecorder (garante que todos os chunks chegaram)
        await new Promise((resolve) => {
            recorder.addEventListener("stop", resolve, { once: true });
            recorder.stop();
        });

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = [];
        mediaRecorderRef.current = null;

        setIsRecording(false);
        setIsTranscribing(true);

        const text = await transcribeAudio(blob);

        if (text) {
            setInputValue(text);
        }

        setIsTranscribing(false);
    }, [setInputValue]);

    /**
     * Inicia uma nova gravação via MediaRecorder.
     * Solicita permissão de microfone se ainda não concedida.
     */
    const _startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);

            chunksRef.current = [];

            recorder.addEventListener("dataavailable", (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            });

            recorder.start();
            mediaRecorderRef.current = recorder;
            setIsRecording(true);
        } catch (error) {
            console.error(
                "[useVoiceRecording] Permissão de microfone negada ou erro ao iniciar MediaRecorder:",
                error
            );
        }
    }, []);

    /** Alterna entre início e parada da gravação. */
    const toggleRecording = useCallback(() => {
        if (isRecording) {
            _stopAndTranscribe();
        } else {
            _startRecording();
        }
    }, [isRecording, _startRecording, _stopAndTranscribe]);

    return { isRecording, isTranscribing, toggleRecording };
}
