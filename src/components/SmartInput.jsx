// =============================================================
//  SmartInput.jsx
//  Campo de entrada inteligente com suporte a NLP, gravação e @mention.
//  Features 3 (Dictation) e 5 (Colaboração).
// =============================================================

import { Mic, MicOff, Plus, Send, Loader2 } from "lucide-react";

/** Alturas relativas de cada barra de onda — definidas uma vez para estabilidade. */
const WAVE_BARS = [60, 100, 45, 85, 55];

/**
 * @param {{
 *   inputRef: React.RefObject<HTMLInputElement>,
 *   value: string,
 *   isRecording: boolean,
 *   isTranscribing: boolean,
 *   isAnalyzing: boolean,
 *   onChange: (value: string) => void,
 *   onSubmit: (e: React.FormEvent) => void,
 *   onToggleRecording: () => void,
 *   children?: React.ReactNode
 * }} props
 */
export function SmartInput({
    inputRef,
    value,
    isRecording,
    isTranscribing,
    isAnalyzing,
    onChange,
    onSubmit,
    onToggleRecording,
    children,
}) {
    const isLoadingState = isAnalyzing || isTranscribing;
    const showSendButton = value && !isRecording && !isLoadingState;
    const showMicButton = !value && !isLoadingState;

    return (
        <form
            onSubmit={onSubmit}
            className={`relative flex items-center bg-gray-800 border border-gray-700 rounded-2xl p-2 transition-all duration-300 shadow-xl ${isRecording
                    ? "border-violet-500/50 shadow-violet-500/20"
                    : isTranscribing
                        ? "border-blue-500/40 shadow-blue-500/10"
                        : "hover:border-gray-600 focus-within:border-gray-500"
                }`}
        >
            {/* Ícone de prefixo */}
            <div className="pl-4 pr-2 text-gray-400">
                <Plus className="w-5 h-5" />
            </div>

            {/* Campo de texto */}
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={isLoadingState || isRecording}
                placeholder={
                    isTranscribing
                        ? "🎙️ Transcrevendo áudio..."
                        : isAnalyzing
                            ? "✨ A IA está processando..."
                            : isRecording
                                ? "Ouvindo... (clique no mic para parar)"
                                : "Digite uma tarefa ou delegue com '@'..."
                }
                className="flex-1 bg-transparent border-none text-gray-100 placeholder-gray-500 text-lg focus:ring-0 px-2 h-14 w-full outline-none disabled:opacity-50"
            />

            {/* Ações à direita */}
            <div className="flex items-center gap-2 pr-2">
                {/* Ondas sonoras animadas durante a gravação */}
                {isRecording && (
                    <div className="flex items-center gap-[3px] px-2 h-8 mr-1">
                        {WAVE_BARS.map((heightPct, i) => (
                            <div
                                key={i}
                                className="w-1 bg-violet-400 rounded-full animate-wave"
                                style={{
                                    height: `${heightPct}%`,
                                    animationDelay: `${i * 0.15}s`,
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Botão de envio (quando há texto) */}
                {showSendButton && (
                    <button
                        type="submit"
                        className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                )}

                {/* Spinner quando IA ou transcrição está processando */}
                {isLoadingState && (
                    <div className={`p-3 animate-spin ${isTranscribing ? "text-blue-400" : "text-violet-400"}`}>
                        <Loader2 className="w-6 h-6" />
                    </div>
                )}

                {/* Botão de microfone (Feature 3) */}
                {showMicButton && (
                    <button
                        type="button"
                        onClick={onToggleRecording}
                        title={isRecording ? "Parar gravação" : "Gravar por voz"}
                        className={`p-3 rounded-xl transition-all ${isRecording
                                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 animate-pulse"
                                : "text-gray-500 hover:text-violet-400 hover:bg-violet-500/10"
                            }`}
                    >
                        {isRecording ? (
                            <MicOff className="w-5 h-5" />
                        ) : (
                            <Mic className="w-5 h-5" />
                        )}
                    </button>
                )}
            </div>

            {/* Slot para o MentionMenu (posicionado pelo pai) */}
            {children}
        </form>
    );
}
