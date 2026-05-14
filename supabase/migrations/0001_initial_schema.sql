-- ============================================================
-- 勤怠管理アプリ 初期スキーマ + RLS
-- 実行方法: Supabase Dashboard → SQL Editor → New query → 全文貼り付け → Run
-- ============================================================

-- ------------------------------------------------------------
-- 1. profiles: auth.users と 1:1 で従業員情報を持つ
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text not null,
  role         text not null check (role in ('employee', 'owner')) default 'employee',
  base_salary  integer not null default 0 check (base_salary >= 0),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. commutes: 移動費（往復金額）。乗り換えの数だけ複数行
-- ------------------------------------------------------------
create table if not exists public.commutes (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  route           text not null,
  round_trip_fee  integer not null check (round_trip_fee >= 0),
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now()
);
create index if not exists commutes_user_id_idx on public.commutes(user_id);

-- ------------------------------------------------------------
-- 3. commuter_passes: 定期券（経路 + 月額 + 期間）
-- ------------------------------------------------------------
create table if not exists public.commuter_passes (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  route          text not null,
  monthly_fee    integer not null check (monthly_fee >= 0),
  period_months  integer not null check (period_months > 0 and period_months <= 12),
  valid_from     date not null default current_date,
  created_at     timestamptz not null default now()
);
create index if not exists commuter_passes_user_id_idx on public.commuter_passes(user_id);

-- ------------------------------------------------------------
-- 4. attendances: 打刻（1日1行）
-- ------------------------------------------------------------
create table if not exists public.attendances (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  work_date   date not null,
  clock_in    timestamptz,
  clock_out   timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, work_date)
);
create index if not exists attendances_user_date_idx on public.attendances(user_id, work_date);

-- ------------------------------------------------------------
-- 5. shift_requests: シフト申請
-- ------------------------------------------------------------
create table if not exists public.shift_requests (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  shift_date      date not null,
  start_time      time not null,
  end_time        time not null,
  work_location   text not null check (work_location in ('office', 'remote')) default 'office',
  status          text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
  decided_by      uuid references public.profiles(id),
  decided_at      timestamptz,
  created_at      timestamptz not null default now()
);
create index if not exists shift_requests_user_id_idx on public.shift_requests(user_id);
create index if not exists shift_requests_status_idx on public.shift_requests(status);

-- ------------------------------------------------------------
-- 6. leave_requests: 有給申請
-- ------------------------------------------------------------
create table if not exists public.leave_requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  leave_date  date not null,
  reason      text not null,
  status      text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
  decided_by  uuid references public.profiles(id),
  decided_at  timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists leave_requests_user_id_idx on public.leave_requests(user_id);
create index if not exists leave_requests_status_idx on public.leave_requests(status);

-- ------------------------------------------------------------
-- 7. payslips: 給料明細
-- ------------------------------------------------------------
create table if not exists public.payslips (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  year_month     text not null check (year_month ~ '^[0-9]{4}-[0-9]{2}$'),
  base_salary    integer not null check (base_salary >= 0),
  transport_fee  integer not null default 0 check (transport_fee >= 0),
  deductions     integer not null default 0 check (deductions >= 0),
  total          integer not null,
  status         text not null check (status in ('issued', 'paid')) default 'issued',
  paid_at        timestamptz,
  created_at     timestamptz not null default now(),
  unique (user_id, year_month)
);
create index if not exists payslips_user_id_idx on public.payslips(user_id);

-- ============================================================
-- ヘルパー: 現在ユーザーが owner かどうか（RLS 内で再帰させないため SECURITY DEFINER）
-- ============================================================
create or replace function public.is_owner()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'owner'
  );
$$;

-- ============================================================
-- トリガ: auth.users への INSERT で profiles を自動作成
-- 新規ユーザーは role = 'employee' で作られる
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'employee'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- RLS 有効化
-- ============================================================
alter table public.profiles         enable row level security;
alter table public.commutes         enable row level security;
alter table public.commuter_passes  enable row level security;
alter table public.attendances      enable row level security;
alter table public.shift_requests   enable row level security;
alter table public.leave_requests   enable row level security;
alter table public.payslips         enable row level security;

