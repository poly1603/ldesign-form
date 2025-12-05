import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@ldesign/form-core': resolve(__dirname, '../packages/core/src'),
      '@ldesign/form-vue': resolve(__dirname, '../packages/vue/src')
    }
  },
  server: {
    port: 7777,
    open: true
  }
})
