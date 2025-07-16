import { fileURLToPath, URL } from 'node:url'
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
     Components({
      resolvers: [ElementPlusResolver()], // 如果使用 Element Plus
      extensions: ['vue'],
      include: [/\.vue$/, /\.vue\?vue/],
    }),
    vueJsx(),
  
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})



