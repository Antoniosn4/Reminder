// =============================================================
//  Sidebar.jsx
//  Componente da barra lateral completa.
//  Coordena todos os sub-componentes de navegação.
// =============================================================

import { Mic, Settings, Plus, Search, Inbox, Sun, Calendar, Star, Pill, Droplet, Clock } from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import { SidebarSectionTitle } from "./SidebarSectionTitle";
import { SidebarProject } from "./SidebarProject";
import { SidebarTeam } from "./SidebarTeam";
import { SidebarRoutine } from "./SidebarRoutine";

// ----- Dados estáticos da sidebar (mock) -----

const FAVORITE_ITEMS = [
    { label: "Prioridade Alta" },
    { label: "Ideias de Produto" },
];

const PROJECTS = [
    { color: "#3b82f6", label: "Frontend" },
    { color: "#8b5cf6", label: "Reuniões" },
    { color: "#f97316", label: "Infra" },
    { color: "#10b981", label: "Pessoal" },
];

const TEAMS = [
    { teamName: "Marketing Q4", members: 4 },
    { teamName: "Design System", members: 2 },
    { teamName: "Desenvolvimento", members: 6 },
];

const ROUTINES = [
    { icon: <Pill className="w-4 h-4 text-rose-400" />, label: "Tomar remédio", time: "08:00" },
    { icon: <Droplet className="w-4 h-4 text-cyan-400" />, label: "Beber água", time: "10:00" },
    { icon: <Clock className="w-4 h-4 text-amber-400" />, label: "Pausa para os olhos", time: "15:00" },
];

// ----- Componente -----

/**
 * @param {{
 *   isRecording: boolean,
 *   onToggleRecording: () => void
 * }} props
 */
export function Sidebar({ isRecording, onToggleRecording }) {
    return (
        <aside className="w-72 bg-gray-800 border-r border-gray-700 flex flex-col flex-shrink-0 relative z-10 shadow-2xl">

            {/* Navegação principal */}
            <nav className="p-4 space-y-1 flex-1 overflow-y-auto custom-scrollbar">

                {/* Ações rápidas */}
                <div className="mb-6">
                    <SidebarItem icon={<Plus />} label="Nova tarefa" textColor="text-violet-400" />
                    <SidebarItem icon={<Search />} label="Busca" />
                    <SidebarItem icon={<Inbox />} label="Entrada" badge="3" />
                </div>

                {/* Visões de tempo */}
                <div className="pt-2 pb-2">
                    <SidebarItem icon={<Sun />} label="Hoje" active />
                    <SidebarItem icon={<Calendar />} label="Calendário" />
                </div>

                {/* Favoritos */}
                <div className="pt-6">
                    <SidebarSectionTitle title="Favoritos" />
                    {FAVORITE_ITEMS.map(({ label }) => (
                        <SidebarItem
                            key={label}
                            icon={<Star className="w-4 h-4 text-yellow-500" />}
                            label={label}
                            textColor="text-gray-300"
                        />
                    ))}
                </div>

                {/* Projetos */}
                <div className="pt-6">
                    <div className="flex items-center justify-between px-3 mb-2 group cursor-pointer">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-gray-400 transition-colors">
                            Meus Projetos
                        </h4>
                        <Plus className="w-4 h-4 text-gray-500 hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {PROJECTS.map((project) => (
                        <SidebarProject key={project.label} {...project} />
                    ))}
                </div>

                {/* Equipe */}
                <div className="pt-6 pb-4">
                    <SidebarSectionTitle title="Equipe" />
                    {TEAMS.map((team) => (
                        <SidebarTeam key={team.teamName} {...team} />
                    ))}
                </div>

                {/* Rotina */}
                <div className="pt-2 pb-6">
                    <div className="flex items-center justify-between px-3 mb-2 group cursor-pointer">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-gray-400 transition-colors">
                            Rotina
                        </h4>
                        <Plus className="w-4 h-4 text-gray-500 hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {ROUTINES.map((routine) => (
                        <SidebarRoutine key={routine.label} {...routine} />
                    ))}
                </div>
            </nav>

            {/* Rodapé: perfil do usuário + controles */}
            <footer className="p-4 bg-gray-900 border-t border-gray-700 flex items-center justify-between">
                {/* Avatar + info do usuário */}
                <div className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-500 to-emerald-400 p-[2px]">
                            <img
                                src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=transparent"
                                alt="User"
                                className="w-full h-full rounded-full bg-gray-800"
                            />
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-gray-900 rounded-full" />
                    </div>
                    <div className="flex flex-col group-hover:opacity-80 transition-opacity">
                        <h3 className="text-sm font-semibold text-gray-100">Engenheiro Pro</h3>
                        <p className="text-xs text-gray-500">Plano Ultimate</p>
                    </div>
                </div>

                {/* Ações: microfone + configurações */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={onToggleRecording}
                        title="Gravar Áudio"
                        className={`p-2 rounded-lg transition-all duration-300 ${isRecording
                                ? "bg-red-500/20 text-red-500 animate-pulse"
                                : "text-gray-400 hover:text-violet-400 hover:bg-gray-800"
                            }`}
                    >
                        <Mic className="w-5 h-5" />
                    </button>
                    <button
                        title="Configurações"
                        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </footer>
        </aside>
    );
}
