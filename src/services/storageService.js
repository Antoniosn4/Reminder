// =============================================================
//  storageService.js
//  Camada de persistência local via IndexedDB.
//  Responsabilidade única: CRUD de tarefas no banco local do navegador.
//
//  Banco  : reminder-db  (v1)
//  Store  : tasks        (keyPath: 'id')
// =============================================================

import { openDB } from "idb";

const DB_NAME = "reminder-db";
const DB_VERSION = 1;
const STORE_NAME = "tasks";

/** @type {import('idb').IDBPDatabase | null} */
let dbInstance = null;

/**
 * Inicializa (ou reutiliza) a conexão com o IndexedDB.
 * Usa padrão singleton para evitar múltiplas conexões abertas.
 *
 * @returns {Promise<import('idb').IDBPDatabase>}
 */
async function getDB() {
    if (dbInstance) return dbInstance;

    dbInstance = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
        },
    });

    return dbInstance;
}

/**
 * Retorna todas as tarefas armazenadas no IndexedDB.
 *
 * @returns {Promise<Array>} Lista de tarefas (pode ser vazia).
 */
export async function getAllTasks() {
    try {
        const db = await getDB();
        return await db.getAll(STORE_NAME);
    } catch (error) {
        console.error("[storageService] Falha ao ler tarefas do IndexedDB:", error);
        return [];
    }
}

/**
 * Persiste a lista completa de tarefas, substituindo os dados anteriores.
 * Usa uma única transação read-write para atomicidade.
 *
 * @param {Array} tasks - Lista atual de tarefas a ser salva.
 * @returns {Promise<void>}
 */
export async function saveAllTasks(tasks) {
    try {
        const db = await getDB();
        const tx = db.transaction(STORE_NAME, "readwrite");

        await tx.store.clear();
        await Promise.all(tasks.map((task) => tx.store.put(task)));
        await tx.done;
    } catch (error) {
        console.error("[storageService] Falha ao salvar tarefas no IndexedDB:", error);
    }
}
