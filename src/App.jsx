// =============================================================
//  App.jsx
//  Componente raiz — orquestra a UI e conecta os hooks de negócio.
//  Responsabilidade única: composição da tela e roteamento de views.
// =============================================================

import { useState, useRef, useCallback, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
    BarChart2, CalendarCheck, CalendarX, Loader2,
    CheckCircle2, Star, Users, Pill, Droplet, Sparkles,
    ChevronLeft, ChevronRight, X,
} from "lucide-react";

// Hooks de domínio
import { useTasks } from "./hooks/useTasks";
import { useNavigation } from "./hooks/useNavigation";
import { useVoiceRecording } from "./hooks/useVoiceRecording";
import { useMention, extractMentionedMember } from "./hooks/useMention";
import { useProjects } from "./hooks/useProjects";
import { useTeams } from "./hooks/useTeams";
import { useRoutines } from "./hooks/useRoutines";

// Componentes de layout
import { Sidebar } from "./components/Sidebar/Sidebar";
import { SmartInput } from "./components/SmartInput";
import { MentionMenu } from "./components/MentionMenu";
import { ProactiveAgent } from "./components/ProactiveAgent";
import { WeeklyReportModal } from "./components/WeeklyReportModal";
import { SearchModal } from "./components/SearchModal";
import { QuickAddModal } from "./components/QuickAddModal";
import { TaskItem } from "./components/TaskList/TaskItem";

// Views
import { CalendarView } from "./components/views/CalendarView";
import { SettingsView } from "./components/views/SettingsView";
import { TeamMarketingView, TeamDesignView, TeamDevView } from "./components/views/TeamView";
import { RoutineVitaminasView, RoutineAguaView } from "./components/views/RoutineView";
import { PrioritiesView } from "./components/views/PrioritiesView";
import { GenericTeamView } from "./components/views/GenericTeamView";
import { GenericRoutineView } from "./components/views/GenericRoutineView";

// Modais CRUD
import { TaskEditModal } from "./components/modals/TaskEditModal";
import { NewProjectModal, EditProjectModal } from "./components/modals/ProjectModals";
import { NewTeamModal, EditTeamModal } from "./components/modals/TeamModals";
import { NewRoutineModal, EditRoutineModal } from "./components/modals/RoutineModals";

// Serviços
import { getCalendarStatus, connectCalendar } from "./services/calendarService";


// ── Helpers ─────────────────────────────────────────────────────────

/** Retorna data atual formatada em pt-BR, ex: "Seg, 21 Abr" */
function getFormattedDate() {
    return new Date().toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "numeric",
        month: "short",
    }).replace(/\.$/, "");
}

/** Filtra as tarefas com base na view ativa — usa dados dinâmicos */
function filterTasksByView(tasks, filter, projects) {
    switch (filter) {
        case "hoje": return tasks.filter((t) => t.date === new Date().toISOString().split("T")[0]);
        case "entrada": return tasks.filter((t) => t.project === "Entrada");
        case "ideias_produto": return tasks.filter((t) => t.project === "Ideias de Produto");
        default: {
            // Dynamic project / sub-project matching
            for (const proj of projects) {
                if (proj.id === filter) {
                    return tasks.filter((t) => t.project === proj.label);
                }
                for (const sub of (proj.subProjects || [])) {
                    if (sub.id === filter) {
                        return tasks.filter((t) => t.subProject === sub.label);
                    }
                }
            }
            return tasks;
        }
    }
}

// ── Componente Principal ─────────────────────────────────────────────

