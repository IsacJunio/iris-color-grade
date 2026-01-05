import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
        '/api/hf': {
            target: 'https://api-inference.huggingface.co',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/hf/, ''),
            secure: true
        }
    }
  }
})
