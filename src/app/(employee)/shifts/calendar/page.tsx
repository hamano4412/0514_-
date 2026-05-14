"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRole } from "@/lib/useRole";
import {
  type ShiftRequestRow,
  trimSeconds,
  workLocationLabel,
  toYmd,
} from "@/lib/db";

type CalDay = {
  date: Date;
  inMonth: boolean;
  iso: string;
};

function buildCalendar(year: number, month: number): CalDay[] {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const days: CalDay[] = [];
  const start = new Date(year, month, 1 - startDay);
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push({ date: d, inMonth: d.getMonth() === month, iso: toYmd(d) });
  }
  return days;
}

export default function ShiftCalendarPage() {
  const { profile } = useRole();
  const [cursor, setCursor] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [shifts, setShifts] = useState<ShiftRequestRow[]>([]);
  const days = useMemo(() => buildCalendar(cursor.getFullYear(), cursor.getMonth()), [cursor]);

  const load = useCallback(async () => {
    if (!profile) return;
    const supabase = createClient();
    const from = toYmd(new Date(cursor.getFullYear(), cursor.getMonth(), 1));
    const to = toYmd(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0));
    const { data } = await supabase
      .from("shift_requests")
      .select("*")
      .eq("user_id", profile.id)
      .eq("status", "approved")
      .gte("shift_date", from)
      .lte("shift_date", to);
    setShifts((data ?? []) as ShiftRequestRow[]);
  }, [profile, cursor]);

  useEffect(() => {
    void load();
  }, [load]);

  const shiftsByDate = new Map(shifts.map((s) => [s.shift_date, s]));
  const monthLabel = `${cursor.getFullYear()}年 ${cursor.getMonth() + 1}月`;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 sm:text-2xl">シフトカレンダー</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">確定したシフトを月次で表示します。</p>
        </div>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="rounded-md border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            ← 前月
          </button>
          <span className="min-w-[7rem] text-center text-sm font-medium sm:min-w-[8rem]">{monthLabel}</span>
          <button
            type="button"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="rounded-md border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            翌月 →
          </button>
        </div>
      </header>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50 text-center text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
          {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
            <div key={d} className="py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((d) => {
            const shift = shiftsByDate.get(d.iso);
            return (
              <div
                key={d.iso}
                className={`min-h-[60px] border-b border-r border-zinc-100 p-1 text-[10px] sm:min-h-[80px] sm:p-2 sm:text-xs dark:border-zinc-900 ${
                  d.inMonth ? "" : "bg-zinc-50/60 text-zinc-400 dark:bg-zinc-900/40"
                }`}
              >
                <div className="font-mono">{d.date.getDate()}</div>
                {shift && (
                  <div
                    className={`mt-1 rounded px-1 py-0.5 text-[9px] sm:px-1.5 sm:text-[11px] ${
                      shift.work_location === "remote"
                        ? "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                    }`}
                  >
                    <div>{workLocationLabel[shift.work_location]}</div>
                    <div className="font-mono">{trimSeconds(shift.start_time)}-{trimSeconds(shift.end_time)}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-zinc-500">
        ※ <span className="rounded bg-emerald-100 px-1 text-emerald-800">緑</span> = 出社、
        <span className="ml-1 rounded bg-sky-100 px-1 text-sky-800">青</span> = 在宅。いずれも管理者が承認した確定シフトです。
      </p>
    </div>
  );
}
