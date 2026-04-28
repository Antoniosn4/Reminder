// =============================================================
//  PrioritiesView.jsx
//  View que agrupa tarefas por nível de prioridade.
// =============================================================

import { AlertCircle, ArrowUp, Minus, ArrowDown, CheckCircle2 } from "lucide-react";
import { TaskItem } from "../TaskList/TaskItem";

const PRIORITY_GROUPS = [
    { id: "urgent", title: "Urgente", icon: <AlertCircle className="w-4 h-4" />, colorClass: "text-red-400" },
    { id: "high", title: "Prioridade Alta", icon: <ArrowUp className="w-4 h-4" />, colorClass: "text-orange-400" },
    { id: "normal", title: "Prioridade Média", icon: <Minus className="w-4 h-4" />, colorClass: "text-emerald-400" },
    { id: "low", title: "Prioridade Baixa", icon: <ArrowDown className="w-4 h-4" />, colorClass: "text-blue-400" },
];

export function PrioritiesView({ tasks, onEditTask, ...taskHandlers }) {
    const pendingTasks = tasks.filter((t) => !t.completed);

    return (
        <div className="pt-2">
            {PRIORITY_GROUPS.map(({ id, title, icon, colorClass }) => {
                const group = pendingTasks.filter((t) => (t.priority || "normal") === id);
                if (group.length === 0) return null;

                return (
                    <div key={id} className="mb-10 animate-in fade-in">
                        <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${colorClass} bg-gray-800/40 w-fit px-3 py-1.5 rounded-lg border border-gray-700/50`}>
                            {icon} {title}
                        </h3>
                        <div className="space-y-3">
                            {group.map((task) => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    onEditTask={onEditTask}
                                    {...taskHandlers}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}

            {pendingTasks.length === 0 && (
                <div className="text-center py-16 text-gray-500 flex flex-col items-center bg-gray-800/20 border border-dashed border-gray-700 rounded-2xl mt-8">
                    <CheckCircle2 className="w-12 h-12 mb-4 opacity-20" />
                    <h3 className="text-lg font-bold text-gray-400 mb-2">Tudo em dia!</h3>
                    <p className="text-sm max-w-md">Nenhuma prioridade pendente no momento.</p>
                </div>
            )}
        </div>
    );
}
