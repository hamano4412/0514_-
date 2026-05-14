// Supabase テーブルの行型（snake_case のまま、API レスポンス想定）
// アプリ内では必要に応じて camelCase に変換する。

export type ShiftStatus = "pending" | "approved" | "rejected";
export type LeaveStatus = "pending" | "approved" | "rejected";
export type PayslipStatus = "issued" | "paid";
export type WorkLocation = "office" | "remote";

export const workLocationLabel: Record<WorkLocation, string> = {
  office: "出社",
  remote: "在宅",
};

export type ProfileRow = {
  id: string;
  full_name: string;
  role: "employee" | "owner";
  base_salary: number;
  created_at: string;
  updated_at: string;
};

export type CommuteRow = {
  id: string;
  user_id: string;
  route: string;
  round_trip_fee: number;
  sort_order: number;
  created_at: string;
};

export type CommuterPassRow = {
  id: string;
  user_id: string;
  route: string;
  monthly_fee: number;
  period_months: number;
  valid_from: string; // YYYY-MM-DD
  created_at: string;
};

export type AttendanceRow = {
  id: string;
  user_id: string;
  work_date: string; // YYYY-MM-DD
  clock_in: string | null; // ISO timestamp
  clock_out: string | null;
  created_at: string;
  updated_at: string;
};

export type ShiftRequestRow = {
  id: string;
  user_id: string;
  shift_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm:ss
  end_time: string;
  work_location: WorkLocation;
  status: ShiftStatus;
  decided_by: string | null;
  decided_at: string | null;
  created_at: string;
  // join: 管理者画面で profiles(full_name) を引いた時用
  profiles?: { full_name: string } | null;
};

export type LeaveRequestRow = {
  id: string;
  user_id: string;
  leave_date: string;
  reason: string;
  status: LeaveStatus;
  decided_by: string | null;
  decided_at: string | null;
  created_at: string;
  profiles?: { full_name: string } | null;
};

export type PayslipRow = {
  id: string;
  user_id: string;
  year_month: string; // YYYY-MM
  base_salary: number;
  transport_fee: number;
  deductions: number;
  total: number;
  status: PayslipStatus;
  paid_at: string | null;
  created_at: string;
  profiles?: { full_name: string } | null;
};

export const formatYen = (n: number) => `¥${n.toLocaleString("ja-JP")}`;

// timestamptz から HH:mm 表示
export const formatHm = (iso: string | null): string => {
  if (!iso) return "--:--";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

// time 列（"HH:mm:ss"）→ "HH:mm"
export const trimSeconds = (t: string | null): string => {
  if (!t) return "";
  return t.slice(0, 5);
};

// YYYY-MM-DD（ローカル時刻基準）
export const toYmd = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// 当月の最初と最後（YYYY-MM-DD）
export const monthRange = (d: Date = new Date()): { from: string; to: string; ym: string } => {
  const y = d.getFullYear();
  const m = d.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  return { from: toYmd(first), to: toYmd(last), ym: `${y}-${String(m + 1).padStart(2, "0")}` };
};
