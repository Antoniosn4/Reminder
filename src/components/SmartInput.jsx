// =============================================================
//  SmartInput.jsx
//  Componente do campo de entrada inteligente com suporte a NLP e gravação de voz.
// =============================================================

import { useRef } from "react";
import { Plus, Send, Loader2 } from "lucide-react";

/**
 * @param {{
 *   value: string,
 *   isRecording: boolean,
 *   isAnalyzing: boolean,
 *   onChange: (value: string) => void,
 *   onSubmit: (e: React.FormEvent) => void
 * }} props
 */
export function SmartInput({ value, isRecording, isAnalyzing, onChange, onSubmit }) {
    const inputRef = useRef(null);

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
                disabled={isAnalyzing}
                placeholder={
                    isAnalyzing
                        ? "✨ A IA está processando sua tarefa..."
                        : "Digite uma tarefa ou use linguagem natural..."
                }
                className="flex-1 bg-transparent border-none text-gray-100 placeholder-gray-500 text-lg focus:ring-0 px-2 h-14 w-full outline-none disabled:opacity-50"
            />

            {/* Ações à direita */}
            <div className="flex items-center gap-2 pr-2">
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

                {isRecording && (
                    <div className="flex items-center gap-2 pr-4">
                        <div className="flex gap-1">
                            {[0, 150, 300].map((delay) => (
                                <span
                                    key={delay}
                                    className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"
                                    style={{ animationDelay: `${delay}ms` }}
                                />
                            ))}
                        </div>
                        <span className="text-red-400 text-sm font-medium animate-pulse">
                            Gravando...
                        </span>
                    </div>
                )}
            </div>
        </form>
    );
}
