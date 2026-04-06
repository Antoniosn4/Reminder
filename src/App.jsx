// =============================================================
//  App.jsx
//  Componente raiz — orquestra a UI e conecta os hooks de negócio.
//  Responsabilidade única: composição da tela, sem lógica de domínio.
// =============================================================

import { useState } from "react";
import { CalendarCheck } from "lucide-react";

import { useTasks } from "./hooks/useTasks";
import { useVoiceRecording } from "./hooks/useVoiceRecording";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { SmartInput } from "./components/SmartInput";
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

    const [inputValue, setInputValue] = useState("");
    const { isRecording, toggleRecording } = useVoiceRecording(setInputValue);

    const pendingTasks = tasks.filter((t) => !t.completed);
    const completedTasks = tasks.filter((t) => t.completed);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await addTaskFromText(inputValue);
        setInputValue("");
    };

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
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
                            <CalendarCheck className="w-4 h-4 text-emerald-500" /> GCal Sincronizado
                        </div>
                    </div>
                </header>

                {/* Campo de entrada inteligente */}
                <div className="px-10 pb-8 max-w-5xl mx-auto w-full z-20">
                    <SmartInput
                        value={inputValue}
                        isRecording={isRecording}
                        isAnalyzing={isAnalyzing}
                        onChange={setInputValue}
                        onSubmit={handleSubmit}
                    />
                </div>

                {/* Lista de tarefas */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-10 pb-20 max-w-5xl mx-auto w-full">

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

            {/* Scrollbar customizada global */}
            <style dangerouslySetInnerHTML={{
                __html: `
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #4b5563; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #6b7280; }
        `
            }} />
        </div>
    );
}
