"use client";

import { useState } from "react";
import { mockShiftRequests, mockUser, workLocationLabel, type WorkLocation } from "@/lib/mockData";
import { StatusBadge } from "@/components/StatusBadge";

export default function ShiftRequestPage() {
  const [requests, setRequests] = useState(
    mockShiftRequests.filter((r) => r.userName === mockUser.name)
  );
  const [date, setDate] = useState("");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("18:00");
  const [workLocation, setWorkLocation] = useState<WorkLocation>("office");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    setRequests([
      ...requests,
      {
        id: `s-${Date.now()}`,
        userName: mockUser.name,
        date,
        startTime: start,
        endTime: end,
        workLocation,
        status: "pending",
      },
    ]);
    setDate("");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 sm:text-2xl">シフトの申請</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          希望日と時間帯、出社か在宅かを提出して、管理者の承認を待ちます。
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="grid gap-3 sm:grid-cols-4 sm:items-end">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium">希望日</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">開始</label>
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">終了</label>
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">勤務場所</label>
          <div className="flex gap-2">
            {(["office", "remote"] as WorkLocation[]).map((loc) => {
              const active = workLocation === loc;
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setWorkLocation(loc)}
                  className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                      : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                >
                  {workLocationLabel[loc]}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
        >
          申請する
        </button>
      </form>

      <section className="overflow-x-auto rounded-lg border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">申請履歴</h2>
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800">
              <th className="pb-2 font-medium">日付</th>
              <th className="pb-2 font-medium">時間帯</th>
              <th className="pb-2 font-medium">勤務場所</th>
              <th className="pb-2 font-medium">ステータス</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="py-2">{r.date}</td>
                <td className="py-2 font-mono">{r.startTime} - {r.endTime}</td>
                <td className="py-2">{workLocationLabel[r.workLocation]}</td>
                <td className="py-2"><StatusBadge variant={r.status} /></td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-zinc-500">申請はまだありません</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
