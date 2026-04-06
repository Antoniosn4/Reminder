// =============================================================
//  WeeklyReportModal.jsx
//  Modal de Revisão Semanal com distribuição de foco e insight da IA.
//  Feature 4 — Resumo Semanal.
// =============================================================

import { X, BarChart2, TrendingUp, Sparkles } from "lucide-react";

// ----- Dados mockados do relatório -----

const FOCUS_DISTRIBUTION = [
    { label: "Frontend", percentage: 73, color: "bg-blue-500" },
    { label: "Reuniões", percentage: 27, color: "bg-violet-500" },
];

const AI_INSIGHT =
    "Você foi muito focado em Frontend essa semana. Tarefas de Infra estão pendentes — considere delegar para o @Paulo na próxima semana.";

// ----- Sub-componente: Barra de progresso -----

function FocusBar({ label, percentage, color }) {
    return (
        <div>
            <div className="flex justify-between text-xs mb-1 text-gray-300">
                <span>{label}</span>
                <span>{percentage}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5">
                <div
                    className={`h-1.5 rounded-full ${color} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

// ----- Componente principal -----

/**
 * @param {{ isOpen: boolean, onClose: () => void }} props
 */
export function WeeklyReportModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Impede que cliques internos fechem o modal */}
            <div
                className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Cabeçalho */}
                <header className="p-5 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-violet-400" />
                        Revisão Semanal
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-300 transition-colors"
                        title="Fechar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </header>

                {/* Corpo */}
                <div className="p-6 space-y-6">
                    {/* Distribuição de foco */}
                    <section>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Distribuição de Foco
                        </h3>
                        <div className="space-y-3">
                            {FOCUS_DISTRIBUTION.map((item) => (
                                <FocusBar key={item.label} {...item} />
                            ))}
                        </div>
                    </section>

                    {/* Insight da IA */}
                    <section className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-sm font-bold text-gray-200">Insight da IA</h3>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">{AI_INSIGHT}</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
