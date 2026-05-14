"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRole } from "@/lib/useRole";
import {
  type AttendanceRow,
  type CommuteRow,
  formatHm,
  formatYen,
  monthRange,
  toYmd,
} from "@/lib/db";

export default function DashboardPage() {
  const { profile } = useRole();
  const [today] = useState(() => toYmd(new Date()));
  const [todayRow, setTodayRow] = useState<AttendanceRow | null>(null);
  const [monthAttendances, setMonthAttendances] = useState<AttendanceRow[]>([]);
  const [commutes, setCommutes] = useState<CommuteRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile) return;
    const supabase = createClient();
    const { from, to } = monthRange();

    const [attRes, commuteRes] = await Promise.all([
      supabase
        .from("attendances")
        .select("*")
        .eq("user_id", profile.id)
        .gte("work_date", from)
        .lte("work_date", to)
        .order("work_date", { ascending: true }),
      supabase
        .from("commutes")
        .select("*")
        .eq("user_id", profile.id)
        .order("sort_order", { ascending: true }),
    ]);

    const attendances = (attRes.data ?? []) as AttendanceRow[];
    setMonthAttendances(attendances);
    setTodayRow(attendances.find((a) => a.work_date === today) ?? null);
    setCommutes((commuteRes.data ?? []) as CommuteRow[]);
    setLoading(false);
  }, [profile, today]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleClockIn = async () => {
    if (!profile) return;
    const supabase = createClient();
    const nowIso = new Date().toISOString();
    const { error } = await supabase
      .from("attendances")
      .upsert(
        { user_id: profile.id, work_date: today, clock_in: nowIso },
        { onConflict: "user_id,work_date" },
      );
    if (!error) await load();
  };

  const handleClockOut = async () => {
    if (!profile || !todayRow) return;
    const supabase = createClient();
    const nowIso = new Date().toISOString();
    const { error } = await supabase
      .from("attendances")
      .update({ clock_out: nowIso })
      .eq("id", todayRow.id);
    if (!error) await load();
  };

  const workdaysThisMonth = monthAttendances.length;
  const segmentTotal = commutes.reduce((sum, c) => sum + c.round_trip_fee, 0);
  const transportTotal = workdaysThisMonth * segmentTotal;
  const routeLabel = commutes.length === 0 ? "未登録" : commutes.map((c) => c.route).join(" → ");

  return (
    <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
      <header>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 sm:text-2xl">ダッシュボード</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">本日: {today}</p>
      </header>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">打刻</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="rounded-md border border-zinc-200 p-3 text-center sm:p-4 dark:border-zinc-800">
            <p className="text-xs text-zinc-500">出勤</p>
            <p className="mt-2 text-2xl font-mono font-semibold text-zinc-900 sm:text-3xl dark:text-zinc-50">
              {formatHm(todayRow?.clock_in ?? null)}
            </p>
            <button
              type="button"
              disabled={!!todayRow?.clock_in || loading}
              onClick={handleClockIn}
              className="mt-3 w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
            >
              出勤
            </button>
          </div>
          <div className="rounded-md border border-zinc-200 p-3 text-center sm:p-4 dark:border-zinc-800">
            <p className="text-xs text-zinc-500">退勤</p>
            <p className="mt-2 text-2xl font-mono font-semibold text-zinc-900 sm:text-3xl dark:text-zinc-50">
              {formatHm(todayRow?.clock_out ?? null)}
            </p>
            <button
              type="button"
              disabled={!todayRow?.clock_in || !!todayRow?.clock_out || loading}
              onClick={handleClockOut}
              className="mt-3 w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
            >
              退勤
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        <SummaryCard label="今月の出勤日数" value={`${workdaysThisMonth} 日`} />
        <SummaryCard label="今月の交通費" value={formatYen(transportTotal)} />
        <SummaryCard label="通勤経路" value={routeLabel} />
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">直近の打刻履歴</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800">
                <th className="pb-2 font-medium">日付</th>
                <th className="pb-2 font-medium">出勤</th>
                <th className="pb-2 font-medium">退勤</th>
              </tr>
            </thead>
            <tbody>
              {monthAttendances.slice(-7).reverse().map((a) => (
                <tr key={a.id} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="py-2 text-zinc-700 dark:text-zinc-300">{a.work_date}</td>
                  <td className="py-2 font-mono text-zinc-700 dark:text-zinc-300">{formatHm(a.clock_in)}</td>
                  <td className="py-2 font-mono text-zinc-700 dark:text-zinc-300">{formatHm(a.clock_out)}</td>
                </tr>
              ))}
              {monthAttendances.length === 0 && !loading && (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-zinc-500">今月の打刻はまだありません</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{value}</p>
    </div>
  );
}
