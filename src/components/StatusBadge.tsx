type Variant = "pending" | "approved" | "rejected" | "issued" | "paid";

const labels: Record<Variant, string> = {
  pending: "承認待ち",
  approved: "承認",
  rejected: "却下",
  issued: "未払い",
  paid: "支払済",
};

const styles: Record<Variant, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  rejected: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
  issued: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
};

export function StatusBadge({ variant }: { variant: Variant }) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${styles[variant]}`}>
      {labels[variant]}
    </span>
  );
}
