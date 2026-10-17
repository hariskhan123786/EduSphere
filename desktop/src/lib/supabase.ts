/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * EduSphere AI Desktop — Supabase Client
 * Connects the desktop app to the same Supabase project as the web app.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "";
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";

// Log config on startup for debugging (masked key)
if (supabaseUrl) {
  console.info("[Supabase] Cloud endpoint configured:", supabaseUrl);
} else {
  console.warn("[Supabase] ⚠️ VITE_SUPABASE_URL is not set — running in offline-only mode.");
}

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storageKey: "edusphere_desktop_supabase_session",
        },
      })
    : null;

/**
 * Returns true if the Supabase client is initialized.
 * NOTE: We intentionally do NOT check navigator.onLine here because Tauri
 * WebView often reports offline even when internet is available. The actual
 * fetch/ping will detect real connectivity failures.
 */
export function isSupabaseAvailable(): boolean {
  return supabase !== null;
}

/**
 * Test live Supabase connectivity by hitting a lightweight query.
 */
export async function pingSupabase(): Promise<boolean> {
  if (!supabase) return false;
  try {
    const timeout = new Promise<boolean>((_, reject) =>
      setTimeout(() => reject(new Error("Supabase ping timeout")), 2000)
    );
    const ping = (async () => {
      const { error } = await supabase.from("organizations").select("id").limit(1);
      return !error;
    })();
    return await Promise.race([ping, timeout]);
  } catch {
    return false;
  }
}
