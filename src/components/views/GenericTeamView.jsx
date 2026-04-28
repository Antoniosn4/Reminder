// =============================================================
//  GenericTeamView.jsx
//  View genérica para equipes criadas dinamicamente pelo usuário.
// =============================================================

import { Users } from "lucide-react";

export function GenericTeamView({ team }) {
    if (!team) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-gray-700/50 rounded-xl border border-gray-600/50">
                        <Users className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-100">{team.name}</h2>
                        <p className="text-sm text-gray-400 mt-1">{team.members} membros no espaço</p>
                    </div>
                </div>
                <div className="flex items-center -space-x-3">
                    {[...Array(Math.min(team.members, 5))].map((_, i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-gray-800 bg-gray-900 overflow-hidden shadow-sm">
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${team.name}${i}&backgroundColor=transparent`}
                                className="w-full h-full opacity-90"
                                alt="Avatar"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-center py-16 text-gray-500 flex flex-col items-center bg-gray-800/20 border border-dashed border-gray-700 rounded-2xl">
                <Users className="w-12 h-12 mb-4 opacity-20" />
                <h3 className="text-lg font-bold text-gray-400 mb-2">Espaço configurado com sucesso</h3>
                <p className="text-sm max-w-md">
                    O ambiente para <strong>{team.name}</strong> está pronto. Comece a delegar tarefas com @menções para visualizar aqui.
                </p>
            </div>
        </div>
    );
}
