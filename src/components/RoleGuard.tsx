"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useRole, type Role } from "@/lib/useRole";

type Props = {
  require: Role | "any";
  children: React.ReactNode;
};

// モック専用ガード: ロール未設定なら /login へ。owner 限定ページは employee なら / にリダイレクト。
export function RoleGuard({ require, children }: Props) {
  const router = useRouter();
  const { role, hydrated } = useRole();

  useEffect(() => {
    if (!hydrated) return;
    if (!role) {
      router.replace("/login");
      return;
    }
    if (require === "owner" && role !== "owner") {
      router.replace("/");
    }
  }, [hydrated, role, require, router]);

  if (!hydrated || !role || (require === "owner" && role !== "owner")) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
        読み込み中...
      </div>
    );
  }

  return <>{children}</>;
}
