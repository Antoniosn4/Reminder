// =============================================================
//  useProjects.js
//  Custom Hook — Gerenciamento CRUD de projetos com sub-projetos.
//  Persistência via localStorage.
//  Seed automático com projetos padrão quando vazio.
// =============================================================

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "reminder-custom-projects";

/** Projetos padrão — seed inicial quando localStorage está vazio. */
const DEFAULT_PROJECTS = [
    {
        id: "frontend",
        label: "Frontend",
        color: "#3b82f6",
        subProjects: [
            { id: "frontend_ds", label: "Design System" },
            { id: "frontend_comp", label: "Componentes" },
        ],
    },
    {
        id: "reunioes",
        label: "Reuniões",
        color: "#8b5cf6",
        subProjects: [{ id: "reunioes_daily", label: "Daily" }],
    },
    {
        id: "marketing",
        label: "Marketing",
        color: "#ec4899",
        subProjects: [{ id: "marketing_ads", label: "Ads" }],
    },
    {
        id: "infra",
        label: "Infra",
        color: "#f97316",
        subProjects: [],
    },
];

/** Paleta de cores premium harmonizadas para novos projetos. */
const PROJECT_COLORS = [
    "#3b82f6", "#8b5cf6", "#ec4899", "#f97316",
    "#10b981", "#eab308", "#ef4444", "#06b6d4",
];

function loadProjects() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_PROJECTS;
        const parsed = JSON.parse(raw);
        return parsed.length > 0 ? parsed : DEFAULT_PROJECTS;
    } catch {
        return DEFAULT_PROJECTS;
    }
}

function persistProjects(projects) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

/**
 * @returns {{
 *   projects: Array<{ id: string, label: string, color: string, subProjects: Array }>,
 *   addProject: (proj: { label: string, color: string }) => void,
 *   updateProject: (id: string, updates: object) => void,
 *   removeProject: (id: string) => void,
 * }}
 */
export function useProjects() {
    const [projects, setProjects] = useState(loadProjects);

    // Persiste sempre que a lista muda
    useEffect(() => {
        persistProjects(projects);
    }, [projects]);

    const addProject = useCallback((proj) => {
        if (!proj?.label?.trim()) return;
        const trimmed = proj.label.trim();
        setProjects((prev) => {
            if (prev.some((p) => p.label.toLowerCase() === trimmed.toLowerCase())) return prev;
            const color = proj.color || PROJECT_COLORS[prev.length % PROJECT_COLORS.length];
            return [
                ...prev,
                {
                    id: trimmed.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now(),
                    label: trimmed,
                    color,
                    subProjects: [],
                },
            ];
        });
    }, []);

    const updateProject = useCallback((id, updates) => {
        setProjects((prev) =>
            prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
        );
    }, []);

    const removeProject = useCallback((id) => {
        setProjects((prev) => prev.filter((p) => p.id !== id));
    }, []);

    return { projects, addProject, updateProject, removeProject };
}
