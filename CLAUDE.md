@AGENTS.md

# 勤怠管理アプリ

## プロジェクト概要

社内向けの勤怠管理 Web アプリケーション。一般従業員が打刻・申請を行い、管理者（社長）が承認・支払い処理を行う。

## 技術スタック

| 領域 | 採用技術 |
| --- | --- |
| フロントエンド | Next.js (App Router) + TypeScript |
| UI | React + Tailwind CSS |
| バックエンド | Supabase (PostgreSQL + Auth + Row Level Security) |
| 認証 | Supabase Auth（メール / パスワード） |
| PDF 生成 | クライアントサイド（jsPDF または react-pdf） |
| ホスティング | Vercel |
| パッケージマネージャ | npm |

## ユーザーロール

- `employee` — 一般従業員（打刻・各種申請を行う）
- `owner` — 管理者（社長）。`employee` の全機能に加えて承認系の管理画面にアクセス可能

ロールは Supabase の `profiles` テーブル等にカラムとして保持し、Row Level Security（RLS）で画面・データのアクセス制御を行う。

## 機能要件

### 一般ユーザー画面（6 機能）

| # | 機能 | 内容 |
| --- | --- | --- |
| 1 | 打刻 | 出勤 / 退勤の時刻を記録 |
| 2 | 交通費の設定 | 定期券 or 移動費を選択して登録（移動費は乗り換え対応） |
| 3 | シフトの申請 | 希望日・時間帯・出社/在宅を出して、承認待ちにする |
| 4 | シフトを見れるカレンダー | 確定したシフトを月カレンダーで一覧表示 |
| 5 | 有給申請 | 取得希望日と理由を出して、承認待ちにする |
| 6 | 給料明細の発行 | 当月の明細（基本給 + 交通費 − 控除）を画面表示 / PDF 化 |

### 管理者画面（3 機能、`owner` ロールでログイン時のみ表示）

| # | 機能 | 内容 |
| --- | --- | --- |
| 1 | シフトの許可 | 申請を「承認 / 却下」する。承認分は一般カレンダーに「確定」として表示 |
| 2 | 有給申請の許可 | 申請を「承認 / 却下」する。ステータスは一般側にも反映 |
| 3 | 給料明細の支払い完了 | 明細を「支払済」に変更する。一般側の明細にも「支払済」が表示される |

### 申請 ↔ 承認 のフロー

3 つの申請系機能は、すべて管理者の承認をもって一般側に反映される。

```
[一般] シフトの申請        →  [管理者] シフトの許可          →  一般カレンダーに「確定」として表示
[一般] 有給申請            →  [管理者] 有給申請の許可        →  一般側にステータス反映
[一般] 給料明細の発行      →  [管理者] 支払い完了            →  一般側の明細に「支払済」表示
```

## データモデル（初期案）

実装時に Supabase 上に作成するテーブルの想定。詳細スキーマは実装フェーズで確定する。

- `profiles` — ユーザー情報（id, full_name, role, base_salary, created_at）
- `commutes` — 通勤経路と往復金額（user_id, route, round_trip_fee）
- `commuter_passes` — 定期券（user_id, route, monthly_fee, period_months, valid_from）
- `attendances` — 打刻記録（user_id, clock_in, clock_out, date）
- `shift_requests` — シフト申請（user_id, date, start_time, end_time, work_location: office/remote, status: pending/approved/rejected, decided_by, decided_at）
- `leave_requests` — 有給申請（user_id, date, reason, status: pending/approved/rejected, decided_by, decided_at）
- `payslips` — 給料明細（user_id, year_month, base_salary, transport_fee, deductions, total, status: issued/paid, paid_at）

申請系テーブルは `status` カラムを共通的に持ち、承認時に状態遷移する。

## 画面構成

- `/login` — ログイン画面
- `/` — ダッシュボード（打刻ボタン、当月サマリ）
- `/commute` — 交通費設定（定期券 / 移動費の選択ハブ）
- `/commute/pass` — 定期券設定
- `/commute/transit` — 移動費設定（乗り換え対応）
- `/shifts/request` — シフト申請
- `/shifts/calendar` — シフトカレンダー（確定分の閲覧）
- `/leaves` — 有給申請
- `/payslips` — 給料明細（一覧 / PDF 出力）
- `/admin/shifts` — （owner）シフト承認
- `/admin/leaves` — （owner）有給承認
- `/admin/payslips` — （owner）支払い完了処理

## ディレクトリ構成

```
.
├── CLAUDE.md
├── src/
│   ├── app/
│   │   ├── (employee)/       # 一般ユーザー向け画面（route group）
│   │   ├── admin/            # 管理者画面
│   │   ├── login/            # ログイン画面
│   │   └── layout.tsx        # ルートレイアウト
│   ├── components/           # 共通 UI（Sidebar, RoleGuard, StatusBadge）
│   └── lib/
│       ├── mockData.ts       # 開発用モックデータ
│       └── useRole.ts        # ロール状態管理（モック）
├── public/
├── package.json
└── tsconfig.json
```

## 環境変数

`.env.local` に以下を設定（実際の値は Supabase ダッシュボードから取得）。

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # サーバー側でのみ使用
```

## 開発コマンド

```powershell
npm run dev       # 開発サーバー起動（http://localhost:3000）
npm run build     # 本番ビルド
npm run start     # 本番サーバー起動
npm run lint      # Lint 実行
```

## 設計・実装方針

- **モック → 実装の段階移行**: 現在は `src/lib/mockData.ts` に静的データを置き、`useRole` で localStorage ベースのロール管理。Supabase 接続後に置き換える。
- **認可は RLS で**: アプリ側の if 文ではなく、Supabase の Row Level Security をベースに「自分のデータしか見えない／owner だけが他人のデータを見える」を担保する。
- **日付/時刻は UTC で保存、表示時に JST 変換**: タイムゾーン取り違えを防ぐ。
- **金額はすべて整数（円）で保持**: 浮動小数点誤差を避ける。
- **申請系の状態遷移は `status` カラムで統一**: `pending` → `approved` / `rejected`、給料明細のみ `issued` → `paid`。
- **PDF は当月分のみその場で生成**: 永続保存は不要（必要になった時点で再検討）。
- **owner 画面は明示的にロールチェック**: ルートレイアウト側で `role !== 'owner'` ならリダイレクト。
- **モバイル対応**: iPhone 12 Pro Max（428px）含む小画面で動作。サイドバーは `< sm` でハンバーガー化。

## 進捗

- ✅ Next.js プロジェクト初期化（TypeScript + Tailwind）
- ✅ 全 12 ルートをモック状態で実装（ログイン・ダッシュボード・交通費2種・シフト・有給・給料明細・管理者3種）
- ✅ ロール切替・画面遷移
- ✅ モバイルレイアウト対応
- ⏭ Supabase プロジェクト作成、テーブル定義 / RLS 設定
- ⏭ 認証フロー実装（実データ連携）
- ⏭ 給料明細の PDF 出力（jsPDF）
- ⏭ Vercel デプロイ
