// =============================================================
//  SidebarProject.jsx
//  Item de projeto colorido na sidebar.
// =============================================================

import { Hash } from "lucide-react";

/**
 * @param {{ color: string, label: string }} props
 */
export function SidebarProject({ color, label }) {
    return (
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-gray-700/50 text-gray-400 hover:text-gray-200 transition-colors">
            <Hash className="w-4 h-4" style={{ color }} />
            <span className="text-sm">{label}</span>
        </div>
    );
}
