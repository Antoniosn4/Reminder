// =============================================================
//  mockTeam.js
//  Dados mockados da equipe — fonte única de verdade compartilhada.
// =============================================================

/** @typedef {{ id: string, name: string, avatar: string }} TeamMember */

/** @type {TeamMember[]} */
export const MOCK_TEAM = [
    {
        id: "u1",
        name: "Paulo",
        avatar:
            "https://api.dicebear.com/7.x/avataaars/svg?seed=Paulo&backgroundColor=transparent",
    },
    {
        id: "u2",
        name: "Ana",
        avatar:
            "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana&backgroundColor=transparent",
    },
];
