import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            // Qualquer requisição para /api/* é encaminhada ao servidor Python.
            // O browser chama /api/gemini (mesma origem) → sem CORS.
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
        },
    },
})
