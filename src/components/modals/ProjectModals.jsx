// =============================================================
//  ProjectModals.jsx
//  Modais de criação e edição de projetos.
// =============================================================

import { useState } from "react";
import { Hash, Settings, X, Trash2 } from "lucide-react";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#10b981", "#eab308", "#ef4444", "#06b6d4"];

// ── Criar Projeto ──

export function NewProjectModal({ isOpen, onClose, onAddProject }) {
    const [name, setName] = useState("");
    const [color, setColor] = useState("#3b82f6");

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onAddProject({ label: name.trim(), color });
        setName("");
        setColor("#3b82f6");
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-gray-800 border border-gray-700 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden shadow-black/50" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800/80">
                    <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2"><Hash className="w-5 h-5 text-violet-400" /> Criar Projeto</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors p-1.5 rounded-lg hover:bg-gray-700"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Nome do Projeto</label>
                        <input autoFocus type="text" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)} className="w-full bg-gray-900 border border-gray-700 text-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-all shadow-inner" placeholder="Ex: Lançamento Q1" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Cor de Destaque</label>
                        <div className="flex gap-3 flex-wrap">
                            {COLORS.map((c) => (
                                <button key={c} type="button" onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 transition-transform active:scale-90 ${color === c ? "border-white scale-110 shadow-lg" : "border-transparent hover:scale-110"}`} style={{ backgroundColor: c, boxShadow: color === c ? `0 0 12px ${c}60` : "none" }} />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700 bg-gray-800/80">
                    <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-gray-300 hover:text-white hover:bg-gray-700 rounded-xl transition-all">Cancelar</button>
                    <button onClick={handleSubmit} className="px-6 py-2.5 bg-violet-500 hover:bg-violet-600 text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transform active:scale-95">Criar Projeto</button>
                </div>
            </div>
        </div>
    );
}

// ── Editar Projeto ──

export function EditProjectModal({ project, onClose, onSave, onDelete }) {
    const [name, setName] = useState(project?.label || "");
    const [color, setColor] = useState(project?.color || "#3b82f6");

    if (!project) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSave(project.id, { label: name.trim(), color });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-gray-800 border border-gray-700 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden shadow-black/50" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800/80">
                    <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2"><Settings className="w-5 h-5 text-violet-400" /> Editar Projeto</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors p-1.5 rounded-lg hover:bg-gray-700"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Nome do Projeto</label>
                        <input autoFocus type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-all shadow-inner" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Cor de Destaque</label>
                        <div className="flex gap-3 flex-wrap">
                            {COLORS.map((c) => (
                                <button key={c} type="button" onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 transition-transform active:scale-90 ${color === c ? "border-white scale-110 shadow-lg" : "border-transparent hover:scale-110"}`} style={{ backgroundColor: c, boxShadow: color === c ? `0 0 12px ${c}60` : "none" }} />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-800/80">
                    <button onClick={() => onDelete(project.id)} className="flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 px-4 py-2.5 rounded-xl transition-all"><Trash2 className="w-4 h-4" /> Excluir</button>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-gray-300 hover:text-white hover:bg-gray-700 rounded-xl transition-all">Cancelar</button>
                        <button onClick={handleSubmit} className="px-6 py-2.5 bg-violet-500 hover:bg-violet-600 text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transform active:scale-95">Salvar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
