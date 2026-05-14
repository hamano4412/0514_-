// 既存ユーザーのパスワードを変更するスクリプト
// 使い方: node scripts/update-password.mjs <email> <newPassword>

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

const [, , email, newPassword] = process.argv;
if (!email || !newPassword) {
  console.error("Usage: node scripts/update-password.mjs <email> <newPassword>");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// メアドからユーザー検索
const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
if (listErr) {
  console.error("Failed to list users:", listErr.message);
  process.exit(1);
}

const target = list.users.find((u) => u.email === email);
if (!target) {
  console.error(`User not found: ${email}`);
  process.exit(1);
}

const { error } = await supabase.auth.admin.updateUserById(target.id, { password: newPassword });
if (error) {
  console.error("Failed to update password:", error.message);
  process.exit(1);
}

console.log(`✓ Password updated for ${email} (id: ${target.id})`);
