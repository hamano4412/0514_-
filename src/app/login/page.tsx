"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRole, type Role } from "@/lib/useRole";

export default function LoginPage() {
  const router = useRouter();
  const { setRole } = useRole();
  const [email, setEmail] = useState("yamada@example.com");
  const [password, setPassword] = useState("password");

  const handleLogin = (role: Role) => {
    setRole(role);
    router.push(role === "owner" ? "/admin/shifts" : "/");
  };

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">勤怠管理</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">ログインしてください</p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin("employee");
          }}
        >
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="submit"
              className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              一般ユーザーとしてログイン
            </button>
            <button
              type="button"
              onClick={() => handleLogin("owner")}
              className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              管理者（社長）としてログイン
            </button>
          </div>
        </form>

        <p className="mt-6 text-xs text-zinc-500 dark:text-zinc-500">
          ※ モック画面です。認証は未実装で、ボタン押下でロールが切り替わります。
        </p>
      </div>
    </div>
  );
}
