// =============================================================
//  App.jsx
//  Componente raiz — orquestra a UI e conecta os hooks de negócio.
//  Responsabilidade única: composição da tela, sem lógica de domínio.
// =============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { BarChart2, CalendarCheck, CalendarX, Loader2 } from "lucide-react";

import { useTasks } from "./hooks/useTasks";
import { useVoiceRecording } from "./hooks/useVoiceRecording";
import { useMention, extractMentionedMember } from "./hooks/useMention";

import { Sidebar } from "./components/Sidebar/Sidebar";
import { SmartInput } from "./components/SmartInput";
import { MentionMenu } from "./components/MentionMenu";
import { ProactiveAgent } from "./components/ProactiveAgent";
import { WeeklyReportModal } from "./components/WeeklyReportModal";
import { TaskItem } from "./components/TaskList/TaskItem";
import { getCalendarStatus, connectCalendar } from "./services/calendarService";

export default function App() {
    const {
        tasks,
        isAnalyzing,
        addTaskFromText,
        toggleTask,
        updateTask,
        deleteTask,
        generateSubtasks,
        toggleSubtask,
    } = useTasks();

    // ----- Estado do input e gravação -----
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef(null);
    const { isRecording, isTranscribing, toggleRecording } = useVoiceRecording(setInputValue);

    // ----- Feature 5: @mention -----
    const { isMenuOpen, handleInputChange, selectMember, closeMenu } =
        useMention(inputValue, setInputValue, inputRef);

    // ----- Google Calendar: status + conexão -----
    const [calendarConnected, setCalendarConnected] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);

    // Verifica status no mount; faz polling a cada 3s enquanto aguardando autorização
    useEffect(() => {
        let interval;
        let timeoutId;

        async function checkStatus() {
            const connected = await getCalendarStatus();
            setCalendarConnected(connected);
            if (connected) {
                // Autenticado: para tudo
                setIsConnecting(false);
                clearInterval(interval);
                clearTimeout(timeoutId);
            }
        }

        checkStatus();

        if (isConnecting) {
            interval = setInterval(checkStatus, 3000);
            // Safety timeout: se o usuário não autorizar em 5min, reseta
            timeoutId = setTimeout(() => {
                clearInterval(interval);
                setIsConnecting(false);
            }, 5 * 60 * 1000);
        }

        return () => {
            clearInterval(interval);
            clearTimeout(timeoutId);
        };
    }, [isConnecting]);

    const handleConnectCalendar = useCallback(async () => {
        setIsConnecting(true);
        await connectCalendar();
    }, []);

    // ----- Feature 1: Agente proativo -----
    const [showProactiveBox, setShowProactiveBox] = useState(true);

    // ----- Feature 4: Resumo semanal -----
    const [showWeeklyReport, setShowWeeklyReport] = useState(false);

    // ----- Listas derivadas -----
    const pendingTasks = tasks.filter((t) => !t.completed);
    const completedTasks = tasks.filter((t) => t.completed);

    // ----- Handlers -----

    /** Submete o input: extrai o assignee mencionado antes de enviar para a IA. */
    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            const assignee = extractMentionedMember(inputValue);
            await addTaskFromText(inputValue, assignee);
            setInputValue("");
            closeMenu();
        },
        [inputValue, addTaskFromText, closeMenu]
    );

    return (
        <div className="flex h-screen bg-gray-900 text-gray-200 font-sans overflow-hidden selection:bg-violet-500/30">

            {/* =================== SIDEBAR =================== */}
            <Sidebar isRecording={isRecording} onToggleRecording={toggleRecording} />

            {/* =================== CONTEÚDO PRINCIPAL =================== */}
            <main className="flex-1 flex flex-col relative overflow-hidden bg-gray-900">

                {/* Cabeçalho */}
                <header className="px-10 pt-12 pb-6 flex items-end justify-between max-w-5xl mx-auto w-full">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        Hoje{" "}
                        <span className="text-sm font-medium text-gray-400 bg-gray-800 px-3 py-1 rounded-full mt-2 border border-gray-700">
                            Seg, 24 Out
                        </span>
                    </h1>
                    <div className="flex items-center gap-3">
                        {/* Feature 4: Botão de Resumo Semanal */}
                        <button
                            onClick={() => setShowWeeklyReport(true)}
                            className="flex items-center gap-2 text-xs font-semibold text-violet-400 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-700 transition-colors"
                        >
                            <BarChart2 className="w-4 h-4" /> Resumo
                        </button>
                        {/* Botão de status / conexão do Google Calendar */}
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
                                {isConnecting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <CalendarX className="w-4 h-4" />
                                )}
                                {isConnecting ? "Aguardando autorização..." : "Conectar Google"}
                            </button>
                        )}
                    </div>
                </header>

                {/* Campo de entrada inteligente + Feature 5 (MentionMenu) */}
                <div className="px-10 pb-8 max-w-5xl mx-auto w-full z-30 relative">
                    <SmartInput
                        inputRef={inputRef}
                        value={inputValue}
                        isRecording={isRecording}
                        isTranscribing={isTranscribing}
                        isAnalyzing={isAnalyzing}
                        onChange={handleInputChange}
                        onSubmit={handleSubmit}
                        onToggleRecording={toggleRecording}
                    >
                        {/* Feature 5: Menu flutuante de @mention renderizado como filho */}
                        <MentionMenu isOpen={isMenuOpen} onSelect={selectMember} />
                    </SmartInput>
                </div>

                {/* Lista de tarefas */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-10 pb-20 max-w-5xl mx-auto w-full">

                    {/* Feature 1: Agente proativo descartável */}
                    {showProactiveBox && (
                        <ProactiveAgent
                            message="Você tem uma reunião amanhã. Quer criar um"
                            actionLabel="rascunho de pauta?"
                            onAction={() => setShowProactiveBox(false)}
                            onDismiss={() => setShowProactiveBox(false)}
                        />
                    )}

                    {/* Tarefas pendentes */}
                    <div className="space-y-3">
                        {pendingTasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onToggleTask={toggleTask}
                                onUpdateTask={updateTask}
                                onDeleteTask={deleteTask}
                                onGenerateSubtasks={generateSubtasks}
                                onToggleSubtask={toggleSubtask}
                            />
                        ))}
                    </div>

                    {/* Seção de concluídas */}
                    {completedTasks.length > 0 && (
                        <div className="mt-10">
                            <h3 className="text-sm font-semibold text-gray-500 border-b border-gray-800 pb-2 mb-4">
                                Concluídas
                            </h3>
                            <div className="space-y-3 opacity-60 hover:opacity-100 transition-opacity">
                                {completedTasks.map((task) => (
                                    <TaskItem
                                        key={task.id}
                                        task={task}
                                        onToggleTask={toggleTask}
                                        onUpdateTask={updateTask}
                                        onDeleteTask={deleteTask}
                                        onGenerateSubtasks={generateSubtasks}
                                        onToggleSubtask={toggleSubtask}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Feature 4: Modal de Resumo Semanal */}
            <WeeklyReportModal
                isOpen={showWeeklyReport}
                onClose={() => setShowWeeklyReport(false)}
            />

            {/* Estilos globais: scrollbar + animação de onda (Feature 3) */}
            <style dangerouslySetInnerHTML={{
                __html: `
          @keyframes wave {
            0%, 100% { transform: scaleY(0.4); opacity: 0.6; }
            50%       { transform: scaleY(1);   opacity: 1;   }
          }
          .animate-wave { animation: wave 1s ease-in-out infinite; }
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #4b5563; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #6b7280; }
        `
            }} />
        </div>
    );
}

