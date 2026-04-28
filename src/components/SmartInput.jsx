// =============================================================
//  SmartInput.jsx
//  Campo de entrada inteligente com suporte a NLP, gravação e @mention.
//  Features 3 (Dictation) e 5 (Colaboração).
//
//  Modos:
//    - Normal: input de texto + botão mic / send.
//    - Gravação: painel com timer, waveform REAL (Web Audio API), ❌/✔️.
//    - Transcrevendo/Analisando: spinner.
// =============================================================

import { useRef, useEffect, useState } from "react";
import { Mic, Plus, Send, Loader2, X, Check } from "lucide-react";

/** Número de barras no waveform visual. */
const BAR_COUNT = 9;
/** Alturas absolutas (px) — silêncio vs pico. */
const MIN_PX = 4;
const MAX_PX = 44;

/** Formata segundos como MM:SS. */
function formatTime(totalSeconds) {
    const m = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const s = String(totalSeconds % 60).padStart(2, "0");
    return `${m}:${s}`;
}

// ── Hook interno: conecta Web Audio API ao MediaStream ──────────────
function useWaveform(mediaStream, isRecording) {
    const [barHeights, setBarHeights] = useState(() => Array(BAR_COUNT).fill(MIN_PX));
    const audioCtxRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);
    const rafRef = useRef(null);

    useEffect(() => {
        function cleanup() {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
            // Desconecta a source (não fecha o contexto prematuramente)
            if (sourceRef.current) {
                try { sourceRef.current.disconnect(); } catch { }
                sourceRef.current = null;
            }
            if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
                audioCtxRef.current.close().catch(() => { });
            }
            audioCtxRef.current = null;
            analyserRef.current = null;
            setBarHeights(Array(BAR_COUNT).fill(MIN_PX));
        }

        if (!isRecording || !mediaStream) {
            cleanup();
            return cleanup;
        }

        // Verifica se a stream ainda tem tracks ativos
        if (mediaStream.getTracks().every(t => t.readyState === "ended")) {
            cleanup();
            return cleanup;
        }

        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.75;
        analyser.minDecibels = -85;
        analyser.maxDecibels = -10;

        const source = audioCtx.createMediaStreamSource(mediaStream);
        source.connect(analyser);

        audioCtxRef.current = audioCtx;
        analyserRef.current = analyser;
        sourceRef.current = source;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        function tick() {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);

            // Amostra frequências úteis da voz humana (bins mais baixos)
            const usableBins = Math.min(dataArray.length, BAR_COUNT * 6);
            const binSize = Math.floor(usableBins / BAR_COUNT);
            const heights = [];

            for (let i = 0; i < BAR_COUNT; i++) {
                let sum = 0;
                for (let j = 0; j < binSize; j++) {
                    sum += dataArray[i * binSize + j];
                }
                const avg = sum / binSize;                    // 0–255
                const normalized = avg / 255;                  // 0–1
                // Mapeamento com curve para mais sensibilidade
                const curved = Math.pow(normalized, 0.6);
                const px = MIN_PX + curved * (MAX_PX - MIN_PX);
                heights.push(Math.round(px));
            }

            setBarHeights(heights);
            rafRef.current = requestAnimationFrame(tick);
        }

        rafRef.current = requestAnimationFrame(tick);
        return cleanup;
    }, [isRecording, mediaStream]);

    return barHeights;
}

/**
 * @param {{
 *   inputRef: React.RefObject<HTMLInputElement>,
 *   value: string,
 *   isRecording: boolean,
 *   isTranscribing: boolean,
 *   isAnalyzing: boolean,
 *   elapsedTime: number,
 *   mediaStream: MediaStream | null,
 *   onChange: (value: string) => void,
 *   onSubmit: (e: React.FormEvent) => void,
 *   onToggleRecording: () => void,
 *   onCancelRecording: () => void,
 *   children?: React.ReactNode
 * }} props
 */
