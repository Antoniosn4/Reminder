// =============================================================
//  CalendarView.jsx
//  View do calendário mensal com tarefas plotadas nos dias.
// =============================================================

import { ChevronRight } from "lucide-react";

const DAYS_OF_WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
// Outubro 2026 começa numa quinta (4 dias de padding para Dom-Qua)
const PADDING_COUNT = 4;
const DAYS_IN_MONTH = 31;

/**
 * @param {{ tasks: import("../../hooks/useTasks").Task[] }} props
 */
export function CalendarView({ tasks }) {
    const paddedDays = [
        ...Array(PADDING_COUNT).fill(null),
        ...Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1),
    ];

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in duration-300">
            {/* Cabeçalho dos dias da semana */}
            <div className="grid grid-cols-7 border-b border-gray-700 bg-gray-900/50">
                {DAYS_OF_WEEK.map((day) => (
                    <div
                        key={day}
                        className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Grade de dias */}
            <div className="grid grid-cols-7 bg-gray-700 gap-px">
                {paddedDays.map((day, idx) => {
                    const isToday = day === 24;
                    const dateStr = day ? `2026-10-${String(day).padStart(2, "0")}` : null;
                    const dayTasks = dateStr
                        ? tasks.filter((t) => t.date === dateStr)
                        : [];

                    return (
                        <div
                            key={idx}
                            className={`min-h-[140px] bg-gray-900 p-2 transition-colors hover:bg-gray-800/80 group ${isToday ? "bg-gray-800/30" : ""
                                }`}
                        >
                            {day && (
                                <div className="flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-2">
                                        <span
                                            className={`text-sm font-semibold flex items-center justify-center w-7 h-7 rounded-full ${isToday
                                                    ? "bg-violet-500 text-white"
                                                    : "text-gray-400 group-hover:text-gray-200"
                                                }`}
                                        >
                                            {day}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto hide-scrollbar">
                                        {dayTasks.map((task) => (
                                            <div
                                                key={task.id}
                                                className="px-2 py-1.5 rounded-md border text-[11px] font-medium leading-tight truncate cursor-pointer transition-transform hover:-translate-y-px"
                                                style={{
                                                    backgroundColor: `${task.projectColor}15`,
                                                    borderColor: `${task.projectColor}30`,
                                                    color: task.projectColor,
                                                }}
                                                title={task.title}
                                            >
                                                <span className="opacity-80 mr-1">{task.time}</span>
                                                {task.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
