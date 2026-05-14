"use client";

import { useState } from "react";
import { mockPayslips, mockOtherPayslips, formatYen } from "@/lib/mockData";
import { StatusBadge } from "@/components/StatusBadge";

export default function AdminPayslipsPage() {
  const [payslips, setPayslips] = useState([...mockPayslips, ...mockOtherPayslips]);

  const markPaid = (id: string) => {
    setPayslips(payslips.map((p) => (p.id === id ? { ...p, status: "paid" as const } : p)));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 sm:text-2xl">支払い完了処理</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          給料明細を「支払済」に変更します。一般ユーザー側の明細にも反映されます。
        </p>
      </header>

      <section className="overflow-x-auto rounded-lg border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800">
              <th className="pb-2 font-medium">対象月</th>
              <th className="pb-2 font-medium">対象者</th>
              <th className="pb-2 font-medium">基本給</th>
              <th className="pb-2 font-medium">交通費</th>
              <th className="pb-2 font-medium">控除</th>
              <th className="pb-2 font-medium">差引支給額</th>
              <th className="pb-2 font-medium">ステータス</th>
              <th className="pb-2 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {payslips.map((p) => (
              <tr key={p.id} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="py-2">{p.yearMonth}</td>
                <td className="py-2">{p.userName}</td>
                <td className="py-2 font-mono">{formatYen(p.baseSalary)}</td>
                <td className="py-2 font-mono">{formatYen(p.transportFee)}</td>
                <td className="py-2 font-mono">{formatYen(p.deductions)}</td>
                <td className="py-2 font-mono font-semibold">{formatYen(p.total)}</td>
                <td className="py-2"><StatusBadge variant={p.status} /></td>
                <td className="py-2 text-right">
                  {p.status === "issued" ? (
                    <button
                      type="button"
                      onClick={() => markPaid(p.id)}
                      className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                    >
                      支払い完了
                    </button>
                  ) : (
                    <span className="text-xs text-zinc-500">完了済</span>
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
