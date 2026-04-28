// =============================================================
//  SearchModal.jsx
//  Modal de busca global com filtragem em tempo real e atalhos.
//  Filtra tarefas pelo título, projeto, horário e data.
// =============================================================

import { useState, useEffect, useMemo, useRef } from "react";
import { Search, Hash, Circle, CheckCircle2, Calendar, Clock, X } from "lucide-react";

/**
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   tasks?: Array,
 *   onNavigate?: (view: string) => void
 * }} props
 */
export function SearchModal({ isOpen, onClose, tasks = [], onNavigate }) {
    const [query, setQuery] = useState("");
    const inputRef = useRef(null);

    // Fecha o modal ao pressionar ESC e foca input ao abrir
    useEffect(() => {
        if (!isOpen) return;
        setQuery("");
        setTimeout(() => inputRef.current?.focus(), 50);

        const handleKeyDown = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // Filtragem em tempo real
    const results = useMemo(() => {
        if (!query.trim()) return [];
        const q = query.toLowerCase();
        return tasks
            .filter((t) =>
                t.title?.toLowerCase().includes(q) ||
                t.project?.toLowerCase().includes(q) ||
                t.time?.toLowerCase().includes(q) ||
                t.date?.includes(q)
            )
            .slice(0, 10); // Limita a 10 resultados
    }, [query, tasks]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-[15vh] backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden shadow-black/50"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Barra de busca */}
                <div className="flex items-center px-4 border-b border-gray-700">
                    <Search className="w-6 h-6 text-gray-400 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar tarefas, projetos ou datas..."
                        className="w-full bg-transparent border-none text-xl text-gray-100 placeholder-gray-500 p-5 outline-none"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery("")}
                            className="p-1 hover:bg-gray-700 rounded-lg transition-colors mr-2"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    )}
                    <div className="text-xs text-gray-500 font-medium bg-gray-900 px-2 py-1 rounded border border-gray-700 flex-shrink-0">
                        ESC
                    </div>
                </div>

                {/* Resultados */}
                <div className="p-2 bg-gray-900/50 max-h-[50vh] overflow-y-auto custom-scrollbar">
                    {!query.trim() ? (
                        <p className="px-3 py-6 text-center text-sm text-gray-500">
                            Digite para buscar em {tasks.length} tarefa{tasks.length !== 1 ? "s" : ""}
                        </p>
                    ) : results.length === 0 ? (
                        <p className="px-3 py-6 text-center text-sm text-gray-500">
                            Nenhum resultado para "<span className="text-gray-400">{query}</span>"
                        </p>
                    ) : (
                        <>
                            <p className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                {results.length} resultado{results.length !== 1 ? "s" : ""}
                            </p>
                            {results.map((task) => (
                                <div
                                    key={task.id}
                                    className="px-3 py-3 hover:bg-gray-700 rounded-lg cursor-pointer flex items-center gap-3 transition-colors"
                                    onClick={() => {
                                        onClose();
                                    }}
                                >
                                    {/* Status */}
                                    {task.completed ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                    ) : (
                                        <Circle className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                    )}

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <span className={`text-sm font-medium block truncate ${task.completed ? "text-gray-500 line-through" : "text-gray-200"}`}>
                                            {task.title}
                                        </span>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="flex items-center gap-1 text-xs text-gray-400">
                                                <Hash className="w-3 h-3" style={{ color: task.projectColor }} />
                                                {task.project}
                                            </span>
                                            {task.date && (
                                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Calendar className="w-3 h-3" />
                                                    {task.date}
                                                </span>
                                            )}
                                            {task.time && task.time !== "Sem horário" && (
                                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Clock className="w-3 h-3" />
                                                    {task.time}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
