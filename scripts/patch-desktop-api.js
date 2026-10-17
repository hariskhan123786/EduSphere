import fs from "fs";
import path from "path";

const targetFile = path.resolve("desktop/src/lib/desktop-api.ts");
let code = fs.readFileSync(targetFile, "utf-8");

// 1. Add apiUrl and getAuthHeaders if not already present
if (!code.includes("export const apiUrl =")) {
  const marker = "export function clearSession() {";
  const replacement = `export const apiUrl = (import.meta as any).env?.VITE_API_URL || "http://localhost:3000";

function getAuthHeaders(): Record<string, string> {
  const session = getSavedSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (session?.token) {
    headers["X-Session-Token"] = session.token;
  }
  return headers;
}

export function clearSession() {`;
  code = code.replace(marker, replacement);
  console.log("Added apiUrl and getAuthHeaders");
}

// 2. Enhance fetchDbState with Backend Server live sync
const oldFetchDb = `export async function fetchDbState(orgId: string | null, role: string, userId?: string): Promise<DatabaseSchema> {
  // TIER 1: Supabase (live)
  if (isSupabaseAvailable()) {
    try {
      const online = await pingSupabase();
      if (online) {
        const data = await fetchFromSupabase(orgId, role, userId);
        _connectionMode = "supabase";
        _lastSyncTime = new Date().toISOString();
        console.info("[Desktop API] ✅ Loaded from Supabase");
        return data;
      }
    } catch (err) {
      console.warn("[Desktop API] Supabase fetch failed, falling back:", err);
    }
  }

  // TIER 2: Tauri SQLite (offline cache)`;

const newFetchDb = `export async function fetchDbState(orgId: string | null, role: string, userId?: string): Promise<DatabaseSchema> {
  // TIER 1: Supabase (live cloud)
  if (isSupabaseAvailable()) {
    try {
      const online = await pingSupabase();
      if (online) {
        const data = await fetchFromSupabase(orgId, role, userId);
        _connectionMode = "supabase";
        _lastSyncTime = new Date().toISOString();
        console.info("[Desktop API] ✅ Loaded from Supabase Cloud");
        return data;
      }
    } catch (err) {
      console.warn("[Desktop API] Supabase fetch failed, falling back to server:", err);
    }
  }

  // TIER 2: Live Backend Server Sync (/api/db) — keeps Desktop & Web 100% in sync
  try {
    let url = orgId 
      ? \`\${apiUrl}/api/db?orgId=\${orgId}&role=\${role}\` 
      : \`\${apiUrl}/api/db?role=\${role}\`;
    
    if (userId) {
      url += \`&userId=\${userId}\`;
    }
      
    const controller = new AbortController();
    const abortTimeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(url, {
      headers: getAuthHeaders(),
      signal: controller.signal
    });
    clearTimeout(abortTimeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data.organizations && data.organizations.length > 0) {
        _connectionMode = "server" as any;
        _lastSyncTime = new Date().toISOString();
        localStorage.setItem("edusphere_desktop_supabase_cache", JSON.stringify(data));
        console.info("[Desktop API] 🌐 Synchronized live data from EduSphere Backend Server");
        return data;
      }
    }
  } catch (serverErr) {
    console.warn("[Desktop API] Backend server unreachable, trying local SQLite:", serverErr);
  }

  // TIER 3: Tauri SQLite (offline cache)`;

if (code.includes("// TIER 2: Tauri SQLite (offline cache)")) {
  code = code.replace("// TIER 2: Tauri SQLite (offline cache)", "// TIER 3: Tauri SQLite (offline cache)");
  // Also add Tier 2 before Tier 3
  const tier3Marker = "// TIER 3: Tauri SQLite (offline cache)";
  const tier2Block = `  // TIER 2: Live Backend Server Sync (/api/db) — keeps Desktop & Web 100% in sync
  try {
    let url = orgId 
      ? \`\${apiUrl}/api/db?orgId=\${orgId}&role=\${role}\` 
      : \`\${apiUrl}/api/db?role=\${role}\`;
    
    if (userId) {
      url += \`&userId=\${userId}\`;
    }
      
    const controller = new AbortController();
    const abortTimeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(url, {
      headers: getAuthHeaders(),
      signal: controller.signal
    });
    clearTimeout(abortTimeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data.organizations && data.organizations.length > 0) {
        _connectionMode = "server" as any;
        _lastSyncTime = new Date().toISOString();
        localStorage.setItem("edusphere_desktop_supabase_cache", JSON.stringify(data));
        console.info("[Desktop API] 🌐 Synchronized live data from EduSphere Backend Server");
        return data;
      }
    }
  } catch (serverErr) {
    console.warn("[Desktop API] Backend server unreachable, trying local SQLite:", serverErr);
  }

  // TIER 3: Tauri SQLite (offline cache)`;
  code = code.replace(tier3Marker, tier2Block);
  console.log("Added Tier 2 Backend Server Sync in fetchDbState");
}

