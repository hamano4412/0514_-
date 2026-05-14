"use client";

import { useEffect, useState } from "react";

export type Role = "employee" | "owner";

const STORAGE_KEY = "kintai-mock-role";

// モック専用のロール管理。実装時は Supabase Auth のセッションに置き換える。
export function useRole() {
  const [role, setRoleState] = useState<Role | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (stored === "employee" || stored === "owner") {
      setRoleState(stored);
    }
    setHydrated(true);
  }, []);

  const setRole = (next: Role | null) => {
    if (typeof window !== "undefined") {
      if (next) {
        window.localStorage.setItem(STORAGE_KEY, next);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setRoleState(next);
  };

  return { role, setRole, hydrated };
}
