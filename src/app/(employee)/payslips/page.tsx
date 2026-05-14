"use client";

import { useState } from "react";
import { mockPayslips, mockUser, formatYen, type Payslip } from "@/lib/mockData";
import { StatusBadge } from "@/components/StatusBadge";

export default function PayslipsPage() {
  const myPayslips = mockPayslips.filter((p) => p.userName === mockUser.name);
  const [selected, setSelected] = useState<Payslip | null>(myPayslips[myPayslips.length - 1] ?? null);

  const handlePdf = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 sm:text-2xl">給料明細</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          月次の明細を画面表示・PDF 化できます。管理者が支払いを完了するとステータスが「支払済」に変わります。
        </p>
      </header>

      <section className="overflow-x-auto rounded-lg border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">明細一覧</h2>
        <table className="w-full min-w-[440px] text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800">
              <th className="pb-2 font-medium">対象月</th>
              <th className="pb-2 font-medium">支給額</th>
              <th className="pb-2 font-medium">ステータス</th>
              <th className="pb-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {myPayslips.map((p) => (
              <tr key={p.id} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="py-2">{p.yearMonth}</td>
                <td className="py-2 font-mono">{formatYen(p.total)}</td>
                <td className="py-2"><StatusBadge variant={p.status} /></td>
                <td className="py-2 text-right">
                  <button
                    type="button"
                    onClick={() => setSelected(p)}
                    className="text-xs text-zinc-700 underline hover:text-zinc-900 dark:text-zinc-300"
                  >
                    表示
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {selected && (
        <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-8 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">{selected.yearMonth} 給料明細</h2>
              <p className="text-sm text-zinc-500">{selected.userName} 様</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge variant={selected.status} />
              <button
                type="button"
                onClick={handlePdf}
                className="rounded-md border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                PDF / 印刷
              </button>
            </div>
          </div>
          <dl className="space-y-2 text-sm">
            <Row label="基本給" value={formatYen(selected.baseSalary)} />
            <Row label="交通費" value={formatYen(selected.transportFee)} />
            <Row label="控除" value={`- ${formatYen(selected.deductions)}`} />
            <div className="my-2 border-t border-zinc-200 dark:border-zinc-800" />
            <Row label="差引支給額" value={formatYen(selected.total)} bold />
          </dl>
        </section>
      )}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-zinc-600 dark:text-zinc-400">{label}</dt>
      <dd className={`font-mono ${bold ? "text-lg font-semibold" : ""}`}>{value}</dd>
    </div>
  );
}
