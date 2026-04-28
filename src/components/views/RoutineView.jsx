// =============================================================
//  RoutineView.jsx
//  Views de rotinas: Vitaminas e Hidratação.
//  Feature 2 — Rotina Adaptativa com histórico e insights da IA.
// =============================================================

import { useState } from "react";
import { Pill, Droplet, Flame, Sparkles, Activity, Check } from "lucide-react";

const WEEK_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

// =====================================================================
// Vitaminas
// =====================================================================

export function RoutineVitaminasView() {
    const [isDoneToday, setIsDoneToday] = useState(false);
    // histórico dos últimos 7 dias (último = hoje)
    const history = [true, true, true, false, true, true, isDoneToday];

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
            {/* Card principal */}
            <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-rose-500/20 blur-3xl pointer-events-none rounded-full" />

                <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-rose-500/10 z-10">
                    <Pill className="w-10 h-10 text-rose-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 z-10">Tomar vitaminas</h2>
                <p className="text-gray-400 text-sm mb-8 z-10">
                    Todos os dias às{" "}
                    <span className="text-gray-200 font-bold bg-gray-900 px-2 py-0.5 rounded border border-gray-700">
                        08:00
                    </span>
                </p>

                {/* Histórico da semana */}
                <div className="flex items-center gap-3 w-full justify-center mb-10 z-10">
                    {WEEK_DAYS.map((day, idx) => (
                        <div key={day} className="flex flex-col items-center gap-2">
                            <span className={`text-xs font-bold ${idx === 6 ? "text-rose-400" : "text-gray-500"}`}>
                                {day}
                            </span>
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${history[idx]
                                        ? "bg-rose-500 text-white shadow-md shadow-rose-500/30"
                                        : idx === 6
                                            ? "bg-gray-900 border-2 border-rose-500/50"
                                            : "bg-gray-900 border border-gray-700"
                                    }`}
                            >
                                {history[idx] && <Check className="w-5 h-5" />}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => setIsDoneToday((prev) => !prev)}
                    className={`w-full max-w-sm py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform active:scale-95 z-10 ${isDoneToday
                            ? "bg-gray-900 border border-gray-700 text-emerald-400 hover:border-gray-600"
                            : "bg-rose-500 hover:bg-rose-600 text-white shadow-xl shadow-rose-500/20"
                        }`}
                >
                    {isDoneToday ? "Concluído por hoje! ✓" : "Marcar como feito"}
                </button>
            </div>

            {/* Cards de stats + insight da IA */}
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center">
                    <Flame className="w-8 h-8 text-orange-400 mb-3" />
                    <span className="text-3xl font-extrabold text-white mb-1">15 dias</span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sua Ofensiva</span>
                </div>

                <div className="bg-gradient-to-br from-rose-500/10 to-gray-800 border border-rose-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <Sparkles className="absolute -right-2 -top-2 w-16 h-16 text-rose-500/10 pointer-events-none" />
                    <div className="flex items-center gap-2 mb-3">
                        <Activity className="w-4 h-4 text-rose-400" />
                        <h3 className="text-sm font-bold text-gray-200">Insight da IA</h3>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Você está indo muito bem! Percebi que nas quintas-feiras você costuma esquecer.
                        Ajustei um alerta mais forte para a próxima semana.
                    </p>
                </div>
            </div>
        </div>
    );
}

// =====================================================================
// Hidratação
// =====================================================================

const MAX_GLASSES = 8;

export function RoutineAguaView() {
    const [glasses, setGlasses] = useState(3);
    const percentage = (glasses / MAX_GLASSES) * 100;
    const isGoalReached = glasses >= MAX_GLASSES;

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
            <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
                {/* Barra de progresso de fundo */}
                <div
                    className="absolute bottom-0 left-0 w-full bg-cyan-500/10 transition-all duration-1000 ease-out z-0"
                    style={{ height: `${percentage}%` }}
                />

                <div className="z-10 w-full flex flex-col items-center">
                    <div className="w-20 h-20 bg-cyan-500/10 border border-cyan-500/20 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/10">
                        <Droplet className="w-10 h-10 text-cyan-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Hidratação Diária</h2>
                    <p className="text-gray-400 text-sm mb-8">
                        Meta: 2 litros ({MAX_GLASSES} copos)
                    </p>

                    {/* Indicador de copos */}
                    <div className="flex gap-2 mb-10">
                        {Array.from({ length: MAX_GLASSES }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-8 h-12 rounded-b-xl rounded-t-sm border-2 transition-all duration-300 ${i < glasses
                                        ? "bg-cyan-400 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                                        : "bg-gray-900 border-gray-700"
                                    }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => setGlasses((g) => Math.min(g + 1, MAX_GLASSES))}
                        disabled={isGoalReached}
                        className={`w-full max-w-sm py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform active:scale-95 ${isGoalReached
                                ? "bg-gray-900 border border-gray-700 text-emerald-400 cursor-default"
                                : "bg-cyan-500 hover:bg-cyan-400 text-gray-900 shadow-xl shadow-cyan-500/20"
                            }`}
                    >
                        {isGoalReached ? "Meta Atingida! 🎉" : "+ Registrar 1 Copo"}
                    </button>

                    {glasses > 0 && !isGoalReached && (
                        <button
                            onClick={() => setGlasses((g) => Math.max(g - 1, 0))}
                            className="mt-4 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                        >
                            Desfazer
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
