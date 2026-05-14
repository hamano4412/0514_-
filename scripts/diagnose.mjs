// DB の状態を service_role で確認する診断スクリプト
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const envPath = path.join(process.cwd(), ".env.local");
const env = Object.fromEntries(
  fs
    .readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.log("=== profiles ===");
const { data: profiles } = await supabase.from("profiles").select("*");
console.table(profiles);

console.log("\n=== shift_requests ===");
const { data: shifts } = await supabase.from("shift_requests").select("*");
console.table(shifts);

console.log("\n=== leave_requests ===");
const { data: leaves } = await supabase.from("leave_requests").select("*");
console.table(leaves);

console.log("\n=== embed test (shift_requests with profiles) ===");
const { data: shiftsWithProfiles, error: embedErr } = await supabase
  .from("shift_requests")
  .select("id, user_id, status, profiles(full_name)")
  .limit(5);
if (embedErr) {
  console.error("EMBED ERROR:", embedErr.message);
} else {
  console.table(shiftsWithProfiles);
}
