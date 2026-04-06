// =============================================================
//  SidebarTeam.jsx
//  Item de equipe com avatares empilhados na sidebar.
// =============================================================

/**
 * @param {{ teamName: string, members: number }} props
 */
export function SidebarTeam({ teamName, members }) {
    const MAX_VISIBLE_AVATARS = 3;
    const visibleCount = Math.min(members, MAX_VISIBLE_AVATARS);
    const overflowCount = members - MAX_VISIBLE_AVATARS;

    return (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg cursor-pointer hover:bg-gray-700/50 text-gray-400 hover:text-gray-200 transition-colors">
            <div className="flex items-center gap-3">
                {/* Users icon importado no componente pai (Sidebar.jsx) via prop ou aqui diretamente */}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span className="text-sm">{teamName}</span>
            </div>

            <div className="flex items-center -space-x-1.5">
                {[...Array(visibleCount)].map((_, i) => (
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
