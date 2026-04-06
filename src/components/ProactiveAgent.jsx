// =============================================================
//  ProactiveAgent.jsx
//  Caixa de sugestão proativa descartável no topo da lista de tarefas.
//  Feature 1 — Agente Proativo.
// =============================================================

import { Sparkles, X } from "lucide-react";

/**
 * @param {{
 *   message: string,
 *   actionLabel?: string,
 *   onAction?: () => void,
 *   onDismiss: () => void
 * }} props
 */
export function ProactiveAgent({ message, actionLabel, onAction, onDismiss }) {
    return (
        <div className="mb-4 p-3 bg-gray-800/60 border border-gray-700 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-1.5 bg-violet-500/10 rounded-lg flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                </div>
                <p className="text-sm text-gray-300">
                    {message}
                    {actionLabel && onAction && (
                        <>
                            {" "}
                            <button
                                onClick={onAction}
                                className="text-violet-400 font-medium hover:underline"
                            >
                                {actionLabel}
                            </button>
                        </>
                    )}
                </p>
            </div>

            <button
                onClick={onDismiss}
                className="text-gray-500 hover:text-gray-400 transition-colors flex-shrink-0 ml-4"
                title="Dispensar"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
