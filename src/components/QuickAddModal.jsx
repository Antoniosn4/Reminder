// =============================================================
//  QuickAddModal.jsx
//  Modal de adição rápida de tarefas, encapsulando o SmartInput.
// =============================================================

import { useEffect } from "react";
import { SmartInput } from "./SmartInput";

/**
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   inputRef: React.RefObject,
 *   inputValue: string,
 *   isRecording: boolean,
 *   isTranscribing: boolean,
 *   isAnalyzing: boolean,
 *   elapsedTime: number,
 *   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
 *   onSubmit: (e: React.FormEvent) => void,
 *   onToggleRecording: () => void,
 *   onCancelRecording: () => void,
 *   children?: React.ReactNode
 * }} props
 */
export function QuickAddModal({
    isOpen,
    onClose,
    inputRef,
    inputValue,
    isRecording,
    isTranscribing,
    isAnalyzing,
    elapsedTime,
    mediaStream,
    onChange,
    onSubmit,
    onToggleRecording,
    onCancelRecording,
    children,
}) {
    // ESC para fechar (não fecha se estiver gravando para evitar perda)
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && !isRecording) onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, isRecording, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => { if (!isRecording) onClose(); }}
        >
            <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
                <SmartInput
                    inputRef={inputRef}
                    value={inputValue}
                    isRecording={isRecording}
                    isTranscribing={isTranscribing}
                    isAnalyzing={isAnalyzing}
                    elapsedTime={elapsedTime}
                    mediaStream={mediaStream}
                    onChange={onChange}
                    onSubmit={(e) => { onSubmit(e); onClose(); }}
                    onToggleRecording={onToggleRecording}
                    onCancelRecording={onCancelRecording}
                >
                    {children}
                </SmartInput>
                <p className="text-center text-xs text-gray-400 mt-4">
                    {isRecording ? "Grave e clique ✔️ para criar a tarefa" : "Pressione ESC para fechar"}
                </p>
            </div>
        </div>
    );
}
