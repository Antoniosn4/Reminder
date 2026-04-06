// =============================================================
//  SidebarSectionTitle.jsx
//  Cabeçalho de seção da sidebar (FAVORITOS, EQUIPE, etc.).
// =============================================================

/**
 * @param {{ title: string }} props
 */
export function SidebarSectionTitle({ title }) {
    return (
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">
            {title}
        </h4>
    );
}
