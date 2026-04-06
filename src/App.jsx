// =============================================================
//  App.jsx
//  Componente raiz — orquestra a UI e conecta os hooks de negócio.
//  Responsabilidade única: composição da tela, sem lógica de domínio.
// =============================================================

import { useState, useRef, useCallback } from "react";
import { BarChart2, CalendarCheck } from "lucide-react";

import { useTasks } from "./hooks/useTasks";
import { useVoiceRecording } from "./hooks/useVoiceRecording";
import { useMention, extractMentionedMember } from "./hooks/useMention";

import { Sidebar } from "./components/Sidebar/Sidebar";
import { SmartInput } from "./components/SmartInput";
import { MentionMenu } from "./components/MentionMenu";
import { ProactiveAgent } from "./components/ProactiveAgent";
import { WeeklyReportModal } from "./components/WeeklyReportModal";
import { TaskItem } from "./components/TaskList/TaskItem";

export default function App() {
    const {
        tasks,
        isAnalyzing,
        addTaskFromText,
        toggleTask,
        updateTask,
        generateSubtasks,
        toggleSubtask,
    } = useTasks();

    // ----- Estado do input e gravação -----
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef(null);
    const { isRecording, toggleRecording } = useVoiceRecording(setInputValue);

    // ----- Feature 5: @mention -----
    const { isMenuOpen, handleInputChange, selectMember, closeMenu } =
        useMention(inputValue, setInputValue, inputRef);

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
                        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
                            <CalendarCheck className="w-4 h-4 text-emerald-500" /> GCal Sincronizado
                        </div>
                    </div>
                </header>

                {/* Campo de entrada inteligente + Feature 5 (MentionMenu) */}
                <div className="px-10 pb-8 max-w-5xl mx-auto w-full z-30 relative">
                    <SmartInput
                        inputRef={inputRef}
                        value={inputValue}
                        isRecording={isRecording}
                        isAnalyzing={isAnalyzing}
                        onChange={handleInputChange}
                        onSubmit={handleSubmit}
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

