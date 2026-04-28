// =============================================================
//  useTasks.js
//  Custom Hook — Gerenciamento de estado e lógica de negócio das tarefas.
//  Responsabilidade: CRUD de tarefas, hidratação do IndexedDB e
//  integração com a IA via geminiService.
// =============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { callGemini } from "../services/geminiService";
import { getAllTasks, saveAllTasks } from "../services/storageService";
import { syncTask, deleteCalendarEvent } from "../services/calendarService";

// ----- Schemas de resposta Gemini -----

const TASK_PARSE_SCHEMA = {
    type: "OBJECT",
    properties: {
        title: { type: "STRING", description: "O título principal da tarefa, limpo e conciso." },
        date: { type: "STRING", description: "A data da tarefa no formato ISO YYYY-MM-DD. Se o usuário diz 'hoje', use a data de hoje. Se diz 'amanhã', calcule o dia seguinte. Se não mencionar data, use a data de hoje." },
        time: { type: "STRING", description: "O horário da tarefa no formato HH:MM (24h). Se não houver horário, use 'Sem horário'." },
        project: { type: "STRING", description: "O projeto lógico para essa tarefa, escolhido da lista fornecida." },
        projectColor: {
            type: "STRING",
            description: "Uma cor hexadecimal (ex: '#3b82f6', '#10b981', '#8b5cf6').",
        },
        priority: {
            type: "STRING",
            description: "Nível de prioridade: 'urgent' se contém palavras como 'urgente'/'emergência', 'high' se 'importante'/'prioridade alta', 'low' se 'baixa prioridade'/'quando puder', 'normal' para o resto.",
        },
    },
    required: ["title", "date", "time", "project", "projectColor", "priority"],
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

// ----- Fallback -----

/**
 * Cria um objeto de tarefa básico a partir do texto puro.
 * Usado quando o Gemini está offline ou retorna null.
 */
function buildFallbackTask(cleanText) {
    return {
        title: cleanText,
        date: new Date().toISOString().split("T")[0],
        time: "Sem horário",
        project: "Entrada",
        projectColor: "#6b7280",
        priority: "normal",
    };
}

// ----- Hook -----

export function useTasks() {
    const [tasks, setTasks] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
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

    const updateTask = useCallback((id, updates) => {
        setTasks((prev) =>
            prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
        );
    }, []);

    const toggleTask = useCallback((id) => {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === id ? { ...task, completed: !task.completed } : task
            )
        );
    }, []);

    const deleteTask = useCallback(async (id) => {
        setTasks((prev) => {
            const task = prev.find((t) => t.id === id);
            if (task?.gcalEventId) deleteCalendarEvent(task.gcalEventId);
            return prev.filter((t) => t.id !== id);
        });
    }, []);

    const updateTaskAndSync = useCallback((id, updates) => {
        setTasks((prev) => {
            const updated = prev.map((task) =>
                task.id === id ? { ...task, ...updates } : task
            );
            if ("title" in updates || "time" in updates) {
                const target = updated.find((t) => t.id === id);
                if (target) syncTask(target);
            }
            return updated;
        });
    }, []);

    /**
     * Interpreta o texto via Gemini e adiciona a nova tarefa.
     *
     * Garantias de persistência:
     *   1. Se o Gemini falhar, o fallback OBRIGATÓRIO cria a tarefa com o texto bruto.
     *   2. `isAnalyzing` É SEMPRE resetado para false via finally — nunca trava o input.
     *   3. Auto-submit de voz usa a mesma função com as mesmas garantias.
     *
     * @param {string} rawText   - Texto bruto do usuário.
     * @param {object|null} assignee - Membro @mencionado.
     */
    const addTaskFromText = useCallback(
        async (rawText, assignee = null, projectNames = []) => {
            if (!rawText.trim()) return;

            setIsAnalyzing(true);

            const cleanText = rawText.replace(/@\w+/g, "").trim();

            // Monta lista de projetos disponíveis para o prompt
            const defaultProjects = ["Entrada", "Frontend", "Reuniões", "Marketing", "Infra", "Ideias de Produto"];
            const allProjects = [...new Set([...defaultProjects, ...projectNames])];
            const projectList = allProjects.join(", ");

            const today = new Date().toISOString().split("T")[0];
            const dayOfWeek = new Date().toLocaleDateString("pt-BR", { weekday: "long" });

            const prompt = `Você é um assistente de produtividade. Analise a tarefa abaixo e extraia informações estruturadas.

Data de hoje: ${today} (${dayOfWeek}).
Projetos disponíveis: ${projectList}.

Regras:
- "title": crie um título limpo e conciso para a tarefa.
- "date": calcule a data real no formato YYYY-MM-DD. "Hoje" = ${today}. "Amanhã" = dia seguinte. "Segunda" = próxima segunda-feira. Se não mencionar data, use ${today}.
- "time": extraia o horário no formato HH:MM. Ex: "às 10 horas" = "10:00". Se não houver horário, use "Sem horário".
- "project": associe ao projeto mais adequado da lista.
- "projectColor": escolha uma cor hex harmoniosa.

Entrada do usuário: "${cleanText}"`;

            let taskData;
            try {
                const parsedData = await callGemini(prompt, TASK_PARSE_SCHEMA);

                if (parsedData !== null) {
                    // ✅ IA funcionou — usa dados enriquecidos
                    taskData = parsedData;
                } else {
                    // ⚠️ IA falhou — fallback obrigatório (tarefa NUNCA é perdida)
                    console.warn("[useTasks] Gemini retornou null — usando fallback local.");
                    toast.error("Sem IA: tarefa salva com dados básicos. Verifique o servidor.", {
                        duration: 4000,
                    });
                    taskData = buildFallbackTask(cleanText);
                }
            } catch (err) {
                // Segurança extra — callGemini não lança, mas cobrimos qualquer edge case
                console.error("[useTasks] Erro inesperado:", err);
                toast.error("Erro inesperado. Tarefa salva com dados básicos.");
                taskData = buildFallbackTask(cleanText);
            } finally {
                // SEMPRE reseta o estado de loading — nunca trava o input
                setIsAnalyzing(false);
            }

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

            // Sincronização com GCal (fire-and-forget — não bloqueia UI)
            syncTask(newTask).then((eventId) => {
                updateTask(newTask.id, {
                    syncStatus: "synced",
                    gcalEventId: eventId ?? null,
                });
            });
        },
        [updateTask]
    );

    const generateSubtasks = useCallback(async (taskId, taskTitle) => {
        const prompt = `Crie um plano com 3 passos essenciais curtos para: "${taskTitle}".`;
        const subtasks = await callGemini(prompt, SUBTASK_SCHEMA);
        if (subtasks) updateTask(taskId, { subtasks });
        return subtasks;
    }, [updateTask]);

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
