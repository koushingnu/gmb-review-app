# GMB Review App

Googleマイビジネスのレビューを管理・分析するためのWebアプリケーションです。

## 機能

- レビュー一覧表示と検索
- AIによるレビュー分析とスコアリング
- グラフによる分析と可視化
- 店舗情報の管理
- Google OAuth認証

## 技術スタック

- **フレームワーク**: Next.js 14
- **データベース**: Supabase (PostgreSQL)
- **認証**: Google OAuth
- **AI**: OpenAI API
- **UI**: Material-UI (MUI)
- **グラフ**: Recharts
- **デプロイ**: Vercel

## 環境変数

以下の環境変数が必要です：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# Google API
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
GOOGLE_CLIENT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_PROJECT_ID=
```

## セットアップ

1. リポジトリをクローン

```bash
git clone https://github.com/yourusername/gmb-review-app.git
cd gmb-review-app
```

2. 依存関係をインストール

```bash
npm install
```

3. 環境変数を設定
   `.env.local`ファイルを作成し、必要な環境変数を設定

4. 開発サーバーを起動

```bash
npm run dev
```

## デプロイ時の注意点

1. **環境変数の設定**

   - Vercelのプロジェクト設定で全ての必要な環境変数を設定
   - Supabase URLとAnon Keyは`NEXT_PUBLIC_`プレフィックスが必要

2. **Google API設定**

   - OAuth同意画面の設定
   - 承認済みのリダイレクトURIの追加
   - 必要なAPIの有効化

3. **Supabase設定**
   - データベースのマイグレーション実行
   - RLSポリシーの設定

## 主な修正履歴

### 認証関連

- Google OAuth認証の実装
- リダイレクトURIの設定修正
- 認証状態の永続化対応

### データベース関連

- Supabaseテーブル構造の最適化
- マイグレーションファイルの整理
- RLSポリシーの追加

### UI/UX改善

- レスポンシブデザインの強化
- ローディング状態の表示改善
- エラーハンドリングの実装

### バグ修正

- `LABELS`定義の修正（グラフ表示エラー解決）
- クライアントコンポーネントのSuspenseバウンダリ対応
- 環境変数読み込みエラーの修正

## ライセンス

MIT
