// =============================================================
//  renderIcon.js
//  Função utilitária para renderizar ícones dinâmicos de rotinas.
// =============================================================

import React from "react";
import {
    Pill, Droplet, Clock, Coffee, Activity,
    Code2, CheckCircle2, Circle,
} from "lucide-react";

const ICON_MAP = {
    Pill, Droplet, Clock, Coffee, Activity,
    Code2, CheckCircle2, Circle,
};

/**
 * Renderiza um ícone Lucide a partir do nome como string.
 * @param {string} name - Nome do ícone (ex: "Pill", "Droplet")
 * @param {string} className - Classes CSS para o ícone
 */
export function renderIcon(name, className = "") {
    const IconComponent = ICON_MAP[name] || Circle;
    return React.createElement(IconComponent, { className });
}
