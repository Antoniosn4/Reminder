// =============================================================
//  Sidebar.jsx
//  Barra lateral completa com navegação multi-view.
//  Totalmente dinâmica — projetos, equipes e rotinas vêm dos hooks.
// =============================================================

import { useState } from "react";
import {
    Mic, Settings, Plus, Search, Inbox, Sun, Calendar, Star,
    AlertCircle,
} from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import { SidebarSectionTitle } from "./SidebarSectionTitle";
import { SidebarProjectFolder, SidebarSubProject } from "./SidebarProjectFolder";
import { SidebarTeam } from "./SidebarTeam";
import { SidebarRoutine } from "./SidebarRoutine";
import { renderIcon } from "../../constants/renderIcon";

/**
 * @param {{
 *   activeView: string,
 *   onNavigate: (view: string) => void,
 *   isRecording: boolean,
 *   onToggleRecording: () => void,
 *   onQuickAdd: () => void,
 *   onSearch: () => void,
 *   taskCount: number,
 *   projects: Array,
 *   teams: Array,
 *   routines: Array,
 *   onAddProject: () => void,
 *   onAddTeam: () => void,
 *   onAddRoutine: () => void,
 * }} props
 */
export function Sidebar({
    activeView, onNavigate, isRecording, onToggleRecording,
    onQuickAdd, onSearch, taskCount,
    projects = [], teams = [], routines = [],
    onAddProject, onAddTeam, onAddRoutine,
}) {
    const [expandedFolders, setExpandedFolders] = useState({
        frontend: true, reunioes: false, marketing: false, infra: false,
    });

    const toggleFolder = (key) =>
        setExpandedFolders((prev) => ({ ...prev, [key]: !prev[key] }));

    return (
        <aside className="w-[280px] bg-gray-800 border-r border-gray-700 flex flex-col flex-shrink-0 relative z-10 shadow-2xl">

            <nav className="p-4 space-y-1 flex-1 overflow-y-auto custom-scrollbar pb-24">

                {/* Ações rápidas */}
                <div className="mb-6">
                    <SidebarItem icon={<Plus />} label="Nova tarefa" textColor="text-violet-400" onClick={onQuickAdd} />
                    <SidebarItem icon={<Search />} label="Busca" onClick={onSearch} />
                    <SidebarItem
                        icon={<Inbox />} label="Entrada"
                        badge={taskCount > 0 ? taskCount : null}
                        active={activeView === "entrada"}
                        onClick={() => onNavigate("entrada")}
                    />
                </div>

                {/* Visões de tempo */}
                <div className="pt-2 pb-2">
                    <SidebarItem icon={<Sun />} label="Hoje" active={activeView === "hoje"} onClick={() => onNavigate("hoje")} />
                    <SidebarItem icon={<Calendar />} label="Calendário" active={activeView === "calendario"} onClick={() => onNavigate("calendario")} />
                </div>

                {/* Filtros */}
                <div className="pt-6">
                    <SidebarSectionTitle title="Filtros" />
                    <SidebarItem
                        icon={<AlertCircle className="w-4 h-4 text-rose-500" />}
                        label="Prioridades"
                        active={activeView === "prioridades"}
                        onClick={() => onNavigate("prioridades")}
                    />
                    <SidebarItem
                        icon={<Star className="w-4 h-4 text-yellow-500" />}
                        label="Ideias de Produto"
                        active={activeView === "ideias_produto"}
                        onClick={() => onNavigate("ideias_produto")}
                    />
                </div>

                {/* Projetos dinâmicos */}
                <div className="pt-6">
                    <SidebarSectionTitle title="Meus Projetos" onAdd={onAddProject} />

                    {projects.map((proj) => (
                        <SidebarProjectFolder
                            key={proj.id}
                            color={proj.color}
                            label={proj.label}
                            isExpanded={!!expandedFolders[proj.id]}
                            onToggle={() => toggleFolder(proj.id)}
                            onRoute={() => onNavigate(proj.id)}
                            active={activeView === proj.id}
                        >
                            {proj.subProjects?.map((sub) => (
                                <SidebarSubProject
                                    key={sub.id}
                                    label={sub.label}
                                    active={activeView === sub.id}
                                    onClick={() => onNavigate(sub.id)}
                                />
                            ))}
                        </SidebarProjectFolder>
                    ))}
                </div>

                {/* Equipes dinâmicas */}
                <div className="pt-6 pb-2">
                    <SidebarSectionTitle title="Equipe" onAdd={onAddTeam} />
                    {teams.map((team) => (
                        <SidebarTeam
                            key={team.id}
                            teamName={team.name}
                            members={team.members}
                            active={activeView === team.id}
                            onClick={() => onNavigate(team.id)}
                        />
                    ))}
                </div>

                {/* Rotinas dinâmicas */}
                <div className="pt-4 pb-6">
                    <SidebarSectionTitle title="Rotina Inteligente" onAdd={onAddRoutine} />
                    {routines.map((routine) => (
                        <SidebarRoutine
                            key={routine.id}
                            icon={renderIcon(routine.icon, `w-4 h-4 ${routine.color}`)}
                            label={routine.label}
                            time={routine.time}
                            streak={routine.streak}
                            aiAdjusted={routine.aiAdjusted}
                            active={activeView === routine.id}
                            onClick={() => onNavigate(routine.id)}
                        />
                    ))}
                </div>
            </nav>

            {/* Rodapé Usuário */}
            <div className="p-4 bg-gray-900 border-t border-gray-700 flex items-center justify-between absolute bottom-0 w-full z-20">
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => onNavigate("settings")}
                >
                    <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-500 to-emerald-400 p-[2px]">
                            <img
                                src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=transparent"
                                alt="User"
                                className="w-full h-full rounded-full bg-gray-800 object-cover"
                            />
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-gray-900 rounded-full" />
                    </div>
                    <div className="flex flex-col group-hover:opacity-80 transition-opacity">
                        <h3 className="text-sm font-semibold text-gray-100">Engenheiro Pro</h3>
                        <p className="text-xs text-gray-500">Plano Ultimate</p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={onToggleRecording}
                        title="Gravar Áudio"
                        className={`p-2 rounded-lg transition-all duration-300 ${
                            isRecording
                                ? "bg-red-500/20 text-red-500 animate-pulse"
                                : "text-gray-400 hover:text-violet-400 hover:bg-gray-800"
                        }`}
                    >
                        <Mic className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onNavigate("settings")}
                        title="Configurações"
                        className={`p-2 rounded-lg transition-colors ${
                            activeView === "settings"
                                ? "text-violet-400 bg-gray-800"
                                : "text-gray-400 hover:text-white hover:bg-gray-800"
                        }`}
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
