// =============================================================
//  useTasks.js
//  Custom Hook — Gerenciamento de estado e lógica de negócio das tarefas.
//  Responsabilidade: CRUD de tarefas e integração com a IA via geminiService.
// =============================================================

import { useState, useCallback } from "react";
import { callGemini } from "../services/geminiService";

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

// ----- Dados Iniciais (Mock) -----

const INITIAL_TASKS = [
    {
        id: 1,
        title: "Revisar PR do novo design system",
        time: "10:00",
        syncStatus: "synced",
        completed: false,
        project: "Frontend",
        projectColor: "#3b82f6",
    },
    {
        id: 2,
        title: "Call de alinhamento com a equipe de produto",
        time: "14:30",
        syncStatus: "pending",
        completed: false,
        project: "Reuniões",
        projectColor: "#8b5cf6",
    },
    {
        id: 3,
        title: "Aprovar orçamento da campanha Q4",
        time: "16:00",
        syncStatus: "synced",
        completed: false,
        project: "Marketing",
        projectColor: "#ec4899",
    },
    {
        id: 4,
        title: "Renovar assinatura do servidor AWS",
        time: "Amanhã",
        syncStatus: "synced",
        completed: true,
        project: "Infra",
        projectColor: "#f97316",
    },
];

// ----- Hook -----

export function useTasks() {
    const [tasks, setTasks] = useState(INITIAL_TASKS);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

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

    /**
     * Interpreta o texto em linguagem natural via Gemini e adiciona a nova tarefa.
     * Simula sincronização após 2,5s. Usa fallback local se a IA falhar.
     */
    const addTaskFromText = useCallback(
        async (rawText) => {
            if (!rawText.trim() || isAnalyzing) return;

            setIsAnalyzing(true);

            const prompt = `Analise a seguinte tarefa natural digitada pelo usuário e estruture as informações extraídas. Entrada: "${rawText}"`;
            const parsedData = await callGemini(prompt, TASK_PARSE_SCHEMA);

            const taskData = parsedData ?? {
                title: rawText,
                time: "Hoje",
                project: "Entrada",
                projectColor: "#6b7280",
            };

            const newTask = {
                id: Date.now(),
                ...taskData,
                syncStatus: "pending",
                completed: false,
                subtasks: [],
            };

            setTasks((prev) => [newTask, ...prev]);
            setIsAnalyzing(false);

            // Simula sincronização com calendário
            setTimeout(() => {
                updateTask(newTask.id, { syncStatus: "synced" });
            }, 2500);
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
        updateTask,
        generateSubtasks,
        toggleSubtask,
    };
}
