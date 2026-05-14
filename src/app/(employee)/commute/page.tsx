import Link from "next/link";

const choices = [
  {
    href: "/commute/pass",
    title: "定期券の設定",
    description: "経路、1か月あたりの金額、期間を登録します。月額 × 期間の合計金額を表示します。",
  },
  {
    href: "/commute/transit",
    title: "移動費の設定",
    description: "通勤経路と往復金額を登録します（乗り換え対応）。打刻日数分が当月の交通費に積み上がります。",
  },
];

export default function CommuteHubPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 sm:text-2xl">交通費の設定</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          設定する種別を選択してください。
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {choices.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="block rounded-lg border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
          >
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{c.title}</h2>
            <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{c.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
