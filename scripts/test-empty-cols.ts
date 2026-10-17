import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://eusvssjczjlotwedrnpa.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectColumns() {
  const tables = ["timetables", "homework", "homework_submissions", "school_events", "library_books", "transport_routes", "hostel_rooms", "leave_requests"];
  for (const t of tables) {
    const { error } = await supabase.from(t).insert({ organization_id: "01000000-0000-0000-0000-000000000001" });
    console.log(`Table ${t} test insert:`, error ? error.message : "Success");
  }
}

inspectColumns();
