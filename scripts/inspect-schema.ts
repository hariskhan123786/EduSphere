import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://eusvssjczjlotwedrnpa.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspect() {
  const tables = [
    "organizations", "users", "students", "teachers", "attendance",
    "fee_invoices", "payrolls", "expenses", "exams", "results", "notices"
  ];
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select("*").limit(1);
    if (error) {
      console.log(`Table ${t} error:`, error.message);
    } else {
      console.log(`Table ${t} sample/cols:`, data && data.length > 0 ? Object.keys(data[0]) : "empty table");
    }
  }
}

inspect();