export default function App() {
    // Hooks de domínio
    const { tasks, isAnalyzing, addTaskFromText, toggleTask, updateTask, deleteTask, generateSubtasks, toggleSubtask } = useTasks();
    const { projects, addProject, updateProject, removeProject } = useProjects();
    const { teams, addTeam, updateTeam, deleteTeam } = useTeams();
    const { routines, addRoutine, updateRoutine, deleteRoutine } = useRoutines();
    const { activeView, navigate, viewTitle, viewType, viewFilter } = useNavigation("hoje", projects, teams, routines);

    // Input e gravação de voz
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef(null);

    // handleAddTask é definido após useTasks — referência antecipada via ref
    const addTaskRef = useRef(null);
    const handleTranscribed = useCallback((text) => {
        if (addTaskRef.current) addTaskRef.current(text);
    }, []);

    const { isRecording, isTranscribing, elapsedTime, toggleRecording, cancelRecording, mediaStream } =
        useVoiceRecording(setInputValue, handleTranscribed);
    const { isMenuOpen, handleInputChange, selectMember, closeMenu } = useMention(inputValue, setInputValue, inputRef);

    // Google Calendar
    const [calendarConnected, setCalendarConnected] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        let interval;
        let timeoutId;

        async function checkStatus() {
            const connected = await getCalendarStatus();
            setCalendarConnected(connected);
            if (connected) {
                setIsConnecting(false);
                clearInterval(interval);
                clearTimeout(timeoutId);
            }
        }

        checkStatus();

        if (isConnecting) {
            interval = setInterval(checkStatus, 3000);
            timeoutId = setTimeout(() => {
                clearInterval(interval);
                setIsConnecting(false);
            }, 5 * 60 * 1000);
        }

        return () => { clearInterval(interval); clearTimeout(timeoutId); };
    }, [isConnecting]);

    const handleConnectCalendar = useCallback(async () => {
        setIsConnecting(true);
        await connectCalendar();
    }, []);

    // ── UI state: modais e panels ──
    const [showProactiveBox, setShowProactiveBox] = useState(true);
    const [showWeeklyReport, setShowWeeklyReport] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

    // CRUD modais state
    const [editingTask, setEditingTask] = useState(null);
    const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [isNewTeamOpen, setIsNewTeamOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [isNewRoutineOpen, setIsNewRoutineOpen] = useState(false);
    const [editingRoutine, setEditingRoutine] = useState(null);

    // Handler de submit (texto/voz)
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        const assignee = extractMentionedMember(inputValue);
        const projectNames = projects.map((p) => p.label);
        await addTaskFromText(inputValue, assignee, projectNames);
        setInputValue("");
        closeMenu();
        toast.success("✅ Tarefa criada", { duration: 2000 });
    }, [inputValue, addTaskFromText, closeMenu, projects]);

    // Registra a referência do auto-submit para o callback de voz
    addTaskRef.current = async (text) => {
        if (!text?.trim()) return;
        const assignee = extractMentionedMember(text);
        const projectNames = projects.map((p) => p.label);
        await addTaskFromText(text, assignee, projectNames);
        setInputValue("");
        toast.success("✅ Auto-salva via Voz", { duration: 3000 });
    };

    // ── Handlers de CRUD modais ──
    const handleTaskEditSave = useCallback((id, updates) => {
        updateTask(id, updates);
        setEditingTask(null);
        toast.success("Tarefa atualizada", { duration: 2000 });
    }, [updateTask]);

    const handleTaskEditDelete = useCallback((id) => {
        deleteTask(id);
        setEditingTask(null);
        toast.success("Tarefa excluída", { duration: 2000 });
    }, [deleteTask]);

    const handleNewProject = useCallback((proj) => {
        addProject(proj);
        setIsNewProjectOpen(false);
        toast.success(`Projeto "${proj.label}" criado`, { duration: 2000 });
    }, [addProject]);

    const handleEditProjectSave = useCallback((id, updates) => {
        updateProject(id, updates);
        setEditingProject(null);
        toast.success("Projeto atualizado", { duration: 2000 });
    }, [updateProject]);

    const handleDeleteProject = useCallback((id) => {
        removeProject(id);
        setEditingProject(null);
        navigate("hoje");
        toast.success("Projeto excluído", { duration: 2000 });
    }, [removeProject, navigate]);

    const handleNewTeam = useCallback((team) => {
        addTeam(team);
        setIsNewTeamOpen(false);
        toast.success(`Equipe "${team.name}" criada`, { duration: 2000 });
    }, [addTeam]);

    const handleEditTeamSave = useCallback((id, updates) => {
        updateTeam(id, updates);
        setEditingTeam(null);
        toast.success("Equipe atualizada", { duration: 2000 });
    }, [updateTeam]);

    const handleDeleteTeam = useCallback((id) => {
        deleteTeam(id);
        setEditingTeam(null);
        navigate("hoje");
        toast.success("Equipe excluída", { duration: 2000 });
    }, [deleteTeam, navigate]);

    const handleNewRoutine = useCallback((routine) => {
        addRoutine(routine);
        setIsNewRoutineOpen(false);
        toast.success(`Rotina "${routine.label}" criada`, { duration: 2000 });
    }, [addRoutine]);

    const handleEditRoutineSave = useCallback((id, updates) => {
        updateRoutine(id, updates);
        setEditingRoutine(null);
        toast.success("Rotina atualizada", { duration: 2000 });
    }, [updateRoutine]);

    const handleDeleteRoutine = useCallback((id) => {
        deleteRoutine(id);
        setEditingRoutine(null);
        navigate("hoje");
        toast.success("Rotina excluída", { duration: 2000 });
    }, [deleteRoutine, navigate]);

    // ── Dados derivados ──
    const filteredTasks = viewFilter ? filterTasksByView(tasks, viewFilter, projects) : [];
    const pendingTasks = filteredTasks.filter((t) => !t.completed);
    const completedTasks = filteredTasks.filter((t) => t.completed);
    const inboxCount = tasks.filter((t) => t.project === "Entrada" && !t.completed).length;

    const taskHandlers = {
        onToggleTask: toggleTask,
        onUpdateTask: updateTask,
        onDeleteTask: deleteTask,
        onGenerateSubtasks: generateSubtasks,
        onToggleSubtask: toggleSubtask,
        onEditTask: setEditingTask,
    };

    // Resolve header icon based on active view
    const resolveHeaderIcon = () => {
        if (activeView === "ideias_produto") return <Star className="w-8 h-8 text-yellow-500" />;
        const team = teams.find((t) => t.id === activeView);
        if (team) return <Users className="w-8 h-8 text-gray-400" />;
        const routine = routines.find((r) => r.id === activeView);
        if (routine) return null; // Routine views have their own icons
        return null;
    };

    // Resolve known team/routine for dedicated views
    const KNOWN_TEAM_VIEWS = { team_marketing: TeamMarketingView, team_design: TeamDesignView, team_dev: TeamDevView };
    const KNOWN_ROUTINE_VIEWS = { routine_vitaminas: RoutineVitaminasView, routine_agua: RoutineAguaView };

    return (
        <div className="flex h-screen bg-gray-900 text-gray-200 font-sans overflow-hidden selection:bg-violet-500/30">

            {/* =================== SIDEBAR =================== */}
            <Sidebar
                activeView={activeView}
                onNavigate={navigate}
                isRecording={isRecording}
                onToggleRecording={toggleRecording}
                onQuickAdd={() => setIsQuickAddOpen(true)}
                onSearch={() => setIsSearchOpen(true)}
                taskCount={inboxCount}
                projects={projects}
                teams={teams}
                routines={routines}
                onAddProject={() => setIsNewProjectOpen(true)}
                onAddTeam={() => setIsNewTeamOpen(true)}
                onAddRoutine={() => setIsNewRoutineOpen(true)}
            />

            {/* =================== CONTEÚDO PRINCIPAL =================== */}
            <main className="flex-1 flex flex-col relative overflow-hidden bg-gray-900">

                {/* Cabeçalho dinâmico */}
                <header className="px-10 pt-12 pb-6 flex items-end justify-between max-w-5xl mx-auto w-full flex-shrink-0">
                    <div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                            {resolveHeaderIcon()}
                            {viewTitle}
                            {activeView === "hoje" && (
                                <span className="text-sm font-medium text-gray-400 bg-gray-800 px-3 py-1 rounded-full mt-2 border border-gray-700">
                                    {getFormattedDate()}
                                </span>
                            )}
                            {activeView === "settings" && (
                                <span className="text-sm font-medium text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full mt-2 border border-violet-500/20">
                                    Pro
                                </span>
                            )}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Navegação de mês no calendário */}
                        {activeView === "calendario" && (
                            <div className="flex gap-1">
                                <button className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-md border border-gray-700 text-gray-400 hover:text-white">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-md border border-gray-700 text-gray-400 hover:text-white">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {/* Resumo semanal e status do GCal (omitido em settings e rotinas) */}
                        {activeView !== "settings" && !activeView.startsWith("routine_") && (
                            <>
                                <button
                                    onClick={() => setShowWeeklyReport(true)}
                                    className="flex items-center gap-2 text-xs font-semibold text-violet-400 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-700 transition-colors"
                                >
                                    <BarChart2 className="w-4 h-4" /> Resumo
                                </button>

                                {calendarConnected === null ? (
                                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Verificando...
                                    </div>
                                ) : calendarConnected ? (
                                    <div className="flex items-center gap-2 text-xs text-emerald-400 bg-gray-800 px-3 py-1.5 rounded-lg border border-emerald-800/50">
                                        <CalendarCheck className="w-4 h-4" /> GCal Conectado
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleConnectCalendar}
                                        disabled={isConnecting}
                                        className="flex items-center gap-2 text-xs font-semibold text-amber-400 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg border border-amber-800/50 transition-colors disabled:opacity-60"
                                    >
                                        {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarX className="w-4 h-4" />}
                                        {isConnecting ? "Aguardando autorização..." : "Conectar Google"}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </header>

                {/* ============= ROUTER DE VIEWS ============= */}

                {/* Views de lista padrão */}
                {viewType === "standard" && (
                    <div className="flex-1 flex flex-col overflow-hidden w-full max-w-5xl mx-auto">
                        <div className="px-10 pb-6 w-full z-30 relative">
                            <SmartInput
                                inputRef={inputRef}
                                value={inputValue}
                                isRecording={isRecording}
                                isTranscribing={isTranscribing}
                                isAnalyzing={isAnalyzing}
                                elapsedTime={elapsedTime}
                                mediaStream={mediaStream}
                                onChange={handleInputChange}
                                onSubmit={handleSubmit}
                                onToggleRecording={toggleRecording}
                                onCancelRecording={cancelRecording}
                            >
                                <MentionMenu isOpen={isMenuOpen} onSelect={selectMember} />
                            </SmartInput>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar px-10 pb-20">
                            {activeView === "hoje" && showProactiveBox && (
                                <ProactiveAgent
                                    message="Você tem uma reunião amanhã. Quer criar um"
                                    actionLabel="rascunho de pauta?"
                                    onAction={() => setShowProactiveBox(false)}
                                    onDismiss={() => setShowProactiveBox(false)}
                                />
                            )}

                            {/* Tarefas pendentes */}
                            <div className="space-y-3">
                                {pendingTasks.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                                        <CheckCircle2 className="w-12 h-12 mb-3 opacity-20" />
                                        <p>Tudo limpo por aqui. Aproveite o momento!</p>
                                    </div>
                                ) : (
                                    pendingTasks.map((task) => (
                                        <TaskItem key={task.id} task={task} {...taskHandlers} />
                                    ))
                                )}
                            </div>

                            {/* Concluídas */}
                            {completedTasks.length > 0 && (
                                <div className="mt-10">
                                    <h3 className="text-sm font-semibold text-gray-500 border-b border-gray-800 pb-2 mb-4">
                                        Concluídas
                                    </h3>
                                    <div className="space-y-3 opacity-60 hover:opacity-100 transition-opacity duration-500">
                                        {completedTasks.map((task) => (
                                            <TaskItem key={task.id} task={task} {...taskHandlers} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* View: Prioridades */}
                {viewType === "priorities" && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-10 pb-20 w-full max-w-5xl mx-auto">
                        <PrioritiesView tasks={tasks} {...taskHandlers} />
                    </div>
                )}

                {/* View: Calendário */}
                {viewType === "calendar" && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-10 pb-20 w-full max-w-5xl mx-auto">
                        <CalendarView tasks={tasks} />
                    </div>
                )}

                {/* View: Configurações */}
                {viewType === "settings" && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-10 pb-20 w-full max-w-5xl mx-auto">
                        <SettingsView />
                    </div>
                )}

                {/* Views: Equipes (conhecidas) */}
                {viewType === "team" && (() => {
                    const KnownView = KNOWN_TEAM_VIEWS[activeView];
                    if (KnownView) {
                        return (
                            <div className="flex-1 overflow-y-auto custom-scrollbar px-10 pb-20 w-full max-w-5xl mx-auto">
                                <KnownView tasks={tasks} {...taskHandlers} />
                            </div>
                        );
                    }
                    // Generic team view for dynamically created teams
                    const team = teams.find((t) => t.id === activeView);
                    return (
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-10 pb-20 w-full max-w-5xl mx-auto">
                            <GenericTeamView team={team} />
                        </div>
                    );
                })()}

                {/* Views: Rotinas (conhecidas + genéricas) */}
                {viewType === "routine" && (() => {
                    const KnownView = KNOWN_ROUTINE_VIEWS[activeView];
                    if (KnownView) {
                        return (
                            <div className="flex-1 overflow-y-auto custom-scrollbar px-10 pb-20 w-full max-w-5xl mx-auto">
                                <KnownView />
                            </div>
                        );
                    }
                    // Generic routine view for dynamically created routines
                    const routine = routines.find((r) => r.id === activeView);
                    return (
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-10 pb-20 w-full max-w-5xl mx-auto">
                            <GenericRoutineView routine={routine} />
                        </div>
                    );
                })()}

            </main>

            {/* =================== MODAIS =================== */}
            <QuickAddModal
                isOpen={isQuickAddOpen}
                onClose={() => setIsQuickAddOpen(false)}
                inputRef={inputRef}
                inputValue={inputValue}
                isRecording={isRecording}
                isTranscribing={isTranscribing}
                isAnalyzing={isAnalyzing}
                elapsedTime={elapsedTime}
                mediaStream={mediaStream}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
                onToggleRecording={toggleRecording}
                onCancelRecording={cancelRecording}
            >
                <MentionMenu isOpen={isMenuOpen} onSelect={selectMember} />
            </QuickAddModal>

            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} tasks={tasks} onNavigate={navigate} />
            <WeeklyReportModal isOpen={showWeeklyReport} onClose={() => setShowWeeklyReport(false)} />

            {/* Task Edit Modal */}
            <TaskEditModal
                task={editingTask}
                onClose={() => setEditingTask(null)}
                onSave={handleTaskEditSave}
                onDelete={handleTaskEditDelete}
                projects={projects}
                onCreateNewProject={() => setIsNewProjectOpen(true)}
            />

            {/* Project Modals */}
            <NewProjectModal
                isOpen={isNewProjectOpen}
                onClose={() => setIsNewProjectOpen(false)}
                onAddProject={handleNewProject}
            />
            <EditProjectModal
                project={editingProject}
                onClose={() => setEditingProject(null)}
                onSave={handleEditProjectSave}
                onDelete={handleDeleteProject}
            />

            {/* Team Modals */}
            <NewTeamModal
                isOpen={isNewTeamOpen}
                onClose={() => setIsNewTeamOpen(false)}
                onAddTeam={handleNewTeam}
            />
            <EditTeamModal
                team={editingTeam}
                onClose={() => setEditingTeam(null)}
                onSave={handleEditTeamSave}
                onDelete={handleDeleteTeam}
            />

            {/* Routine Modals */}
            <NewRoutineModal
                isOpen={isNewRoutineOpen}
                onClose={() => setIsNewRoutineOpen(false)}
                onAddRoutine={handleNewRoutine}
            />
            <EditRoutineModal
                routine={editingRoutine}
                onClose={() => setEditingRoutine(null)}
                onSave={handleEditRoutineSave}
                onDelete={handleDeleteRoutine}
            />

            {/* Toast notifications */}
            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: { background: "#1f2937", color: "#f3f4f6", border: "1px solid #374151" },
                    error: { iconTheme: { primary: "#f87171", secondary: "#1f2937" } },
                }}
            />

            {/* Estilos globais */}
            <style dangerouslySetInnerHTML={{
                __html: `
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #4b5563; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #6b7280; }
          .hide-scrollbar::-webkit-scrollbar { display: none; }
        `
            }} />
        </div>
    );
}
