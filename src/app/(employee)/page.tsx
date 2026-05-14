"use client";

import { useState } from "react";
import { mockAttendances, mockCommute, formatYen, commuteTotalFee } from "@/lib/mockData";

export default function DashboardPage() {
  const [today] = useState(() => mockAttendances[mockAttendances.length - 1]);
  const [clockIn, setClockIn] = useState<string | null>(today.clockIn);
  const [clockOut, setClockOut] = useState<string | null>(today.clockOut);

  const now = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const workdaysThisMonth = mockAttendances.length;
  const transportTotal = workdaysThisMonth * commuteTotalFee(mockCommute);
  const routeLabel = mockCommute.segments.map((s) => s.route).join(" → ");

  return (
    <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
      <header>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 sm:text-2xl">ダッシュボード</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">本日: {today.date}</p>
      </header>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">打刻</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="rounded-md border border-zinc-200 p-3 text-center sm:p-4 dark:border-zinc-800">
            <p className="text-xs text-zinc-500">出勤</p>
            <p className="mt-2 text-2xl font-mono font-semibold text-zinc-900 sm:text-3xl dark:text-zinc-50">
              {clockIn ?? "--:--"}
            </p>
            <button
              type="button"
              disabled={!!clockIn}
              onClick={() => setClockIn(now())}
              className="mt-3 w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
            >
              出勤
            </button>
          </div>
          <div className="rounded-md border border-zinc-200 p-3 text-center sm:p-4 dark:border-zinc-800">
            <p className="text-xs text-zinc-500">退勤</p>
            <p className="mt-2 text-2xl font-mono font-semibold text-zinc-900 sm:text-3xl dark:text-zinc-50">
              {clockOut ?? "--:--"}
            </p>
            <button
              type="button"
              disabled={!clockIn || !!clockOut}
              onClick={() => setClockOut(now())}
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
              {mockAttendances.slice(-7).reverse().map((a) => (
                <tr key={a.date} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="py-2 text-zinc-700 dark:text-zinc-300">{a.date}</td>
                  <td className="py-2 font-mono text-zinc-700 dark:text-zinc-300">{a.clockIn ?? "--:--"}</td>
                  <td className="py-2 font-mono text-zinc-700 dark:text-zinc-300">{a.clockOut ?? "--:--"}</td>
                </tr>
              ))}
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
