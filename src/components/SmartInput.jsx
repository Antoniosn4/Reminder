// =============================================================
//  SmartInput.jsx
//  Campo de entrada inteligente com suporte a NLP, gravação e @mention.
//  Features 3 (Dictation) e 5 (Colaboração).
// =============================================================

import { Plus, Send, Loader2 } from "lucide-react";

/** Alturas relativas de cada barra de onda — definidas uma vez para estabilidade. */
const WAVE_BARS = [60, 100, 45, 85, 55];

/**
 * @param {{
 *   inputRef: React.RefObject<HTMLInputElement>,
 *   value: string,
 *   isRecording: boolean,
 *   isAnalyzing: boolean,
 *   onChange: (value: string) => void,
 *   onSubmit: (e: React.FormEvent) => void,
 *   children?: React.ReactNode  // slot para o MentionMenu posicionado externamente
 * }} props
 */
export function SmartInput({
    inputRef,
    value,
    isRecording,
    isAnalyzing,
    onChange,
    onSubmit,
    children,
}) {
    const showSendButton = value && !isRecording && !isAnalyzing;

    return (
        <form
            onSubmit={onSubmit}
            className={`relative flex items-center bg-gray-800 border border-gray-700 rounded-2xl p-2 transition-all duration-300 shadow-xl ${isRecording
                    ? "border-violet-500/50 shadow-violet-500/20"
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
                disabled={isAnalyzing || isRecording}
                placeholder={
                    isAnalyzing
                        ? "✨ A IA está processando..."
                        : "Digite uma tarefa ou delegue com '@'..."
                }
                className="flex-1 bg-transparent border-none text-gray-100 placeholder-gray-500 text-lg focus:ring-0 px-2 h-14 w-full outline-none disabled:opacity-50"
            />

            {/* Ações à direita */}
            <div className="flex items-center gap-2 pr-2">
                {/* Feature 3: Ondas sonoras animadas durante a gravação */}
                {isRecording && (
                    <div className="flex items-center gap-[3px] px-2 h-8 mr-2">
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

                {isRecording && (
                    <span className="text-red-400 text-sm font-medium animate-pulse pr-2">
                        Ouvindo...
                    </span>
                )}

                {showSendButton && (
                    <button
                        type="submit"
                        className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                )}

                {isAnalyzing && (
                    <div className="p-3 text-violet-400 animate-spin">
                        <Loader2 className="w-6 h-6" />
                    </div>
                )}
            </div>

            {/* Slot para o MentionMenu (posicionado pelo pai) */}
            {children}
        </form>
    );
}

