# GMB Review App - プロジェクト完全ガイド

## 📋 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [システム構成](#システム構成)
3. [データフロー](#データフロー)
4. [認証フロー詳細](#認証フロー詳細)
5. [主要機能の解説](#主要機能の解説)
6. [ディレクトリ構造](#ディレクトリ構造)
7. [環境構築手順](#環境構築手順)
8. [トラブルシューティング](#トラブルシューティング)

---

## プロジェクト概要

### 🎯 このアプリは何をするもの？

**Google ビジネスプロフィール（旧 Google マイビジネス）のレビュー管理システム**

- Googleビジネスプロフィールに投稿されたレビューを自動取得
- レビューの分析・可視化（評価分布、トレンド、四半期比較など）
- レビューへの返信機能
- レビューのスコアリング（味、サービス、価格など複数の観点）

### 🏢 利用シーン

**飲食店「Halal Diyafa」のレビュー管理**

- オーナーがGoogleレビューを一元管理
- 返信が必要なレビューを把握
- 評価の傾向分析で改善点を発見
- 四半期ごとの評価推移を確認

---

## システム構成

### 技術スタック

```
┌─────────────────────────────────────────────────┐
│                  フロントエンド                    │
│  Next.js 15.3.1 + React + Material-UI (MUI)    │
│  - SSR/SSG対応                                   │
│  - App Router使用                                │
│  - クライアントサイドレンダリング                   │
└─────────────────────────────────────────────────┘
                        ↓↑
┌─────────────────────────────────────────────────┐
│                 バックエンド (API)                │
│  Next.js API Routes (/app/api/*)                │
│  - RESTful API                                   │
│  - サーバーサイド処理                              │
└─────────────────────────────────────────────────┘
        ↓↑                              ↓↑
┌──────────────────┐          ┌──────────────────┐
│  Google APIs     │          │    Supabase      │
│  - OAuth 2.0     │          │  - PostgreSQL    │
│  - Business      │          │  - Realtime      │
│    Profile API   │          │  - Storage       │
└──────────────────┘          └──────────────────┘
```

### 主要ライブラリ

| カテゴリ       | ライブラリ        | 用途                        |
| -------------- | ----------------- | --------------------------- |
| フレームワーク | Next.js 15.3.1    | Reactフレームワーク         |
| UI             | Material-UI (MUI) | UIコンポーネント            |
| データベース   | Supabase          | PostgreSQL + 認証           |
| Google API     | googleapis        | Google Business Profile API |
| グラフ         | Recharts          | データ可視化                |
| アニメーション | Framer Motion     | UIアニメーション            |

---

## データフロー

### 1. レビュー取得の流れ

```
┌──────────────┐
│   ユーザー    │
│ /reviews画面  │
└──────┬───────┘
       │ ①アクセス
       ↓
┌──────────────────────────────────────┐
│ ReviewsDashboard Component           │
│ - useEffect でトークンチェック開始    │
└──────┬───────────────────────────────┘
       │ ②トークン確認
       ↓
┌──────────────────────────────────────┐
│ /api/google/token-check              │
│ - Supabaseからトークン取得            │
│ - 有効期限チェック                     │
│ - 必要ならリフレッシュ                 │
└──────┬───────────────────────────────┘
       │ ③トークン有効 or 無効
       ↓
  ┌────┴────┐
  │   無効   │ ④再認証必要
  │         │→ アラートバナー表示
  │         │   「再認証」ボタン
  └─────────┘
       │
  ┌────┴────┐
  │   有効   │ ⑤レビューデータ取得
  └────┬────┘
       ↓
┌──────────────────────────────────────┐
│ /api/reviews                         │
│ - Supabaseからレビュー取得            │
│ - フィルター・ソート適用              │
└──────┬───────────────────────────────┘
       │ ⑥JSON レスポンス
       ↓
┌──────────────────────────────────────┐
│ ReviewsList Component                │
│ - レビュー一覧表示                     │
│ - 返信ボタン、詳細表示                │
└──────────────────────────────────────┘
```

### 2. レビュー同期の流れ

```
┌──────────────┐
│  ユーザー     │
│「同期」ボタン  │
└──────┬───────┘
       │ ①クリック
       ↓
┌──────────────────────────────────────┐
│ /api/reviews/sync                    │
│                                      │
│ ①Supabaseからトークン取得             │
│ ②Google Business Profile APIを呼び出し│
│ ③全レビューを取得（ページング対応）    │
│ ④各レビューをSupabaseに保存           │
│ ⑤GPT APIでスコア分析（オプション）     │
└──────┬───────────────────────────────┘
       │ ⑥同期完了レスポンス
       ↓
┌──────────────────────────────────────┐
│ ReviewsDashboard Component           │
│ - Snackbarで「○件更新しました」表示   │
│ - レビュー一覧を再取得                 │
└──────────────────────────────────────┘
```

---

## 認証フロー詳細

### Google OAuth 2.0 認証の完全フロー

```
【ステップ1：認証開始】
ユーザーがレビュー画面にアクセス
↓
/api/google/token-check でトークン確認
↓
トークンが無効 or 期限切れ
↓
画面上部にアラートバナー表示
「Google認証の有効期限が切れました。再認証を行ってください。」
[再認証ボタン]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【ステップ2：認証リクエスト】
ユーザーが「再認証」ボタンをクリック
↓
window.location.href = "/api/auth/google"
↓
/api/auth/google (route.js)
  - OAuth2クライアント初期化
  - スコープ: business.manage
  - access_type: offline (リフレッシュトークン取得のため)
  - prompt: consent (毎回同意画面表示)
↓
Google認証URLにリダイレクト
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=...
  &redirect_uri=http://localhost:3000/api/callback
  &scope=https://www.googleapis.com/auth/business.manage
  &access_type=offline
  &prompt=consent

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【ステップ3：Googleでの認証】
ユーザーがGoogleアカウントを選択
↓
権限承認画面
「このアプリがビジネスプロフィールにアクセスすることを許可しますか？」
↓
ユーザーが「許可」をクリック
↓
Googleが認証コード(code)を生成

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【ステップ4：コールバック処理】
Googleがリダイレクト
http://localhost:3000/api/callback?code=4/0AY0e-...
↓
/api/callback (route.js)
  1. URLから code パラメータを取得
  2. OAuth2クライアントで code をトークンに交換
     oauth2.getToken(code)
  3. レスポンス:
     {
       access_token: "ya29.a0AfH6...",
       refresh_token: "1//0gF3z...",
       expiry_date: 1234567890000
     }
  4. トークンをクエリパラメータに追加してリダイレクト
↓
リダイレクト先:
/admin/oauth/success?access_token=ya29...&refresh_token=1//0g...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【ステップ5：トークン保存】
/admin/oauth/success/page.jsx
  - OAuthCallback コンポーネントが実行

  1. URLからトークンを取得
     const access_token = searchParams.get("access_token")
     const refresh_token = searchParams.get("refresh_token")

  2. 既存トークンを削除（クリーンアップ）
     supabase.from("google_tokens").delete().not("id", "eq", 1)

  3. 新トークンをSupabaseに保存
     supabase.from("google_tokens").upsert({
       id: 1,
       access_token,
       refresh_token,
       expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000)
     })

  4. 保存成功メッセージ表示
     「認証が完了しました。リダイレクトします...」

  5. 1.5秒後に /reviews にリダイレクト

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【ステップ6：完了】
/reviews 画面に戻る
↓
再度 /api/google/token-check でトークン確認
↓
トークン有効 → アラート非表示
↓
レビューデータ取得 → 一覧表示
```

### トークンの自動更新フロー

```
【通常のAPI呼び出し時】
/api/reviews/sync などのAPI呼び出し
↓
getGoogleTokensFromDB() 関数
  1. Supabaseから最新トークン取得
  2. 有効期限チェック
     if (expires_at - now < 30分) {
       // 更新が必要
     }
  3. リフレッシュトークンで新しいアクセストークン取得
     POST https://oauth2.googleapis.com/token
     {
       client_id: ...,
       client_secret: ...,
       refresh_token: ...,
       grant_type: "refresh_token"
     }
  4. 新トークンをSupabaseに保存
  5. 新しいアクセストークンを返す
↓
Google API呼び出しに使用
```

### エラーハンドリング

| エラータイプ            | 原因                       | 対処                |
| ----------------------- | -------------------------- | ------------------- |
| `NO_TOKEN`              | トークンがDB に存在しない  | 再認証が必要        |
| `INVALID_REFRESH_TOKEN` | リフレッシュトークンが無効 | DBから削除 + 再認証 |
| `TOKEN_REFRESH_FAILED`  | トークン更新に失敗         | エラーログ + 再試行 |
| `UNEXPECTED_ERROR`      | 予期せぬエラー             | エラー詳細をログ    |

---

## 主要機能の解説

### 1. レビュー一覧画面 (`/reviews`)

**ファイル:** `src/app/reviews/page.jsx`

#### 主な機能

```javascript
// 1. トークンチェック（初回マウント時）
useEffect(() => {
  async function checkGoogleToken() {
    const res = await fetch("/api/google/token-check");
    if (res.status === 401) {
      setNeedsReauth(true); // 再認証バナー表示
    }
  }
  checkGoogleToken();
}, []);

// 2. レビュー取得
const loadReviews = async () => {
  const params = new URLSearchParams();
  if (fromDate && toDate) {
    params.set("from", fromDate);
    params.set("to", toDate);
  }
  params.set("sortBy", sortParam);
  if (filterRating) params.set("filterRating", filterRating);

  const res = await fetch(`/api/reviews?${params}`);
  const json = await res.json();
  setReviews(json.reviews);
};

// 3. 手動同期
const handleSync = async () => {
  const syncRes = await fetch("/api/reviews/sync");
  const syncJson = await syncRes.json();
  setNewCount(syncJson.新規件数);
  await loadReviews(); // 再取得
};
```

#### UIコンポーネント構成

```
ReviewsPage (Suspense wrapper)
└── ReviewsDashboard
    ├── Alert (認証エラー時のみ表示)
    │   └── Button「再認証」
    ├── DateFilterControls
    │   ├── 年度選択
    │   ├── 四半期選択
    │   ├── 並び替え
    │   ├── 全期間表示スイッチ
    │   └── 同期ボタン
    └── ReviewsList
        └── ReviewCard[] (各レビュー)
            ├── 評価 (星)
            ├── コメント
            ├── 日付
            ├── 返信ボタン
            └── 詳細スコア
```

### 2. ダッシュボード画面 (`/dashboard`)

**ファイル:** `src/app/dashboard/page.jsx`

#### 表示カード一覧

```javascript
<DashboardGrid>
  {/* 基本統計 */}
  <TotalReviewsCard /> // 総レビュー数
  <AverageRatingCard /> // 平均評価
  <ResponseRateCard /> // 返信率
  <PendingReviewsCard /> // 未返信レビュー数
  {/* トレンド分析 */}
  <MonthlyReviewsCard /> // 月別レビュー数
  <MonthlyComparisonCard /> // 前月比較
  <QuarterlyTrendCard /> // 四半期トレンド
</DashboardGrid>
```

各カードは独立したコンポーネントで、それぞれAPIエンドポイントからデータ取得

### 3. 分析機能 (`/analysis/*`)

#### 3-1. グラフ表示 (`/analysis/graphs`)

- レーダーチャート（味、サービス、価格などのバランス）
- 折れ線グラフ（評価トレンド）
- 評価分布グラフ

#### 3-2. スコア表示 (`/analysis/score`)

- 各レビューの詳細スコア
- カテゴリ別平均

#### 3-3. 四半期比較 (`/analysis/compare`)

- 期間ごとの評価推移
- 前四半期との比較

#### 3-4. サマリー (`/analysis/summary`)

- 全体的な傾向
- 改善点・強み

---

## ディレクトリ構造

### プロジェクト全体

```
gmb-review-app/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.jsx              # トップページ (→ /reviews にリダイレクト)
│   │   ├── layout.jsx            # 共通レイアウト
│   │   ├── providers.jsx         # Context Providers
│   │   │
│   │   ├── reviews/              # レビュー一覧
│   │   │   └── page.jsx          # メイン画面
│   │   │
│   │   ├── dashboard/            # ダッシュボード
│   │   │   └── page.jsx
│   │   │
│   │   ├── analysis/             # 分析機能
│   │   │   ├── graphs/page.jsx   # グラフ表示
│   │   │   ├── score/page.jsx    # スコア表示
│   │   │   ├── compare/page.jsx  # 四半期比較
│   │   │   └── summary/page.jsx  # サマリー
│   │   │
│   │   ├── admin/                # 管理機能
│   │   │   ├── page.jsx          # 管理画面
│   │   │   └── oauth/
│   │   │       └── success/
│   │   │           └── page.jsx  # 認証成功後の処理
│   │   │
│   │   └── api/                  # API Routes
│   │       ├── auth/
│   │       │   ├── route.js      # 認証開始 (旧)
│   │       │   └── google/
│   │       │       └── route.js  # 認証開始 (現行)
│   │       │
│   │       ├── callback/
│   │       │   └── route.js      # OAuth コールバック
│   │       │
│   │       ├── google/
│   │       │   ├── token-check/
│   │       │   │   └── route.js  # トークン確認・更新
│   │       │   └── test-reviews/
│   │       │       └── route.js  # テスト用
│   │       │
│   │       ├── reviews/
│   │       │   ├── route.js              # レビュー一覧取得
│   │       │   ├── sync/route.js         # Google同期
│   │       │   ├── score/route.js        # スコア計算
│   │       │   ├── summary/route.js      # サマリー生成
│   │       │   ├── comments/route.js     # コメント取得
│   │       │   ├── stats/
│   │       │   │   ├── route.js          # 統計情報
│   │       │   │   └── response/route.js # 返信率
│   │       │   └── with-reply/route.js   # 返信済みレビュー
│   │       │
│   │       ├── replies/
│   │       │   ├── send/route.js         # 返信送信
│   │       │   └── pending/route.js      # 未返信一覧
│   │       │
│   │       └── analysis/
│   │           ├── monthly/route.js              # 月別分析
│   │           ├── quarterly/route.js            # 四半期分析
│   │           ├── quarterly_compare/route.js    # 四半期比較
│   │           └── rating-distribution/route.js  # 評価分布
│   │
│   ├── components/               # Reactコンポーネント
│   │   ├── common/               # 共通コンポーネント
│   │   │   ├── LoadingScreen.jsx
│   │   │   ├── buttons/
│   │   │   ├── feedback/
│   │   │   └── inputs/
│   │   │
│   │   ├── layout/               # レイアウト
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── client/
│   │   │       └── ClientLayout.jsx
│   │   │
│   │   ├── dashboard/            # ダッシュボード用
│   │   │   ├── cards/            # 各種カード
│   │   │   └── layout/
│   │   │
│   │   └── charts/               # グラフコンポーネント
│   │       ├── BalanceRadarChart.jsx
│   │       ├── LineTrendChart.jsx
│   │       └── RatingDistributionChart.jsx
│   │
│   ├── features/                 # 機能別モジュール
│   │   ├── reviews/
│   │   │   ├── components/
│   │   │   │   ├── card/ReviewCard.tsx
│   │   │   │   ├── list/ReviewsList.jsx
│   │   │   │   ├── filters/DateFilterControls.jsx
│   │   │   │   └── OverallSummary.jsx
│   │   │   ├── api/
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   │
│   │   ├── analytics/
│   │   └── auth/
│   │
│   ├── lib/                      # ユーティリティ・設定
│   │   ├── supabase.js           # Supabaseクライアント (フロント用)
│   │   ├── supabaseAdmin.js      # Supabaseクライアント (サーバ用)
│   │   ├── googleAuth.js         # Google認証ヘルパー
│   │   ├── DateFilterContext.jsx # 日付フィルタContext
│   │   ├── theme.js              # MUIテーマ設定
│   │   ├── utils/
│   │   │   └── date.ts           # 日付ユーティリティ
│   │   └── tokens/
│   │       └── colors.js         # カラーパレット
│   │
│   ├── hooks/                    # カスタムフック
│   ├── types/                    # TypeScript型定義
│   └── styles/                   # スタイル
│
├── supabase/
│   └── migrations/               # DBマイグレーション
│       └── 20240307000000_update_quarterly_scores.sql
│
├── docs/                         # ドキュメント
│   ├── api-documentation.md
│   ├── database-schema.md
│   └── project-details.md
│
├── public/                       # 静的ファイル
├── scripts/                      # ユーティリティスクリプト
│
├── package.json                  # 依存関係
├── next.config.mjs               # Next.js設定
├── jsconfig.json                 # JavaScript設定
├── tsconfig.json                 # TypeScript設定
└── .env.local                    # 環境変数 (gitignore)
```

---

## 環境構築手順

### 1. 前提条件

- Node.js 18.17以上
- npm または yarn
- Googleアカウント（ビジネスプロフィール管理者）
- Supabaseアカウント

### 2. リポジトリのクローン

```bash
git clone https://github.com/koushingnu/gmb-review-app.git
cd gmb-review-app
```

### 3. 依存関係のインストール

```bash
npm install
```

### 4. Supabaseプロジェクトの作成

1. https://supabase.com にアクセス
2. 新規プロジェクト作成
3. Project URL と API Keys を控える

#### 必要なテーブルを作成

```sql
-- google_tokens テーブル
CREATE TABLE public.google_tokens (
  id INTEGER PRIMARY KEY DEFAULT 1,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.google_tokens DISABLE ROW LEVEL SECURITY;

-- reviews テーブル
CREATE TABLE public.reviews (
  id SERIAL PRIMARY KEY,
  review_id TEXT UNIQUE NOT NULL,
  reviewer_display_name TEXT,
  star_rating INTEGER,
  comment TEXT,
  create_time TIMESTAMPTZ,
  update_time TIMESTAMPTZ,
  reply TEXT,
  reply_update_time TIMESTAMPTZ,

  -- スコア
  taste_score INTEGER DEFAULT 0,
  service_score INTEGER DEFAULT 0,
  price_score INTEGER DEFAULT 0,
  location_score INTEGER DEFAULT 0,
  hygiene_score INTEGER DEFAULT 0,

  -- メタデータ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_reviews_create_time ON public.reviews(create_time DESC);
CREATE INDEX idx_reviews_star_rating ON public.reviews(star_rating);
CREATE INDEX idx_reviews_reply ON public.reviews(reply) WHERE reply IS NOT NULL;
```

### 5. Google Cloud Consoleの設定

#### 5-1. プロジェクト作成

1. https://console.cloud.google.com にアクセス
2. 新規プロジェクト作成

#### 5-2. APIの有効化

APIライブラリで以下を有効化：

- Google Business Profile API
- My Business Business Information API
- My Business Account Management API

#### 5-3. OAuth 2.0 認証情報の作成

1. 「APIとサービス」→「認証情報」
2. 「認証情報を作成」→「OAuth クライアント ID」
3. アプリケーションの種類：ウェブアプリケーション
4. 承認済みのリダイレクトURI：
   - `http://localhost:3000/api/callback`
   - `https://your-domain.com/api/callback` (本番用)
5. クライアントID と クライアントシークレット を控える

#### 5-4. OAuth同意画面の設定

1. 「OAuth同意画面」
2. ユーザータイプ：外部
3. スコープを追加：
   - `https://www.googleapis.com/auth/business.manage`
4. テストユーザーを追加（自分のGoogleアカウント）

### 6. 環境変数の設定

プロジェクトルートに `.env.local` を作成：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/callback

# 環境
NODE_ENV=development
```

### 7. 起動

```bash
# 開発サーバー起動
npm run dev

# ブラウザで開く
# http://localhost:3000
```

### 8. 初回認証

1. http://localhost:3000/reviews にアクセス
2. 「再認証」ボタンをクリック
3. Googleアカウントでログイン
4. 権限を許可
5. 自動的にレビュー画面に戻る

### 9. レビュー同期

1. レビュー一覧画面の「同期」ボタンをクリック
2. Google Business Profileからレビューを取得
3. 数秒〜数分で完了（レビュー数による）

---

## トラブルシューティング

### Q1: `invalid_scope` エラーが出る

**原因:**

- Google Cloud ConsoleでAPIが有効になっていない
- OAuth同意画面でスコープが承認されていない

**解決策:**

```bash
1. Google Cloud Console > APIライブラリ
   → Google Business Profile API を有効化

2. OAuth同意画面
   → スコープに business.manage を追加

3. ブラウザのキャッシュをクリア
   → 再度認証を試す
```

### Q2: `redirect_uri_mismatch` エラー

**原因:**

- Google Cloud Consoleに登録されているリダイレクトURIと実際のURIが一致しない

**解決策:**

```bash
1. エラーメッセージに表示されているURIをコピー
   例: http://localhost:3000/api/callback

2. Google Cloud Console > 認証情報
   → OAuth 2.0 クライアントIDを選択
   → 承認済みのリダイレクトURIに追加

3. 完全一致が必要（末尾のスラッシュにも注意）
```

### Q3: Supabase接続エラー

**原因:**

- 環境変数が正しく設定されていない
- テーブルが存在しない

**解決策:**

```bash
# 1. 環境変数を確認
cat .env.local

# 2. Supabase SQL Editorでテーブル確認
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

# 3. テーブルが無い場合は作成（上記SQL参照）
```

### Q4: トークンが保存されない

**原因:**

- `google_tokens`テーブルが存在しない
- RLS（Row Level Security）が有効

**解決策:**

```sql
-- テーブル作成
CREATE TABLE IF NOT EXISTS public.google_tokens (
  id INTEGER PRIMARY KEY DEFAULT 1,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS無効化
ALTER TABLE public.google_tokens DISABLE ROW LEVEL SECURITY;
```

### Q5: ローカルでは動くがVercelで動かない

**原因:**

- Vercelの環境変数が設定されていない
- リダイレクトURIが本番用になっていない

**解決策:**

```bash
1. Vercel > Settings > Environment Variables
   → 全ての環境変数を設定

2. GOOGLE_REDIRECT_URI を本番用に
   例: https://your-app.vercel.app/api/callback

3. Google Cloud Consoleに本番URLを登録

4. Vercelで再デプロイ
```

### Q6: レビューが取得できない

**原因:**

- Googleビジネスプロフィールへのアクセス権限がない
- アカウント・ロケーションIDが取得できない

**解決策:**

```bash
1. Googleビジネスプロフィールの管理者権限を確認
   → google.com/business で確認

2. テスト用エンドポイントで確認
   GET /api/google/test-reviews
   → コンソールログでアカウント情報を確認

3. 複数のロケーションがある場合
   → コードを修正して対象ロケーションを指定
```

### Q7: ビルドエラー `useSearchParams() should be wrapped in a suspense boundary`

**原因:**

- `useSearchParams()`を使用しているコンポーネントがSuspenseで囲まれていない

**解決策:**

```javascript
// ❌ 悪い例
export default function Page() {
  const searchParams = useSearchParams(); // エラー
  return <div>...</div>;
}

// ✅ 良い例
function PageContent() {
  const searchParams = useSearchParams(); // OK
  return <div>...</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <PageContent />
    </Suspense>
  );
}
```

---

## デプロイ手順

### Vercelへのデプロイ

```bash
# 1. Vercel CLIのインストール
npm i -g vercel

# 2. ログイン
vercel login

# 3. プロジェクトの初期化
vercel

# 4. 環境変数の設定
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add GOOGLE_REDIRECT_URI

# 5. 本番デプロイ
vercel --prod
```

### デプロイ後の確認事項

- [ ] 環境変数が全て設定されている
- [ ] Google Cloud Consoleに本番URLが登録されている
- [ ] Supabaseの接続が正常
- [ ] 認証フローが動作する
- [ ] レビューの取得・表示が正常

---

## まとめ

このプロジェクトは以下の流れで動作します：

1. **認証** → Google OAuthで認証し、トークンをSupabaseに保存
2. **同期** → Google Business Profile APIからレビューを取得しSupabaseに保存
3. **表示** → Supabaseからレビューを取得し、Material-UIで表示
4. **分析** → スコアリング・グラフ化で可視化
5. **返信** → レビューへの返信機能

**重要なポイント:**

- トークンは自動更新される（有効期限30分前に更新）
- リフレッシュトークンが無効になったら再認証が必要
- Supabaseの無料プランは90日間未使用で削除される
- 定期的なバックアップが推奨

**次のステップ:**

1. 環境構築を完了させる
2. 初回認証を行う
3. レビューを同期する
4. ダッシュボードで分析を確認する
5. 必要に応じて機能を追加・カスタマイズする

質問や問題があれば、このドキュメントのトラブルシューティングセクションを参照してください。
