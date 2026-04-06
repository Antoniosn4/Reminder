// =============================================================
//  useVoiceRecording.js
//  Custom Hook — Simula gravação de áudio com "ghost typing" palavra a palavra.
//  Feature 3 — Dictation.
// =============================================================

import { useState, useEffect, useCallback } from "react";

/** Frase simulada digitada palavra por palavra durante a gravação. */
const MOCK_WORDS = ["Lembrar", "de", "falar", "com", "@Ana", "sobre", "o", "design"];
const WORD_INTERVAL_MS = 350;
const STOP_DELAY_AFTER_LAST_WORD_MS = 1200;

/**
 * @param {(value: string) => void} setInputValue - Setter do estado do input.
 * @returns {{ isRecording: boolean, toggleRecording: () => void }}
 */
export function useVoiceRecording(setInputValue) {
    const [isRecording, setIsRecording] = useState(false);

    // Efeito do ghost typing: dispara quando isRecording vira true
    useEffect(() => {
        if (!isRecording) return;

        let wordIndex = 0;
        setInputValue("");

        const interval = setInterval(() => {
            setInputValue((prev) =>
                prev ? `${prev} ${MOCK_WORDS[wordIndex]}` : MOCK_WORDS[wordIndex]
            );
            wordIndex++;

            if (wordIndex >= MOCK_WORDS.length) {
                clearInterval(interval);
                setTimeout(() => setIsRecording(false), STOP_DELAY_AFTER_LAST_WORD_MS);
            }
        }, WORD_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [isRecording, setInputValue]);

    const toggleRecording = useCallback(() => {
        setIsRecording((prev) => {
            if (prev) setInputValue(""); // Cancela e limpa se estava gravando
            return !prev;
        });
    }, [setInputValue]);

    return { isRecording, toggleRecording };
}