-- ============================================================
-- ポリシー定義
-- 共通方針: 自分のデータは CRUD 可能、owner は他人のデータも参照/承認可能
-- ============================================================

-- profiles -----------------------------------------------------
drop policy if exists "profiles_select_self_or_owner" on public.profiles;
create policy "profiles_select_self_or_owner" on public.profiles
  for select using (id = auth.uid() or public.is_owner());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "profiles_update_owner" on public.profiles;
create policy "profiles_update_owner" on public.profiles
  for update using (public.is_owner()) with check (public.is_owner());

-- commutes -----------------------------------------------------
drop policy if exists "commutes_self_all" on public.commutes;
create policy "commutes_self_all" on public.commutes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "commutes_owner_select" on public.commutes;
create policy "commutes_owner_select" on public.commutes
  for select using (public.is_owner());

-- commuter_passes ----------------------------------------------
drop policy if exists "passes_self_all" on public.commuter_passes;
create policy "passes_self_all" on public.commuter_passes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "passes_owner_select" on public.commuter_passes;
create policy "passes_owner_select" on public.commuter_passes
  for select using (public.is_owner());

-- attendances --------------------------------------------------
drop policy if exists "attendances_self_all" on public.attendances;
create policy "attendances_self_all" on public.attendances
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "attendances_owner_select" on public.attendances;
create policy "attendances_owner_select" on public.attendances
  for select using (public.is_owner());

-- shift_requests -----------------------------------------------
drop policy if exists "shifts_select_self_or_owner" on public.shift_requests;
create policy "shifts_select_self_or_owner" on public.shift_requests
  for select using (user_id = auth.uid() or public.is_owner());

drop policy if exists "shifts_insert_self" on public.shift_requests;
create policy "shifts_insert_self" on public.shift_requests
  for insert with check (user_id = auth.uid());

-- 自分の pending 申請は取り下げ可（status は変えない）
drop policy if exists "shifts_update_self_pending" on public.shift_requests;
create policy "shifts_update_self_pending" on public.shift_requests
  for update using (user_id = auth.uid() and status = 'pending');

-- owner は承認・却下できる
drop policy if exists "shifts_update_owner" on public.shift_requests;
create policy "shifts_update_owner" on public.shift_requests
  for update using (public.is_owner()) with check (public.is_owner());

-- leave_requests -----------------------------------------------
drop policy if exists "leaves_select_self_or_owner" on public.leave_requests;
create policy "leaves_select_self_or_owner" on public.leave_requests
  for select using (user_id = auth.uid() or public.is_owner());

drop policy if exists "leaves_insert_self" on public.leave_requests;
create policy "leaves_insert_self" on public.leave_requests
  for insert with check (user_id = auth.uid());

drop policy if exists "leaves_update_self_pending" on public.leave_requests;
create policy "leaves_update_self_pending" on public.leave_requests
  for update using (user_id = auth.uid() and status = 'pending');

drop policy if exists "leaves_update_owner" on public.leave_requests;
create policy "leaves_update_owner" on public.leave_requests
  for update using (public.is_owner()) with check (public.is_owner());

-- payslips -----------------------------------------------------
drop policy if exists "payslips_select_self_or_owner" on public.payslips;
create policy "payslips_select_self_or_owner" on public.payslips
  for select using (user_id = auth.uid() or public.is_owner());

drop policy if exists "payslips_owner_all" on public.payslips;
create policy "payslips_owner_all" on public.payslips
  for all using (public.is_owner()) with check (public.is_owner());

-- ============================================================
-- メモ:
--   - 新規ユーザーは全員 'employee' で作られます
--   - owner に昇格させる場合は SQL Editor で以下を実行:
--       update public.profiles set role = 'owner' where id = '<対象ユーザーの uuid>';
--     uuid は Supabase Dashboard → Authentication → Users から確認できます
-- ============================================================
