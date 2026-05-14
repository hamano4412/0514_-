"use client";

import { useState } from "react";
import { mockShiftRequests, workLocationLabel, type ShiftStatus } from "@/lib/mockData";
import { StatusBadge } from "@/components/StatusBadge";

export default function AdminShiftsPage() {
  const [requests, setRequests] = useState(mockShiftRequests);

  const updateStatus = (id: string, status: ShiftStatus) => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 sm:text-2xl">シフトの許可</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          申請を「承認 / 却下」します。承認されたシフトは一般カレンダーに「確定」として表示されます。
        </p>
      </header>

      <section className="overflow-x-auto rounded-lg border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800">
              <th className="pb-2 font-medium">申請者</th>
              <th className="pb-2 font-medium">日付</th>
              <th className="pb-2 font-medium">時間帯</th>
              <th className="pb-2 font-medium">勤務場所</th>
              <th className="pb-2 font-medium">ステータス</th>
              <th className="pb-2 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="py-2">{r.userName}</td>
                <td className="py-2">{r.date}</td>
                <td className="py-2 font-mono">{r.startTime} - {r.endTime}</td>
                <td className="py-2">{workLocationLabel[r.workLocation]}</td>
                <td className="py-2"><StatusBadge variant={r.status} /></td>
                <td className="py-2 text-right">
                  {r.status === "pending" ? (
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => updateStatus(r.id, "approved")}
                        className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                      >
                        承認
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStatus(r.id, "rejected")}
                        className="rounded-md bg-rose-600 px-3 py-1 text-xs font-medium text-white hover:bg-rose-700"
                      >
                        却下
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => updateStatus(r.id, "pending")}
                      className="text-xs text-zinc-500 underline"
                    >
                      取り消し
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
