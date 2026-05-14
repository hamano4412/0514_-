"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRole } from "@/lib/useRole";
import { mockUser } from "@/lib/mockData";

type NavItem = { href: string; label: string };

const employeeNav: NavItem[] = [
  { href: "/", label: "ダッシュボード（打刻）" },
  { href: "/commute", label: "交通費の設定" },
  { href: "/shifts/request", label: "シフトの申請" },
  { href: "/shifts/calendar", label: "シフトカレンダー" },
  { href: "/leaves", label: "有給申請" },
  { href: "/payslips", label: "給料明細" },
];

const adminNav: NavItem[] = [
  { href: "/admin/shifts", label: "シフトの許可" },
  { href: "/admin/leaves", label: "有給申請の許可" },
  { href: "/admin/payslips", label: "支払い完了処理" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, setRole, hydrated } = useRole();
  const [open, setOpen] = useState(false);

  // ルート変更時にモバイルメニューを閉じる
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    setRole(null);
    router.push("/login");
  };

  return (
    <>
      {/* モバイル用トップバー */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950 sm:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="メニューを開く"
          className="rounded-md p-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="17" y2="6" />
            <line x1="3" y1="10" x2="17" y2="10" />
            <line x1="3" y1="14" x2="17" y2="14" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">勤怠管理</span>
        <span className="w-9" />
      </div>

      {/* オーバーレイ（モバイルでメニュー開時） */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 sm:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* サイドバー本体 */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-zinc-200 bg-white transition-transform dark:border-zinc-800 dark:bg-zinc-950 sm:static sm:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">勤怠管理</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
              <span>{mockUser.name}</span>
              <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {hydrated ? (role === "owner" ? "管理者" : role === "employee" ? "一般" : "未ログイン") : "..."}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="メニューを閉じる"
            className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 sm:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="4" x2="14" y2="14" />
              <line x1="14" y1="4" x2="4" y2="14" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">一般機能</p>
          <ul className="space-y-1">
            {employeeNav.map((item) => (
              <li key={item.href}>
                <NavLink href={item.href} pathname={pathname} label={item.label} />
              </li>
            ))}
          </ul>

          {hydrated && role === "owner" && (
            <>
              <p className="mt-6 px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                管理者機能
              </p>
              <ul className="space-y-1">
                {adminNav.map((item) => (
                  <li key={item.href}>
                    <NavLink href={item.href} pathname={pathname} label={item.label} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </nav>

        <div className="border-t border-zinc-200 px-3 py-3 dark:border-zinc-800">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-md px-3 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            ログアウト
          </button>
        </div>
      </aside>
    </>
  );
}

function NavLink({ href, pathname, label }: { href: string; pathname: string | null; label: string }) {
  const active = pathname === href || (href !== "/" && pathname?.startsWith(href));
  return (
    <Link
      href={href}
      className={`block rounded-md px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      }`}
    >
      {label}
    </Link>
  );
}
