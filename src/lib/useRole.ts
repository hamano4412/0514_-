"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type Role = "employee" | "owner";

export type AuthProfile = {
  id: string;
  fullName: string;
  role: Role;
  email: string;
};

// Supabase のセッション + profiles テーブルから現在のユーザーを取得する
export function useRole() {
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    const load = async (userId: string | undefined, email: string | undefined) => {
      if (!userId) {
        if (active) {
          setProfile(null);
          setHydrated(true);
        }
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("id", userId)
        .maybeSingle();
      if (!active) return;
      if (error || !data) {
        setProfile(null);
      } else {
        setProfile({
          id: data.id,
          fullName: data.full_name,
          role: data.role as Role,
          email: email ?? "",
        });
      }
      setHydrated(true);
    };

    supabase.auth.getUser().then(({ data }) => {
      load(data.user?.id, data.user?.email);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      load(session?.user?.id, session?.user?.email);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const role: Role | null = profile?.role ?? null;

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setProfile(null);
  };

  return { profile, role, hydrated, signOut };
}
