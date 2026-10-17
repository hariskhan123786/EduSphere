import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// Desktop-specific Vite config — completely separate from root vite.config.ts
// This config is Tauri-aware: sets host and port for the Tauri dev server
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Tauri expects a fixed port and specific host settings
  server: {
    port: 1420,
    strictPort: true,
    host: '127.0.0.1',
    hmr: {
      protocol: 'ws',
      host: '127.0.0.1',
      port: 1421,
    },
  },
  build: {
    // Tauri uses ES modules
    target: ['es2021', 'chrome105', 'safari13'],
    // Don't minify for faster development builds
    minify: process.env.TAURI_DEBUG ? false : 'esbuild',
    sourcemap: !!process.env.TAURI_DEBUG,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }
          if (id.includes('node_modules/@tauri-apps')) {
            return 'vendor-tauri';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
          // Portal chunks
          if (id.includes('SuperAdmin')) return 'portal-superadmin';
          if (id.includes('SchoolAdmin')) return 'portal-admin';
          if (id.includes('TeacherPortal')) return 'portal-teacher';
          if (id.includes('PrincipalPortal')) return 'portal-principal';
          if (id.includes('AccountantPortal')) return 'portal-accountant';
          if (id.includes('ParentPortal')) return 'portal-parent';
          if (id.includes('StudentPortal')) return 'portal-student';
        },
      },
    },
  },
  // Make env vars available — Tauri injects TAURI_ prefixed vars
  envPrefix: ['VITE_', 'TAURI_'],
});
