// =============================================================
//  useTeams.js
//  Custom Hook — Gerenciamento CRUD de equipes.
//  Persistência via localStorage.
// =============================================================

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "reminder-teams";

/** Equipes padrão — seed inicial. */
const DEFAULT_TEAMS = [
    { id: "team_marketing", name: "Marketing Q4", members: 4 },
    { id: "team_design", name: "Design System", members: 2 },
    { id: "team_dev", name: "Desenvolvimento", members: 6 },
];

function loadTeams() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_TEAMS;
        const parsed = JSON.parse(raw);
        return parsed.length > 0 ? parsed : DEFAULT_TEAMS;
    } catch {
        return DEFAULT_TEAMS;
    }
}

function persistTeams(teams) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
}

/**
 * @returns {{
 *   teams: Array<{ id: string, name: string, members: number }>,
 *   addTeam: (team: { name: string, members: number }) => void,
 *   updateTeam: (id: string, updates: object) => void,
 *   deleteTeam: (id: string) => void,
 * }}
 */
export function useTeams() {
    const [teams, setTeams] = useState(loadTeams);

    useEffect(() => {
        persistTeams(teams);
    }, [teams]);

    const addTeam = useCallback((team) => {
        if (!team?.name?.trim()) return;
        setTeams((prev) => [
            ...prev,
            {
                id: "team_" + Date.now(),
                name: team.name.trim(),
                members: Number(team.members) || 2,
            },
        ]);
    }, []);

    const updateTeam = useCallback((id, updates) => {
        setTeams((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
        );
    }, []);

    const deleteTeam = useCallback((id) => {
        setTeams((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return { teams, addTeam, updateTeam, deleteTeam };
}
