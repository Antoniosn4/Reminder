// =============================================================
//  SidebarProjectFolder.jsx
//  Pasta de projeto expansível com sub-projetos aninhados.
//  Estilo atualizado: ring ativo, bolinha indicadora, animação grid.
// =============================================================

import React from "react";
import { ChevronRight, ChevronDown, Hash } from "lucide-react";

/**
 * @param {{
 *   color: string,
 *   label: string,
 *   isExpanded: boolean,
 *   onToggle: () => void,
 *   onRoute: () => void,
 *   active: boolean,
 *   children?: React.ReactNode
 * }} props
 */
export function SidebarProjectFolder({ color, label, isExpanded, onToggle, onRoute, active, children }) {
    const hasChildren = React.Children.count(children) > 0;

    return (
        <div className="mb-0.5">
            <div
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                    active
                        ? "bg-gray-700/80 text-white shadow-sm ring-1 ring-gray-600/50"
                        : "hover:bg-gray-700/40 text-gray-400 hover:text-gray-200"
                }`}
            >
                {/* Toggle chevron */}
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        if (hasChildren) onToggle();
                    }}
                    className={`flex items-center justify-center w-5 h-5 rounded-md transition-colors ${
                        hasChildren
                            ? "hover:bg-gray-600/80 cursor-pointer"
                            : "opacity-0 cursor-default"
                    }`}
                >
                    {hasChildren
                        ? isExpanded
                            ? <ChevronDown className="w-3.5 h-3.5" />
                            : <ChevronRight className="w-3.5 h-3.5" />
                        : null}
                </div>

                {/* Label clicável */}
                <div className="flex items-center gap-2 flex-1" onClick={onRoute}>
                    <Hash className="w-4 h-4 flex-shrink-0" style={{ color }} />
                    <span className="text-[14px] font-medium truncate select-none leading-none pt-[1px]">
                        {label}
                    </span>
                </div>
            </div>

            {/* Sub-pastas com animação */}
            <div
                className={`grid transition-all duration-300 ease-out ${
                    isExpanded && hasChildren
                        ? "grid-rows-[1fr] opacity-100 mt-0.5"
                        : "grid-rows-[0fr] opacity-0"
                }`}
            >
                <div className="overflow-hidden">
                    <div className="ml-[18px] pl-3.5 border-l-[1.5px] border-gray-700/60 space-y-0.5 py-1">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * @param {{ label: string, active: boolean, onClick: () => void }} props
 */
export function SidebarSubProject({ label, active, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-lg cursor-pointer transition-colors select-none ${
                active
                    ? "bg-gray-700/60 text-white shadow-sm ring-1 ring-gray-600/30"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/30"
            }`}
        >
            <div
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    active ? "bg-violet-400" : "bg-gray-600 group-hover:bg-gray-500"
                }`}
            />
            <span className="text-[13px] font-medium leading-none pt-[1px]">{label}</span>
        </div>
    );
}
