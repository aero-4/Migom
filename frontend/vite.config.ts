import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
    server: {
        host: "127.0.0.1",
        port: 8001,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                cookieDomainRewrite: "",
            }
        }
    },
    plugins: [react(), tailwindcss(),],
})
