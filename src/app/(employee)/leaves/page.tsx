"use client";

import { useState } from "react";
import { mockLeaveRequests, mockUser } from "@/lib/mockData";
import { StatusBadge } from "@/components/StatusBadge";

export default function LeavesPage() {
  const [requests, setRequests] = useState(
    mockLeaveRequests.filter((l) => l.userName === mockUser.name)
  );
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !reason.trim()) return;
    setRequests([
      ...requests,
      {
        id: `l-${Date.now()}`,
        userName: mockUser.name,
        date,
        reason,
        status: "pending",
      },
    ]);
    setDate("");
    setReason("");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 sm:text-2xl">有給申請</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          取得希望日と理由を提出して、管理者の承認を待ちます。
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div>
          <label className="mb-1 block text-xs font-medium">取得希望日</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">理由</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="例: 私用のため"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
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
              <th className="pb-2 font-medium">理由</th>
              <th className="pb-2 font-medium">ステータス</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="py-2">{r.date}</td>
                <td className="py-2 text-zinc-600 dark:text-zinc-400">{r.reason}</td>
                <td className="py-2"><StatusBadge variant={r.status} /></td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={3} className="py-4 text-center text-zinc-500">申請はまだありません</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
