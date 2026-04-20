// =============================================================
//  useTasks.js
//  Custom Hook — Gerenciamento de estado e lógica de negócio das tarefas.
//  Responsabilidade: CRUD de tarefas, hidratação do IndexedDB e
//  integração com a IA via geminiService.
// =============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { callGemini } from "../services/geminiService";
import { getAllTasks, saveAllTasks } from "../services/storageService";
import { syncTask, deleteCalendarEvent } from "../services/calendarService";
import { MOCK_TEAM } from "../constants/mockTeam";

// ----- Schemas de resposta Gemini -----

const TASK_PARSE_SCHEMA = {
    type: "OBJECT",
    properties: {
        title: { type: "STRING", description: "O título principal da tarefa." },
        time: { type: "STRING", description: "O horário ou data identificados." },
        project: { type: "STRING", description: "O projeto lógico para essa tarefa." },
        projectColor: {
            type: "STRING",
            description: "Uma cor hexadecimal (ex: '#3b82f6', '#10b981', '#8b5cf6').",
        },
    },
    required: ["title", "time", "project", "projectColor"],
};

const SUBTASK_SCHEMA = {
    type: "ARRAY",
    items: {
        type: "OBJECT",
        properties: {
            title: { type: "STRING", description: "Título descritivo da subtarefa." },
            completed: { type: "BOOLEAN", description: "Sempre enviar como false." },
        },
    },
};

// ----- Hook -----

export function useTasks() {
    const [tasks, setTasks] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    /**
     * Flag que indica se a hidratação inicial do IndexedDB já ocorreu.
     * Impede que o useEffect de persistência salve uma lista vazia
     * antes de os dados terem sido carregados.
     */
    const isHydrated = useRef(false);

    // ── Hidratação ──────────────────────────────────────────────────────────
    useEffect(() => {
        async function hydrate() {
            const stored = await getAllTasks();
            setTasks(stored);
            isHydrated.current = true;
        }
        hydrate();
    }, []);

    // ── Persistência ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isHydrated.current) return;
        saveAllTasks(tasks);
    }, [tasks]);

    // ── Operações de Estado ──────────────────────────────────────────────────

    /** Atualiza campos específicos de uma tarefa pelo seu id. */
    const updateTask = useCallback((id, updates) => {
        setTasks((prev) =>
            prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
        );
    }, []);

    /** Alterna o estado de conclusão de uma tarefa. */
    const toggleTask = useCallback((id) => {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === id ? { ...task, completed: !task.completed } : task
            )
        );
    }, []);

    /** Remove permanentemente uma tarefa pelo seu id. */
    const deleteTask = useCallback(async (id) => {
        // Busca o gcalEventId antes de remover do estado
        setTasks((prev) => {
            const task = prev.find((t) => t.id === id);
            if (task?.gcalEventId) {
                // Fire-and-forget: remove do GCal em background
                deleteCalendarEvent(task.gcalEventId);
            }
            return prev.filter((t) => t.id !== id);
        });
    }, []);

    /**
     * Atualiza campos específicos de uma tarefa E re-sincroniza com o Google Calendar
     * quando campos relevantes (title, time) são alterados.
     */
    const updateTaskAndSync = useCallback((id, updates) => {
        setTasks((prev) => {
            const updated = prev.map((task) =>
                task.id === id ? { ...task, ...updates } : task
            );
            // Se o update contém título ou horário, re-sincroniza com GCal
            if ("title" in updates || "time" in updates) {
                const target = updated.find((t) => t.id === id);
                if (target) {
                    syncTask(target); // Fire-and-forget (não precisamos do eventId aqui)
                }
            }
            return updated;
        });
    }, []);

    /**
     * Interpreta o texto em linguagem natural via Gemini e adiciona a nova tarefa.
     * Aceita um membro do time pré-resolvido via @mention (Feature 5).
     * Simula sincronização após 2,5s. Usa fallback local se a IA falhar.
     *
     * @param {string} rawText - Texto bruto digitado pelo usuário.
     * @param {import("../constants/mockTeam").TeamMember | null} [assignee] - Membro mencionado.
     */
    const addTaskFromText = useCallback(
        async (rawText, assignee = null) => {
            if (!rawText.trim() || isAnalyzing) return;

            setIsAnalyzing(true);

            // Remove as menções (@Nome) do texto antes de enviar para a IA
            const cleanText = rawText.replace(/@\w+/g, "").trim();

            const prompt = `Analise a seguinte tarefa natural digitada pelo usuário e estruture as informações extraídas. Entrada: "${cleanText}"`;
            const parsedData = await callGemini(prompt, TASK_PARSE_SCHEMA);

            const taskData = parsedData ?? {
                title: cleanText,
                time: "Hoje",
                project: "Entrada",
                projectColor: "#6b7280",
            };

            const newTask = {
                id: Date.now(),
                ...taskData,
                assignee,
                syncStatus: "pending",
                completed: false,
                subtasks: [],
                gcalEventId: null,
            };

            setTasks((prev) => [newTask, ...prev]);
            setIsAnalyzing(false);

            // Sincronização real com Google Calendar (fire-and-forget)
            syncTask(newTask).then((eventId) => {
                if (eventId) {
                    updateTask(newTask.id, { syncStatus: "synced", gcalEventId: eventId });
                } else {
                    updateTask(newTask.id, { syncStatus: "synced" });
                }
            });
        },
        [isAnalyzing, updateTask]
    );

    /**
     * Gera subtarefas para uma tarefa específica usando a IA.
     * Retorna null se a IA falhar.
     */
    const generateSubtasks = useCallback(async (taskId, taskTitle) => {
        const prompt = `Crie um plano com 3 passos essenciais curtos para: "${taskTitle}".`;
        const subtasks = await callGemini(prompt, SUBTASK_SCHEMA);

        if (subtasks) {
            updateTask(taskId, { subtasks });
        }
        return subtasks;
    }, [updateTask]);

    /** Alterna o estado de conclusão de uma subtarefa pelo índice. */
    const toggleSubtask = useCallback((taskId, subtaskIndex) => {
        setTasks((prev) =>
            prev.map((task) => {
                if (task.id !== taskId) return task;
                const updatedSubtasks = task.subtasks.map((sub, i) =>
                    i === subtaskIndex ? { ...sub, completed: !sub.completed } : sub
                );
                return { ...task, subtasks: updatedSubtasks };
            })
        );
    }, []);

    return {
        tasks,
        isAnalyzing,
        addTaskFromText,
        toggleTask,
        updateTask: updateTaskAndSync,
        deleteTask,
        generateSubtasks,
        toggleSubtask,
    };
}
