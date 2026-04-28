// =============================================================
//  GenericRoutineView.jsx
//  View genérica para rotinas criadas dinamicamente pelo usuário.
//  Histórico semanal + botão de conclusão.
// =============================================================

import { useState } from "react";
import { Check } from "lucide-react";
import { renderIcon } from "../../constants/renderIcon";

const WEEK_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export function GenericRoutineView({ routine }) {
    if (!routine) return null;

    const [isDoneToday, setIsDoneToday] = useState(false);
    const history = [false, true, false, false, true, false, isDoneToday];

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
                <div className="w-20 h-20 bg-gray-900 border border-gray-700 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    {renderIcon(routine.icon, `w-10 h-10 ${routine.color}`)}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{routine.label}</h2>
                <p className="text-gray-400 text-sm mb-8">
                    Todos os dias às{" "}
                    <span className="text-gray-200 font-bold bg-gray-900 px-2 py-0.5 rounded border border-gray-700">
                        {routine.time}
                    </span>
                </p>

                {/* Histórico semanal */}
                <div className="flex items-center gap-3 w-full justify-center mb-10">
                    {WEEK_DAYS.map((day, idx) => (
                        <div key={day} className="flex flex-col items-center gap-2">
                            <span className={`text-xs font-bold ${idx === 6 ? routine.color : "text-gray-500"}`}>
                                {day}
                            </span>
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                    history[idx]
                                        ? `bg-gray-700 ${routine.color} shadow-md`
                                        : idx === 6
                                            ? "bg-gray-900 border-2 border-gray-600"
                                            : "bg-gray-900 border border-gray-700"
                                }`}
                            >
                                {history[idx] && <Check className="w-5 h-5" />}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => setIsDoneToday(!isDoneToday)}
                    className={`w-full max-w-sm py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform active:scale-95 ${
                        isDoneToday
                            ? "bg-gray-900 border border-gray-700 text-emerald-400"
                            : "bg-gray-700 hover:bg-gray-600 text-white shadow-xl"
                    }`}
                >
                    {isDoneToday ? "Concluído por hoje!" : "Marcar como feito"}
                </button>
            </div>
        </div>
    );
}
