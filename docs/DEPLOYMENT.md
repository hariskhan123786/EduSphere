# EduSphere AI — Production Deployment Guide

## Web Deployment (Vercel / Node.js / Docker)
1. Install dependencies: `npm install`
2. Configure `.env`:
   - `GROQ_API_KEY`: Groq Cloud AI token
   - `VITE_SUPABASE_URL`: Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Supabase Public Anon Key
3. Build bundle: `npm run build`
4. Start server: `npm start` (port 3000)

## Windows Desktop Installer (Tauri 2)
1. `cd desktop`
2. Compile and package NSIS setup:
   `npx @tauri-apps/cli build --bundles nsis`
3. Output executable: `EduSphere-AI-Setup.exe` (installs on any 64-bit Windows PC).
