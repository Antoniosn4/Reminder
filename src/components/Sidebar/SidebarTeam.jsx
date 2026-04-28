// =============================================================
//  SidebarTeam.jsx
//  Item de equipe com avatares empilhados na sidebar.
// =============================================================

import { Users } from "lucide-react";

/**
 * @param {{
 *   teamName: string,
 *   members: number,
 *   active?: boolean,
 *   onClick?: () => void
 * }} props
 */
export function SidebarTeam({ teamName, members, active = false, onClick }) {
    const MAX_VISIBLE_AVATARS = 3;
    const visibleCount = Math.min(members, MAX_VISIBLE_AVATARS);
    const overflowCount = members - MAX_VISIBLE_AVATARS;

    return (
        <div
            onClick={onClick}
            className={`flex items-center justify-between px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${active
                    ? "bg-gray-700 text-white shadow-sm"
                    : "hover:bg-gray-700/50 text-gray-400 hover:text-gray-200"
                }`}
        >
            <div className="flex items-center gap-3">
                <Users className={`w-4 h-4 ${active ? "text-white" : "text-gray-500"}`} />
                <span className="text-sm">{teamName}</span>
            </div>

            <div className="flex items-center -space-x-1.5">
                {Array.from({ length: visibleCount }).map((_, i) => (
                    <div
                        key={i}
                        className="w-5 h-5 rounded-full border border-gray-800 bg-gray-700 flex items-center justify-center overflow-hidden"
                    >
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${teamName}${i}&backgroundColor=transparent`}
                            alt="Member"
                            className="w-full h-full opacity-80"
                        />
                    </div>
                ))}
                {overflowCount > 0 && (
                    <span className="w-5 h-5 rounded-full border border-gray-800 bg-gray-700 text-[8px] flex items-center justify-center font-bold">
                        +{overflowCount}
                    </span>
                )}
            </div>
        </div>
    );
}
