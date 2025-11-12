# Supabase移行 & Google OAuth エラー解決チェックリスト

## ✅ 完了済み
- [x] `supabaseAdmin.js`の環境変数名を`NEXT_PUBLIC_SUPABASE_URL`に統一
- [x] Googleスコープを`business.manage`のみに統一

## 🔧 要確認・実施事項

### 1. Supabase 接続確認
```bash
# .env.local ファイルに以下を設定
NEXT_PUBLIC_SUPABASE_URL=https://oandetwzkdyrhqfieutg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Console > Project Settings > API の anon key>
SUPABASE_SERVICE_ROLE_KEY=<Console の service_role>
```

### 2. Supabase テーブル存在確認
以下のSQLをSupabase SQL Editorで実行：
```sql
-- google_tokens テーブルの確認
SELECT * FROM pg_tables WHERE schemaname = 'public' AND tablename = 'google_tokens';

-- テーブルが存在しない場合は作成
CREATE TABLE IF NOT EXISTS public.google_tokens (
  id INTEGER PRIMARY KEY DEFAULT 1,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLSを無効化（管理用テーブルのため）
ALTER TABLE public.google_tokens DISABLE ROW LEVEL SECURITY;

-- reviews テーブルの確認
SELECT count(*) FROM public.reviews;
```

### 3. Google Cloud Console 設定確認

#### 3-1. API有効化
- [ ] Google Business Profile API
- [ ] My Business Business Information API  
- [ ] My Business Account Management API

**確認方法:**
https://console.cloud.google.com/apis/library

#### 3-2. OAuth同意画面
- [ ] スコープに `https://www.googleapis.com/auth/business.manage` を追加
- [ ] テストユーザーに `info@halal-diyafa.tokyo` を追加

**確認方法:**
https://console.cloud.google.com/apis/credentials/consent

#### 3-3. 認証情報
- [ ] OAuth 2.0 クライアントIDの承認済みリダイレクトURIに以下を追加：
  - `http://localhost:3000/api/callback`
  - `https://gmb-review-app.vercel.app/api/callback`（本番URL）

**確認方法:**
https://console.cloud.google.com/apis/credentials

### 4. 環境変数の確認
```bash
# Vercel/本番環境で以下を設定
NEXT_PUBLIC_SUPABASE_URL=https://oandetwzkdyrhqfieutg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<新しいanon key>
SUPABASE_SERVICE_ROLE_KEY=<新しいservice_role key>
GOOGLE_CLIENT_ID=<Google Cloud Consoleから取得>
GOOGLE_CLIENT_SECRET=<Google Cloud Consoleから取得>
GOOGLE_REDIRECT_URI=<環境に応じたcallback URL>
```

### 5. トラブルシューティング

#### エラー: invalid_scope
**原因:** Google Cloud ConsoleでAPIが有効になっていない、またはOAuth同意画面でスコープが承認されていない

**解決策:**
1. https://console.cloud.google.com/apis/library で「Google Business Profile API」を検索して有効化
2. https://console.cloud.google.com/apis/credentials/consent でスコープを追加

#### エラー: redirect_uri_mismatch
**原因:** Google Cloud Consoleに登録されているリダイレクトURIと実際のURIが一致しない

**解決策:**
1. https://console.cloud.google.com/apis/credentials でOAuth 2.0クライアントIDを選択
2. 承認済みのリダイレクトURIに正しいURLを追加

#### エラー: Supabase connection failed
**原因:** 環境変数が正しく設定されていない、またはテーブルが存在しない

**解決策:**
1. `.env.local`の値を確認
2. Supabaseダッシュボードでテーブルの存在を確認
3. 上記SQLでテーブルを作成

### 6. 動作確認手順
1. [ ] ローカルで `npm run dev` を実行
2. [ ] http://localhost:3000/reviews にアクセス
3. [ ] 認証エラーバナーが表示されることを確認
4. [ ] 「再認証」ボタンをクリック
5. [ ] Google認証画面が表示されることを確認
6. [ ] アカウント選択後、権限承認画面が表示されることを確認
7. [ ] 承認後、`/admin/oauth/success`にリダイレクトされることを確認
8. [ ] 「認証が完了しました」と表示され、`/reviews`に戻ることを確認
9. [ ] レビュー一覧が正常に表示されることを確認

### 7. 次回のために（90日ルール対策）
- [ ] README.mdに90日ルールの注意事項を追加
- [ ] 定期的なアクセスをリマインダー設定
- [ ] バックアップスクリプトの自動化を検討
