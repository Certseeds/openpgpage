import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import type { UserConfig as VitestUserConfigInterface } from 'vitest/config';
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/openpgpage/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    }
  },
  build: {
    target: 'esnext'
  },
  test: {
    globals: true,
  }
})
