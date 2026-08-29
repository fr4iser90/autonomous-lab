import { defineConfig } from 'vite'
export default defineConfig({
  base: '/autonomous-lab/',
  server: { host: '127.0.0.1', port: 5173, strictPort: false },
  preview: { host: '127.0.0.1', port: 5173 },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 3,
        inline: 2,
        sequences: true,
        join_vars: true,
        collapse_vars: true,
        side_effects: true,
        pure_getters: true,
      },
      mangle: true,
    },
  },
})
