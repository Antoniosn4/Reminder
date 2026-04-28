// =============================================================
//  useRoutines.js
//  Custom Hook — Gerenciamento CRUD de rotinas inteligentes.
//  Persistência via localStorage.
// =============================================================

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "reminder-routines";

/** Rotinas padrão — seed inicial. */
const DEFAULT_ROUTINES = [
    { id: "routine_vitaminas", label: "Tomar vitaminas", time: "08:00", icon: "Pill", color: "text-rose-400", streak: 15, aiAdjusted: false },
    { id: "routine_agua", label: "Beber água", time: "10:00", icon: "Droplet", color: "text-cyan-400", streak: 5, aiAdjusted: false },
];

function loadRoutines() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_ROUTINES;
        const parsed = JSON.parse(raw);
        return parsed.length > 0 ? parsed : DEFAULT_ROUTINES;
    } catch {
        return DEFAULT_ROUTINES;
    }
}

function persistRoutines(routines) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(routines));
}

/**
 * @returns {{
 *   routines: Array<{ id: string, label: string, time: string, icon: string, color: string, streak: number, aiAdjusted: boolean }>,
 *   addRoutine: (routine: object) => void,
 *   updateRoutine: (id: string, updates: object) => void,
 *   deleteRoutine: (id: string) => void,
 * }}
 */
export function useRoutines() {
    const [routines, setRoutines] = useState(loadRoutines);

    useEffect(() => {
        persistRoutines(routines);
    }, [routines]);

    const addRoutine = useCallback((routine) => {
        if (!routine?.label?.trim()) return;
        setRoutines((prev) => [
            ...prev,
            {
                id: "routine_" + Date.now(),
                label: routine.label.trim(),
                time: routine.time || "08:00",
                icon: routine.icon || "CheckCircle2",
                color: routine.color || "text-violet-400",
                streak: 0,
                aiAdjusted: false,
            },
        ]);
    }, []);

    const updateRoutine = useCallback((id, updates) => {
        setRoutines((prev) =>
            prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
        );
    }, []);

    const deleteRoutine = useCallback((id) => {
        setRoutines((prev) => prev.filter((r) => r.id !== id));
    }, []);

    return { routines, addRoutine, updateRoutine, deleteRoutine };
}
