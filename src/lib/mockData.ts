// モック専用データ。実装フェーズでは Supabase からの取得に差し替える。

export type ShiftStatus = "pending" | "approved" | "rejected";
export type LeaveStatus = "pending" | "approved" | "rejected";
export type PayslipStatus = "issued" | "paid";
export type WorkLocation = "office" | "remote";

export const workLocationLabel: Record<WorkLocation, string> = {
  office: "出社",
  remote: "在宅",
};

export type Attendance = {
  date: string; // YYYY-MM-DD
  clockIn: string | null; // HH:mm
  clockOut: string | null; // HH:mm
};

export type ShiftRequest = {
  id: string;
  userName: string;
  date: string;
  startTime: string;
  endTime: string;
  workLocation: WorkLocation;
  status: ShiftStatus;
};

export type LeaveRequest = {
  id: string;
  userName: string;
  date: string;
  reason: string;
  status: LeaveStatus;
};

export type Payslip = {
  id: string;
  userName: string;
  yearMonth: string; // YYYY-MM
  baseSalary: number;
  transportFee: number;
  deductions: number;
  total: number;
  status: PayslipStatus;
};

export type CommuteSegment = {
  route: string;
  roundTripFee: number;
};

export type Commute = {
  segments: CommuteSegment[];
};

export const commuteTotalFee = (c: Commute) =>
  c.segments.reduce((sum, s) => sum + (Number(s.roundTripFee) || 0), 0);

export type CommuterPass = {
  route: string;
  monthlyFee: number;
  periodMonths: number;
};

export const mockUser = {
  id: "u-001",
  name: "山田 太郎",
  email: "yamada@example.com",
};

export const mockCommute: Commute = {
  segments: [
    { route: "東京駅 〜 渋谷駅", roundTripFee: 320 },
  ],
};

export const mockCommuterPass: CommuterPass = {
  route: "東京駅 〜 渋谷駅（JR山手線）",
  monthlyFee: 12000,
  periodMonths: 6,
};

export const mockAttendances: Attendance[] = [
  { date: "2026-05-01", clockIn: "09:02", clockOut: "18:05" },
  { date: "2026-05-02", clockIn: "08:58", clockOut: "18:10" },
  { date: "2026-05-07", clockIn: "09:15", clockOut: "18:00" },
  { date: "2026-05-08", clockIn: "09:00", clockOut: "18:30" },
  { date: "2026-05-09", clockIn: "09:05", clockOut: "17:55" },
  { date: "2026-05-12", clockIn: "08:55", clockOut: "18:20" },
  { date: "2026-05-13", clockIn: "09:00", clockOut: "18:00" },
  { date: "2026-05-14", clockIn: "09:01", clockOut: null },
];

export const mockShiftRequests: ShiftRequest[] = [
  { id: "s-001", userName: "山田 太郎", date: "2026-05-20", startTime: "09:00", endTime: "18:00", workLocation: "office", status: "approved" },
  { id: "s-002", userName: "山田 太郎", date: "2026-05-21", startTime: "09:00", endTime: "18:00", workLocation: "remote", status: "approved" },
  { id: "s-003", userName: "山田 太郎", date: "2026-05-22", startTime: "10:00", endTime: "19:00", workLocation: "office", status: "pending" },
  { id: "s-004", userName: "佐藤 花子", date: "2026-05-20", startTime: "13:00", endTime: "22:00", workLocation: "office", status: "pending" },
  { id: "s-005", userName: "鈴木 一郎", date: "2026-05-23", startTime: "09:00", endTime: "18:00", workLocation: "remote", status: "pending" },
  { id: "s-006", userName: "山田 太郎", date: "2026-05-25", startTime: "09:00", endTime: "18:00", workLocation: "office", status: "rejected" },
];

export const mockLeaveRequests: LeaveRequest[] = [
  { id: "l-001", userName: "山田 太郎", date: "2026-05-30", reason: "私用のため", status: "approved" },
  { id: "l-002", userName: "山田 太郎", date: "2026-06-05", reason: "家族旅行", status: "pending" },
  { id: "l-003", userName: "佐藤 花子", date: "2026-05-28", reason: "通院", status: "pending" },
  { id: "l-004", userName: "鈴木 一郎", date: "2026-06-01", reason: "私用", status: "pending" },
];

export const mockPayslips: Payslip[] = [
  {
    id: "p-202604",
    userName: "山田 太郎",
    yearMonth: "2026-04",
    baseSalary: 280000,
    transportFee: 6400,
    deductions: 42000,
    total: 244400,
    status: "paid",
  },
  {
    id: "p-202605",
    userName: "山田 太郎",
    yearMonth: "2026-05",
    baseSalary: 280000,
    transportFee: 5120,
    deductions: 42000,
    total: 243120,
    status: "issued",
  },
];

export const mockOtherPayslips: Payslip[] = [
  {
    id: "p-202605-002",
    userName: "佐藤 花子",
    yearMonth: "2026-05",
    baseSalary: 260000,
    transportFee: 4800,
    deductions: 39000,
    total: 225800,
    status: "issued",
  },
  {
    id: "p-202605-003",
    userName: "鈴木 一郎",
    yearMonth: "2026-05",
    baseSalary: 300000,
    transportFee: 7200,
    deductions: 45000,
    total: 262200,
    status: "issued",
  },
];

export const formatYen = (n: number) => `¥${n.toLocaleString("ja-JP")}`;
