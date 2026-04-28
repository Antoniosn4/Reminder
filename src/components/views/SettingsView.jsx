// =============================================================
//  SettingsView.jsx
//  Tela de configurações do perfil do usuário.
// =============================================================

import { User } from "lucide-react";

export function SettingsView() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-400" />
                    Perfil Pessoal
                </h2>
                <div className="flex items-center gap-8">
                    <div className="relative group cursor-pointer">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-500 to-emerald-400 p-[3px]">
                            <img
                                src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=transparent"
                                alt="Avatar"
                                className="w-full h-full rounded-full bg-gray-900 object-cover"
                            />
                        </div>
                        <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-semibold text-white">Alterar</span>
                        </div>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Nome de Exibição
                                </label>
                                <input
                                    type="text"
                                    defaultValue="Engenheiro Pro"
                                    className="w-full bg-gray-900 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    defaultValue="contato@engenheiro.pro"
                                    className="w-full bg-gray-900 border border-gray-700 text-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none cursor-not-allowed"
                                    disabled
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                Plano Atual
                            </label>
                            <div className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 px-3 py-2 rounded-lg text-sm font-medium w-fit">
                                ✦ Ultimate
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-4">Preferências</h2>
                <div className="space-y-4">
                    <SettingsToggle label="Notificações de rotina" defaultChecked />
                    <SettingsToggle label="Sugestões proativas da IA" defaultChecked />
                    <SettingsToggle label="Sincronização automática com Google Calendar" />
                </div>
            </section>
        </div>
    );
}

function SettingsToggle({ label, defaultChecked = false }) {
    return (
        <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{label}</span>
            <div className="relative">
                <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
                <div className="w-10 h-6 bg-gray-700 rounded-full peer peer-checked:bg-violet-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-5 after:h-5 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-4" />
            </div>
        </label>
    );
}
