import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      // Increase warning threshold — we've already split chunks below
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            // Vendor: React core
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'vendor-react';
            }
            // Vendor: Supabase client
            if (id.includes('node_modules/@supabase')) {
              return 'vendor-supabase';
            }
            // Vendor: Lucide icons
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-icons';
            }
            // Vendor: Other node_modules
            if (id.includes('node_modules')) {
              return 'vendor-misc';
            }
            // Portal chunks — split heavy portal files into separate chunks
            if (id.includes('SuperAdmin')) return 'portal-superadmin';
            if (id.includes('SchoolAdmin')) return 'portal-admin';
            if (id.includes('TeacherPortal')) return 'portal-teacher';
            if (id.includes('PrincipalPortal')) return 'portal-principal';
            if (id.includes('AccountantPortal')) return 'portal-accountant';
            if (id.includes('ParentPortal')) return 'portal-parent';
            if (id.includes('StudentPortal')) return 'portal-student';
          }
        }
      }
    }
  };
});
