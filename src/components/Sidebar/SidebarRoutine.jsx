// =============================================================
//  SidebarRoutine.jsx
//  Item de rotina com ícone customizável e horário.
// =============================================================

/**
 * @param {{ icon: React.ReactElement, label: string, time: string }} props
 */
export function SidebarRoutine({ icon, label, time }) {
    return (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg cursor-pointer hover:bg-gray-700/50 text-gray-400 hover:text-gray-200 transition-colors">
            <div className="flex items-center gap-3 truncate">
                {icon}
                <span className="text-sm truncate">{label}</span>
            </div>
            <span className="text-[10px] font-medium bg-gray-900 text-gray-400 px-1.5 py-0.5 rounded border border-gray-700 flex-shrink-0">
                {time}
            </span>
        </div>
    );
}
