import { resolve } from 'path'

export default {
  base: './',
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        leaflet: resolve(__dirname, 'leaflet/leaflet.html'),
        openlayer: resolve(__dirname, 'openlayer/openlayer.html'),
      },
    },
  },
}
