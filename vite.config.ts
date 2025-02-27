import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true, // Limpia la carpeta dist antes de construir
  server: {
    historyApiFallback: true, // Asegura que el frontend maneja las rutas
  }
  },
});
