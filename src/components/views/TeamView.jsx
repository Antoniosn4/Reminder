// =============================================================
//  TeamView.jsx
//  Views das equipes: Marketing, Design e Desenvolvimento.
//  Cada variante recebe as tarefas filtradas por projeto.
// =============================================================

import { Code2, Paintbrush } from "lucide-react";
import { TaskItem } from "../TaskList/TaskItem";
import { MOCK_TEAM } from "../../constants/mockTeam";

/** Cabeçalho padrão com membros empilhados */
function TeamHeader({ title, subtitle, stats, children }) {
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl flex items-center justify-between animate-in fade-in duration-300 relative overflow-hidden">
            {children}
            <div className="flex gap-8 flex-shrink-0">
                {stats.map(({ label, value, color }) => (
                    <div key={label} className="text-center">
                        <span className={`block text-2xl font-bold ${color}`}>{value}</span>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TaskSection({ title, tasks, onToggleTask, onUpdateTask, onDeleteTask, onGenerateSubtasks, onToggleSubtask }) {
    return (
        <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-4 px-1">{title}</h3>
            <div className="space-y-3">
                {tasks.length === 0 ? (
                    <p className="text-sm text-gray-500 px-2">Nenhuma tarefa pendente.</p>
                ) : (
                    tasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onToggleTask={onToggleTask}
                            onUpdateTask={onUpdateTask}
                            onDeleteTask={onDeleteTask}
                            onGenerateSubtasks={onGenerateSubtasks}
                            onToggleSubtask={onToggleSubtask}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

const taskHandlerProps = ["onToggleTask", "onUpdateTask", "onDeleteTask", "onGenerateSubtasks", "onToggleSubtask"];

export function TeamMarketingView({ tasks, ...handlers }) {
    const teamTasks = tasks.filter((t) => t.project === "Marketing");
    const pending = teamTasks.filter((t) => !t.completed);

    return (
        <div className="space-y-8">
            <TeamHeader
                stats={[
                    { label: "Concluídas", value: 12, color: "text-pink-500" },
                    { label: "Em Aberto", value: pending.length, color: "text-white" },
                ]}
            >
                <div className="flex items-center gap-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-100">Marketing Q4</h2>
                        <p className="text-sm text-gray-400 mt-1">4 membros ativos no ciclo</p>
                    </div>
                    <div className="flex items-center -space-x-3">
                        {MOCK_TEAM.slice(0, 4).map((user) => (
                            <div
                                key={user.id}
                                className="w-10 h-10 rounded-full border-2 border-gray-800 bg-gray-900 overflow-hidden shadow-sm"
                            >
                                <img src={user.avatar} className="w-full h-full opacity-90 hover:opacity-100" alt={user.name} />
                            </div>
                        ))}
                    </div>
                </div>
            </TeamHeader>
            <TaskSection title="Atividades da Sprint Atual" tasks={pending} {...handlers} />
        </div>
    );
}

export function TeamDesignView({ tasks, ...handlers }) {
    const teamTasks = tasks.filter((t) => t.subProject === "Design System");
    const pending = teamTasks.filter((t) => !t.completed);

    return (
        <div className="space-y-8">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl flex items-center justify-between relative overflow-hidden animate-in fade-in duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
                <div className="flex items-center gap-6 z-10">
                    <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                        <Paintbrush className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-100">Design System</h2>
                        <p className="text-sm text-gray-400 mt-1">2 membros ativos</p>
                    </div>
                </div>
                <div className="z-10 px-4 py-2 bg-gray-900 rounded-lg border border-gray-700">
                    <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Cobertura</span>
                    <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-800 rounded-full">
                            <div className="w-[85%] h-full bg-blue-500 rounded-full" />
                        </div>
                        <span className="text-sm font-bold text-white">85%</span>
                    </div>
                </div>
            </div>
            <TaskSection title="Componentes em Revisão" tasks={pending} {...handlers} />
        </div>
    );
}

export function TeamDevView({ tasks, ...handlers }) {
    const teamTasks = tasks.filter(
        (t) => t.project === "Frontend" || t.project === "Infra"
    );
    const pending = teamTasks.filter((t) => !t.completed);

    return (
        <div className="space-y-8">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl flex items-center justify-between animate-in fade-in duration-300">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                        <Code2 className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-100">Desenvolvimento</h2>
                        <p className="text-sm text-gray-400 mt-1">6 membros • Sprint 42</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    {[
                        { label: "PRs Abertos", value: 4, color: "text-emerald-400" },
                        { label: "Pts Restantes", value: 18, color: "text-cyan-400" },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="bg-gray-900 px-4 py-2 rounded-lg border border-gray-700 flex flex-col items-center justify-center">
                            <span className={`text-xl font-bold ${color}`}>{value}</span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase">{label}</span>
                        </div>
                    ))}
                </div>
            </div>
            <TaskSection title="Backlog Ativo" tasks={pending} {...handlers} />
        </div>
    );
}
