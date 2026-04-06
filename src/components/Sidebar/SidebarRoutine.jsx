// =============================================================
//  SidebarRoutine.jsx
//  Item de rotina com ícone customizável, horário, streak e ajuste por IA.
//  Feature 2 — Rotina Adaptativa.
// =============================================================

import { Flame, Sparkles } from "lucide-react";

/**
 * @param {{
 *   icon: React.ReactElement,
 *   label: string,
 *   time: string,
 *   streak?: number,
 *   aiAdjusted?: boolean
 * }} props
 */
export function SidebarRoutine({ icon, label, time, streak = 0, aiAdjusted = false }) {
    return (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg cursor-pointer hover:bg-gray-700/50 text-gray-400 hover:text-gray-200 transition-colors">
            <div className="flex items-center gap-3 truncate">
                {icon}
                <span className="text-sm truncate">{label}</span>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
                {/* Badge de sequência (streak) */}
                {streak > 0 && (
                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-orange-400 bg-orange-400/10 px-1 rounded border border-orange-400/20">
                        <Flame className="w-2.5 h-2.5" />
                        {streak}
                    </span>
                )}

                {/* Badge de horário — verde se ajustado pela IA */}
                <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded border flex items-center gap-1 ${aiAdjusted
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-gray-900 border-gray-700 text-gray-400"
                        }`}
                    title={aiAdjusted ? "Horário ajustado pela IA" : undefined}
                >
                    {aiAdjusted && <Sparkles className="w-2.5 h-2.5" />}
                    {time}
                </span>
            </div>
        </div>
    );
}

