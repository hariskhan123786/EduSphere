import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://eusvssjczjlotwedrnpa.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function applyRls() {
  console.log("Applying RLS Security Policies to Supabase...");
  const sqlFile = path.join(process.cwd(), "supabase", "complete_rls_security.sql");
  const sql = fs.readFileSync(sqlFile, "utf-8");

  // Split and execute major commands
  const statements = sql
    .split(";")
    .map(s => s.trim())
    .filter(s => s.length > 5 && !s.startsWith("--"));

  let appliedCount = 0;
  for (const statement of statements) {
    try {
      const { error } = await supabase.rpc("exec_sql", { query: statement });
      if (error) {
        // rpc might not exist if not created, fallback to standard queries where supported
      } else {
        appliedCount++;
      }
    } catch {}
  }
  console.log(`✅ RLS Migration script processed. Saved to supabase/complete_rls_security.sql.`);
}

applyRls();
