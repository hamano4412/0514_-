"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRole } from "@/lib/useRole";
import { type LeaveRequestRow } from "@/lib/db";
import { StatusBadge } from "@/components/StatusBadge";

export default function LeavesPage() {
  const { profile } = useRole();
  const [requests, setRequests] = useState<LeaveRequestRow[]>([]);
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("leave_requests")
      .select("*")
      .eq("user_id", profile.id)
      .order("leave_date", { ascending: false });
    setRequests((data ?? []) as LeaveRequestRow[]);
  }, [profile]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !date || !reason.trim()) return;
    setSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { error: insErr } = await supabase.from("leave_requests").insert({
      user_id: profile.id,
      leave_date: date,
      reason,
      status: "pending",
    });
    setSubmitting(false);
    if (insErr) {
      setError(insErr.message);
      return;
    }
    setDate("");
    setReason("");
    await load();
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
            required
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">理由</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            required
            placeholder="例: 私用のため"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        {error && <p className="text-xs text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {submitting ? "送信中..." : "申請する"}
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
                <td className="py-2">{r.leave_date}</td>
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
