import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    // '@' 指向 src
    alias: { '@': '/src' }
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      // 可选：前端请求 /api 时代理到后端，避免跨域
      '/api': { target: 'http://127.0.0.1:8080', changeOrigin: true }
    }
  }
})
