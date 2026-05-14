"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRole } from "@/lib/useRole";
import { type CommuteRow, formatYen, monthRange } from "@/lib/db";

type DraftSegment = { id?: string; route: string; round_trip_fee: number };

export default function TransitPage() {
  const { profile } = useRole();
  const [segments, setSegments] = useState<DraftSegment[]>([{ route: "", round_trip_fee: 0 }]);
  const [workdays, setWorkdays] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile) return;
    const supabase = createClient();
    const { from, to } = monthRange();

    const [commuteRes, attRes] = await Promise.all([
      supabase
        .from("commutes")
        .select("*")
        .eq("user_id", profile.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("attendances")
        .select("id", { count: "exact", head: true })
        .eq("user_id", profile.id)
        .gte("work_date", from)
        .lte("work_date", to),
    ]);

    const rows = (commuteRes.data ?? []) as CommuteRow[];
    setSegments(
      rows.length === 0
        ? [{ route: "", round_trip_fee: 0 }]
        : rows.map((r) => ({ id: r.id, route: r.route, round_trip_fee: r.round_trip_fee })),
    );
    setWorkdays(attRes.count ?? 0);
  }, [profile]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateSegment = (i: number, patch: Partial<DraftSegment>) => {
    setSegments(segments.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };
  const addSegment = () => setSegments([...segments, { route: "", round_trip_fee: 0 }]);
  const removeSegment = (i: number) => {
    if (segments.length <= 1) return;
    setSegments(segments.filter((_, idx) => idx !== i));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();
    // シンプルな実装: 既存を全削除 → 新規 INSERT
    const { error: delErr } = await supabase.from("commutes").delete().eq("user_id", profile.id);
    if (delErr) {
      setError(delErr.message);
      setSaving(false);
      return;
    }
    const validSegments = segments.filter((s) => s.route.trim() !== "");
    if (validSegments.length > 0) {
      const { error: insErr } = await supabase.from("commutes").insert(
        validSegments.map((s, i) => ({
          user_id: profile.id,
          route: s.route,
          round_trip_fee: Number(s.round_trip_fee) || 0,
          sort_order: i,
        })),
      );
      if (insErr) {
        setError(insErr.message);
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    await load();
  };

  const segmentTotal = segments.reduce((sum, s) => sum + (Number(s.round_trip_fee) || 0), 0);
  const monthlyTotal = workdays * segmentTotal;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <Link href="/commute" className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400">
          ← 交通費の設定に戻る
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50 sm:text-2xl">移動費の設定</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          通勤経路と往復金額を登録します。乗り換えがある場合は経路を追加してください。打刻日数分が当月の交通費に積み上がります。
        </p>
      </header>

      <form
        className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950"
        onSubmit={handleSave}
      >
        <div className="space-y-3">
          {segments.map((seg, i) => (
            <div key={i} className="rounded-md border border-zinc-200 p-3 sm:p-4 dark:border-zinc-800">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500">
                  {i === 0 ? "経路 1" : `経路 ${i + 1}（乗り換え）`}
                </span>
                {segments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSegment(i)}
                    className="text-xs text-rose-600 hover:underline"
                  >
                    削除
                  </button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">通勤経路</label>
                  <input
                    type="text"
                    value={seg.route}
                    onChange={(e) => updateSegment(i, { route: e.target.value })}
                    placeholder="例: 東京駅 〜 渋谷駅"
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">往復金額（円）</label>
                  <input
                    type="number"
                    value={seg.round_trip_fee}
                    onChange={(e) => updateSegment(i, { round_trip_fee: Number(e.target.value) })}
                    min={0}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addSegment}
          className="w-full rounded-md border border-dashed border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          + 乗り換えを追加
        </button>

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
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">当月の交通費</h2>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          1 日の往復合計: <span className="font-mono font-semibold">{formatYen(segmentTotal)}</span>
        </p>
        <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
          {workdays} 日 × {formatYen(segmentTotal)} =
          <span className="ml-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">{formatYen(monthlyTotal)}</span>
        </p>
      </section>
    </div>
  );
}