export function SmartInput({
    inputRef,
    value,
    isRecording,
    isTranscribing,
    isAnalyzing,
    elapsedTime = 0,
    mediaStream = null,
    onChange,
    onSubmit,
    onToggleRecording,
    onCancelRecording,
    children,
}) {
    const isLoadingState = isAnalyzing || isTranscribing;
    const showSendButton = value && !isRecording && !isLoadingState;
    const showMicButton = !value && !isLoadingState && !isRecording;

    // Waveform via Web Audio API
    const barHeights = useWaveform(mediaStream, isRecording);

    // ── Modo Gravação ──────────────────────────────────────────────────────
    if (isRecording) {
        return (
            <div className="relative flex flex-col items-center justify-center bg-gray-800 border border-violet-500/60 rounded-2xl p-6 shadow-xl shadow-violet-500/20 gap-5">

                {/* Timer */}
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-400 text-sm font-semibold tracking-widest font-mono">
                        {formatTime(elapsedTime)}
                    </span>
                    <span className="text-gray-500 text-xs">Gravando…</span>
                </div>

                {/* Waveform — barras com altura absoluta em pixels */}
                <div className="flex items-end justify-center gap-[5px]" style={{ height: `${MAX_PX + 4}px` }}>
                    {barHeights.map((heightPx, i) => (
                        <div
                            key={i}
                            className="rounded-full transition-all duration-100 ease-out"
                            style={{
                                width: "5px",
                                height: `${heightPx}px`,
                                backgroundColor: heightPx > MAX_PX * 0.5 ? "#a78bfa" : "#7c3aed",
                                boxShadow: heightPx > MAX_PX * 0.4 ? "0 0 8px rgba(139,92,246,0.5)" : "none",
                            }}
                        />
                    ))}
                </div>

                {/* Ações */}
                <div className="flex items-center gap-4">
                    {/* ❌ Cancelar */}
                    <button
                        type="button"
                        onClick={onCancelRecording}
                        title="Cancelar gravação"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-700 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-gray-600 hover:border-red-500/40 transition-all text-sm font-medium"
                    >
                        <X className="w-4 h-4" />
                        Cancelar
                    </button>

                    {/* ✔️ Finalizar */}
                    <button
                        type="button"
                        onClick={onToggleRecording}
                        title="Finalizar e transcrever"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white border border-violet-500 hover:border-violet-400 transition-all text-sm font-medium shadow-lg shadow-violet-500/30"
                    >
                        <Check className="w-4 h-4" />
                        Finalizar
                    </button>
                </div>

                {children}
            </div>
        );
    }

    // ── Modo Normal / Loading ──────────────────────────────────────────────
    return (
        <form
            onSubmit={onSubmit}
            className={`relative flex items-center bg-gray-800 border rounded-2xl p-2 transition-all duration-300 shadow-xl ${isTranscribing
                ? "border-blue-500/40 shadow-blue-500/10"
                : "border-gray-700 hover:border-gray-600 focus-within:border-gray-500"
                }`}
        >
            {/* Ícone de prefixo */}
            <div className="pl-4 pr-2 text-gray-400">
                <Plus className="w-5 h-5" />
            </div>

            {/* Campo de texto */}
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={isLoadingState}
                placeholder={
                    isTranscribing
                        ? "🎙️ Transcrevendo áudio..."
                        : isAnalyzing
                            ? "✨ A IA está processando..."
                            : "Digite uma tarefa ou delegue com '@'..."
                }
                className="flex-1 bg-transparent border-none text-gray-100 placeholder-gray-500 text-lg focus:ring-0 px-2 h-14 w-full outline-none disabled:opacity-50"
            />

            {/* Ações à direita */}
            <div className="flex items-center gap-2 pr-2">
                {/* Spinner quando IA ou transcrição está processando */}
                {isLoadingState && (
                    <div className={`p-3 animate-spin ${isTranscribing ? "text-blue-400" : "text-violet-400"}`}>
                        <Loader2 className="w-6 h-6" />
                    </div>
                )}

                {/* Botão de envio (quando há texto) */}
                {showSendButton && (
                    <button
                        type="submit"
                        className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                )}

                {/* Botão de microfone */}
                {showMicButton && (
                    <button
                        type="button"
                        onClick={onToggleRecording}
                        title="Gravar por voz"
                        className="p-3 rounded-xl transition-all text-gray-500 hover:text-violet-400 hover:bg-violet-500/10"
                    >
                        <Mic className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Slot para o MentionMenu */}
            {children}
        </form>
    );
}
