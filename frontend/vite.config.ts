import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
    server: {
        host: "0.0.0.0",
        port: 8001,
        proxy: {
            '/api': {
                target: 'http://backend:8000',
                changeOrigin: true,
                secure: false,
            }
        }
    },
    plugins: [react(), tailwindcss(),],
})