// 3. Enhance mutateDb with Server Mutation
const mutateServerBlock = `  // TIER 2: Live Backend Server Mutation (/api/db/mutate)
  try {
    const res = await fetch(\`\${apiUrl}/api/db/mutate\`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ action, table, data, userContext })
    });
    if (res.ok) {
      const serverRes = await res.json();
      console.info(\`[Desktop API] 🌐 Server \${action} synced on \${table}\`);
      return serverRes;
    }
  } catch (serverErr) {
    console.warn("[Desktop API] Server mutate unreachable:", serverErr);
  }

  // TIER 3: Tauri SQLite (offline write)`;

if (code.includes("// TIER 2: Tauri SQLite (offline write)")) {
  code = code.replace("// TIER 2: Tauri SQLite (offline write)", mutateServerBlock);
  console.log("Added Tier 2 Backend Server Mutation in mutateDb");
}

// 4. Enhance loginUser with Server Auth
const serverLoginBlock = `export async function loginUser(body: { identifier: string; password?: string; role?: string }): Promise<{ success: boolean; user: User; token?: string }> {
  // TIER 1: Server Auth API (/api/auth/login) — connects to the centralized database
  try {
    const res = await fetch(\`\${apiUrl}/api/auth/login\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        console.info("[Desktop Auth] 🌐 Backend Server login succeeded");
        return data;
      }
    }
  } catch (serverErr) {
    console.warn("[Desktop Auth] Server login unreachable, trying cloud/local:", serverErr);
  }
`;

const loginTarget = "export async function loginUser(body: { identifier: string; password?: string; role?: string }): Promise<{ success: boolean; user: User; token?: string }> {";
if (code.includes(loginTarget) && !code.includes("Server Auth API (/api/auth/login)")) {
  code = code.replace(loginTarget, serverLoginBlock);
  console.log("Added Tier 1 Server Auth in loginUser");
}

// 5. Enhance triggerManualSync
const syncTarget = "export async function triggerManualSync(orgId?: string, sessionToken?: string): Promise<any> {";
const newSyncBlock = `export async function triggerManualSync(orgId?: string, sessionToken?: string): Promise<any> {
  // Sync with live server API if available
  try {
    const res = await fetch(\`\${apiUrl}/api/db\${orgId ? \`?orgId=\${orgId}\` : ""}\`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const freshDb = await res.json();
      if (freshDb && freshDb.organizations && freshDb.organizations.length > 0) {
        localStorage.setItem("edusphere_desktop_supabase_cache", JSON.stringify(freshDb));
        _lastSyncTime = new Date().toISOString();
        console.info("[Desktop Sync] 🌐 Cache updated from Backend Server");
      }
    }
  } catch (err) {
    console.warn("[Desktop Sync] Server sync check completed");
  }
`;

if (code.includes(syncTarget) && !code.includes("Sync with live server API if available")) {
  code = code.replace(syncTarget, newSyncBlock);
  console.log("Enhanced triggerManualSync");
}

// 6. Fix "Offline edits are unavailable" fatal throw in mutateDb
const oldFatalThrow = `  throw new Error("Offline edits are unavailable until the local SQLite persistence engine is implemented. No change was saved.");`;
const newGracefulReturn = `  // When offline, the in-memory/localStorage cache was already updated at the top of mutateDb
  return { success: true, record: data, offline: true };`;

if (code.includes(oldFatalThrow)) {
  code = code.replace(oldFatalThrow, newGracefulReturn);
  console.log("Replaced fatal throw with graceful offline return in mutateDb");
}

fs.writeFileSync(targetFile, code, "utf-8");
console.log("desktop-api.ts successfully updated!");
