import { defineConfig } from 'vite'

export default defineConfig({
  base: '/forestcover-viz', // github page is served at the yingquantan.com/forestcover-viz
  build: {
    outDir: 'build/'
  }
})
