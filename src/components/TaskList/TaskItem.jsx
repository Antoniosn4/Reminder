// =============================================================
//  TaskItem.jsx
//  Componente de uma tarefa individual com suporte a subtarefas geradas por IA.
// =============================================================

import { useState, useCallback } from "react";
import {
    CheckCircle2,
    Circle,
    Sparkles,
    Loader2,
    Hash,
    MoreHorizontal,
    RefreshCw,
    CalendarCheck,
} from "lucide-react";
import { SubtaskList } from "./SubtaskList";

/**
 * @param {{
 *   task: object,
 *   onToggleTask: (id: number) => void,
 *   onUpdateTask: (id: number, updates: object) => void,
 *   onGenerateSubtasks: (id: number, title: string) => Promise<any>,
 *   onToggleSubtask: (taskId: number, index: number) => void
 * }} props
 */
export function TaskItem({
    task,
    onToggleTask,
    onUpdateTask,
    onGenerateSubtasks,
    onToggleSubtask,
}) {
    const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);
    const [showSubtasks, setShowSubtasks] = useState(false);

    const hasSubtasks = task.subtasks?.length > 0;
    const isSyncing = task.syncStatus === "pending";

    const handleSubtaskToggle = useCallback(
        (index) => onToggleSubtask(task.id, index),
        [task.id, onToggleSubtask]
    );

    const handleGenerateSubtasks = useCallback(
        async (e) => {
            e.stopPropagation();

            // Se já existem subtarefas, apenas alterna a visibilidade
            if (hasSubtasks) {
                setShowSubtasks((prev) => !prev);
                return;
            }

            setIsGeneratingSubtasks(true);
            setShowSubtasks(true);

            const result = await onGenerateSubtasks(task.id, task.title);

            if (!result) {
                setShowSubtasks(false);
            }
            setIsGeneratingSubtasks(false);
        },
        [hasSubtasks, task.id, task.title, onGenerateSubtasks]
    );

    const completedSubtasksCount = task.subtasks?.filter((s) => s.completed).length ?? 0;

    return (
        <div className="flex flex-col gap-2">
            {/* Card principal da tarefa */}
            <div
                className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ease-out
          ${task.completed
                        ? "bg-gray-900/50 border-gray-800/50 scale-[0.98] opacity-70"
                        : "bg-gray-800 border-gray-700 hover:border-gray-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
                    }
        `}
            >
                {/* Conteúdo esquerdo: checkbox + título + metadados */}
                <div className="flex items-center gap-4 flex-1">
                    <button
                        onClick={() => onToggleTask(task.id)}
                        className={`relative flex items-center justify-center transition-all duration-300 active:scale-90
                            ${task.completed
                                ? "text-emerald-500 scale-110"
                                : "text-gray-500 hover:text-violet-400 hover:scale-110"
                            }`}
                    >
                        {task.completed ? (
                            <CheckCircle2 className="w-6 h-6" />
                        ) : (
                            <Circle className="w-6 h-6" />
                        )}
                    </button>

                    <div
                        className="flex flex-col flex-1 cursor-pointer overflow-hidden"
                        onClick={() => onToggleTask(task.id)}
                    >
                        {/* Wrapper posicionado para conter o pseudo-risco animado */}
                        <div className="relative w-fit max-w-full">
                            <span
                                className={`text-base font-medium block truncate transition-colors duration-300
                                    ${task.completed ? "text-gray-500" : "text-gray-200"}`}
                            >
                                {task.title}
                            </span>
                            {/* Linha de risco animada (desenha da esquerda para direita) */}
                            <span
                                className={`absolute left-0 top-1/2 -mt-px h-[1.5px] w-full bg-gray-500
                                    transition-transform duration-300 ease-out origin-left
                                    ${task.completed ? "scale-x-100" : "scale-x-0"}`}
                            />
                        </div>

                        {/* Metadados: projeto, horário, progresso de subtarefas */}
                        <div className="flex items-center gap-3 mt-1.5">
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                                <Hash className="w-3 h-3" style={{ color: task.projectColor }} />
                                {task.project}
                            </span>

                            <span
                                className={`text-[11px] font-medium px-2 py-0.5 rounded-md bg-gray-900 border transition-colors duration-300
                                    ${task.completed ? "border-gray-800 text-gray-600" : "border-gray-700 text-gray-400"}`}
                            >
                                {task.time}
                            </span>

                            {hasSubtasks && (
                                <span
                                    className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border transition-colors duration-300
                                        ${task.completed
                                            ? "text-gray-500 bg-gray-800 border-gray-700"
                                            : "text-violet-400 bg-violet-500/10 border-violet-500/20"}`}
                                >
                                    <Sparkles className="w-3 h-3" />
                                    {completedSubtasksCount}/{task.subtasks.length}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Ações direita: IA + mais opções + status de sincronização */}
                <div className="flex items-center gap-4">
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-opacity">
                        {!task.completed && (
                            <button
                                onClick={handleGenerateSubtasks}
                                title="✨ Quebrar em passos com IA"
                                className="flex items-center gap-1 text-xs font-medium text-violet-400 hover:bg-violet-500/10 px-2 py-1.5 rounded-lg transition-colors mr-2"
                            >
                                {isGeneratingSubtasks ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <Sparkles className="w-3.5 h-3.5" />
                                )}
                            </button>
                        )}
                        <button className="text-gray-500 hover:text-white p-1">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>

                    <div title={isSyncing ? "Sincronizando..." : "Sincronizado"}>
                        {isSyncing ? (
                            <RefreshCw className={`w-4 h-4 animate-spin ${task.completed ? "text-gray-600" : "text-gray-500"}`} />
                        ) : (
                            <CalendarCheck className={`w-4 h-4 transition-colors duration-300 ${task.completed ? "text-gray-600" : "text-gray-500"}`} />
                        )}
                    </div>
                </div>
            </div>

            {/* Painel de subtarefas (visível sob demanda) */}
            {showSubtasks && (
                <SubtaskList
                    isLoading={isGeneratingSubtasks}
                    subtasks={task.subtasks}
                    onToggleSubtask={handleSubtaskToggle}
                />
            )}
        </div>
    );
}
