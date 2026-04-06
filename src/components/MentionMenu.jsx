// =============================================================
//  MentionMenu.jsx
//  Menu flutuante de @mention com lista de membros da equipe.
//  Feature 5 — Colaboração.
// =============================================================

import { MOCK_TEAM } from "../constants/mockTeam";

/**
 * @param {{
 *   isOpen: boolean,
 *   onSelect: (member: import("../constants/mockTeam").TeamMember) => void
 * }} props
 */
export function MentionMenu({ isOpen, onSelect }) {
    if (!isOpen) return null;

    return (
        <div className="absolute top-full left-14 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-1.5 z-40">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2 py-1">
                Equipe
            </p>
            {MOCK_TEAM.map((member) => (
                <button
                    key={member.id}
                    type="button"
                    onClick={() => onSelect(member)}
                    className="w-full flex items-center gap-2 p-2 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors text-left"
                >
                    <img
                        src={member.avatar}
                        className="w-5 h-5 rounded-full bg-gray-900"
                        alt={member.name}
                    />
                    <span className="text-gray-200 text-sm font-medium">{member.name}</span>
                </button>
            ))}
        </div>
    );
}
