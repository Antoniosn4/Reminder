// =============================================================
//  useVoiceRecording.js
//  Custom Hook — Simula a lógica de gravação de áudio via microfone.
//  (Mock: preenche o input com texto de demonstração após 3 segundos)
// =============================================================

import { useState, useCallback } from "react";

const MOCK_TRANSCRIPTION =
    "Lembrar de aprovar o orçamento com a equipe amanhã cedo...";
const MOCK_RECORDING_DURATION_MS = 3000;

/**
 * @param {React.MutableRefObject<string>} setInputValue - Setter do estado do input.
 * @returns {{ isRecording: boolean, toggleRecording: () => void }}
 */
export function useVoiceRecording(setInputValue) {
    const [isRecording, setIsRecording] = useState(false);

    const toggleRecording = useCallback(() => {
        setIsRecording((prev) => {
            const willRecord = !prev;

            if (willRecord) {
                setInputValue(MOCK_TRANSCRIPTION);
                setTimeout(() => setIsRecording(false), MOCK_RECORDING_DURATION_MS);
            } else {
                setInputValue("");
            }

            return willRecord;
        });
    }, [setInputValue]);

    return { isRecording, toggleRecording };
}
