"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRole } from "@/lib/useRole";
import { type CommuterPassRow, formatYen, toYmd } from "@/lib/db";

export default function CommuterPassPage() {
  const { profile } = useRole();
  const [route, setRoute] = useState("");
  const [monthlyFee, setMonthlyFee] = useState(0);
  const [periodMonths, setPeriodMonths] = useState(1);
  const [validFrom, setValidFrom] = useState(toYmd(new Date()));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("commuter_passes")
      .select("*")
      .eq("user_id", profile.id)
      .order("valid_from", { ascending: false })
      .limit(1);
    const row = (data?.[0] as CommuterPassRow | undefined) ?? null;
    if (row) {
      setRoute(row.route);
      setMonthlyFee(row.monthly_fee);
      setPeriodMonths(row.period_months);
      setValidFrom(row.valid_from);
    }
  }, [profile]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: insErr } = await supabase.from("commuter_passes").insert({
      user_id: profile.id,
      route,
      monthly_fee: Number(monthlyFee) || 0,
      period_months: Number(periodMonths) || 1,
      valid_from: validFrom,
    });
    setSaving(false);
    if (insErr) {
      setError(insErr.message);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    await load();
  };

  const total = (Number(monthlyFee) || 0) * (Number(periodMonths) || 0);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <Link href="/commute" className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400">
          ← 交通費の設定に戻る
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50 sm:text-2xl">定期券の設定</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          定期券の経路、1か月あたりの金額、有効期間（か月）、開始日を登録します。保存するたびに新しいレコードが作られます（履歴管理）。
        </p>
      </header>

      <form
        className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950"
        onSubmit={handleSave}
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">経路</label>
          <input
            type="text"
            value={route}
            onChange={(e) => setRoute(e.target.value)}
            required
            placeholder="例: 東京駅 〜 渋谷駅（JR山手線）"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">1か月あたりの金額（円）</label>
            <input
              type="number"
              value={monthlyFee}
              onChange={(e) => setMonthlyFee(Number(e.target.value))}
              min={0}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">期間（か月）</label>
            <input
              type="number"
              value={periodMonths}
              onChange={(e) => setPeriodMonths(Number(e.target.value))}
              min={1}
              max={12}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">開始日</label>
            <input
              type="date"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {saving ? "保存中..." : "保存"}
          </button>
          {saved && <span className="text-xs text-emerald-600">保存しました</span>}
          {error && <span className="text-xs text-rose-600">{error}</span>}
        </div>
      </form>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">合計金額</h2>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          {formatYen(Number(monthlyFee) || 0)} × {periodMonths} か月 =
          <span className="ml-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">{formatYen(total)}</span>
        </p>
      </section>
    </div>
  );
}
