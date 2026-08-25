import { defineConfig } from 'vite'

/** Public project Pages: https://fr4iser90.github.io/autonomous-lab/ */
export default defineConfig({
  base: '/autonomous-lab/',
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: false,
  },
  preview: {
    host: '127.0.0.1',
    port: 5173,
  },
})
