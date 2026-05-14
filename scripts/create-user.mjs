// ユーザーを作成するスクリプト（service_role 使用）
// 使い方:
//   node scripts/create-user.mjs <email> <password> [fullName] [--owner]
//
// 例:
//   node scripts/create-user.mjs taro@demo password123 "佐藤 太郎"           # 一般
//   node scripts/create-user.mjs admin@demo password123 "管理者" --owner     # 管理者

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

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が .env.local にありません");
  process.exit(1);
}

const args = process.argv.slice(2);
const isOwner = args.includes("--owner");
const positional = args.filter((a) => a !== "--owner");
const [email, password, fullName] = positional;

if (!email || !password) {
  console.error("Usage: node scripts/create-user.mjs <email> <password> [fullName] [--owner]");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: fullName ? { full_name: fullName } : undefined,
});

if (error) {
  console.error("Failed to create user:", error.message);
  process.exit(1);
}

console.log("✓ User created:");
console.log("  id:    ", data.user.id);
console.log("  email: ", data.user.email);

await new Promise((r) => setTimeout(r, 300));

const update = { full_name: fullName ?? data.user.email };
if (isOwner) update.role = "owner";

const { error: upErr } = await supabase.from("profiles").update(update).eq("id", data.user.id);

if (upErr) {
  console.error("Failed to update profile:", upErr.message);
  process.exit(1);
}

console.log(`✓ Profile updated (role: ${isOwner ? "owner" : "employee"}).`);
