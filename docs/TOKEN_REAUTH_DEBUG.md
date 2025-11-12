# Google トークン再認証 デバッグガイド

## 🔍 現在の問題

1. **本番（Vercel）で認証するとGoogleエラー画面になる**
2. **ローカルで認証後にアプリに戻るとエラーになる**

---

## ✅ チェックリスト

### 1. Google Cloud Console の設定確認

#### APIの有効化
https://console.cloud.google.com/apis/library

- [ ] Google Business Profile API
- [ ] My Business Business Information API
- [ ] My Business Account Management API

#### OAuth 2.0 認証情報
https://console.cloud.google.com/apis/credentials

**承認済みのリダイレクトURI:**
- [ ] `http://localhost:3000/api/callback` （ローカル用）
- [ ] `https://gmb-review-app.vercel.app/api/callback` （本番用）
- [ ] または実際のVercelドメイン

**⚠️ 重要:** 完全一致が必要（末尾のスラッシュの有無も重要）

#### OAuth同意画面
https://console.cloud.google.com/apis/credentials/consent

- [ ] スコープに `https://www.googleapis.com/auth/business.manage` を追加
- [ ] テストユーザーに `info@halal-diyafa.tokyo` を追加
- [ ] 公開ステータスが「テスト中」または「本番環境」になっている

---

### 2. 環境変数の確認

#### ローカル（.env.local）
```bash
NEXT_PUBLIC_SUPABASE_URL=https://oandetwzkdyrhqfieutg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>
GOOGLE_CLIENT_ID=<your_client_id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your_client_secret>
GOOGLE_REDIRECT_URI=http://localhost:3000/api/callback
```

#### Vercel（本番環境）
https://vercel.com/your-project/settings/environment-variables

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `GOOGLE_REDIRECT_URI=https://gmb-review-app.vercel.app/api/callback`

**⚠️ 重要:** 環境変数を変更したら必ず再デプロイ！

---

### 3. Supabase の設定確認

#### google_tokens テーブルの存在確認
https://supabase.com/dashboard/project/oandetwzkdyrhqfieutg

SQL Editor で実行:
```sql
-- テーブル存在確認
SELECT * FROM pg_tables WHERE schemaname = 'public' AND tablename = 'google_tokens';

-- テーブルが無い場合は作成
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

-- 既存データ確認
SELECT 
  id,
  LEFT(access_token, 30) || '...' as access_token,
  LEFT(refresh_token, 30) || '...' as refresh_token,
  expires_at,
  created_at,
  updated_at
FROM google_tokens;
```

---

## 🐛 デバッグ手順

### ステップ1: ローカルでのデバッグ

```bash
# 1. 開発サーバーを起動
npm run dev

# 2. ターミナルのログを監視
# （別のターミナルウィンドウで）

# 3. ブラウザを開く
# http://localhost:3000/reviews

# 4. ブラウザのコンソールを開く（F12キー）
# Console タブでエラーを確認

# 5. 「再認証」ボタンをクリック
```

#### 期待される流れ:
```
1. http://localhost:3000/api/auth/google
   ↓
2. Google認証画面（accounts.google.com）
   ↓
3. アカウント選択
   ↓
4. 権限承認画面
   ↓
5. http://localhost:3000/api/callback?code=...
   ↓ [ターミナルでログ確認]
   [CALLBACK] トークン取得結果: { has_access_token: true, has_refresh_token: true }
   ↓
6. http://localhost:3000/admin/oauth/success?access_token=...&refresh_token=...
   ↓ [ブラウザコンソールでログ確認]
   [OAuth Success] トークン確認: { has_access: true, has_refresh: true }
   ↓
7. Supabaseに保存
   ↓
8. http://localhost:3000/reviews
```

#### 各ステップでのチェックポイント:

**ステップ2でエラーが出る場合:**
```
エラー例: "invalid_scope"
→ Google Cloud ConsoleでAPIを有効化
→ OAuth同意画面でスコープを追加

エラー例: "redirect_uri_mismatch"
→ Google Cloud Consoleのリダイレクト URI を確認
→ エラーメッセージに表示されるURIをコピーして登録
```

**ステップ5でエラーが出る場合:**
```
ターミナルで以下を確認:
- "Auth Code: 受信" が表示されているか
- エラーログがないか

エラー例: "invalid_client"
→ GOOGLE_CLIENT_ID または GOOGLE_CLIENT_SECRET が間違っている

エラー例: "invalid_grant"
→ 認証コードが無効または期限切れ
→ ブラウザのキャッシュをクリアして再試行
```

**ステップ6でエラーが出る場合:**
```
ブラウザコンソールで以下を確認:
- access_token と refresh_token が取得できているか
- Supabase接続エラーがないか

エラー例: "認証情報が不完全です"
→ refresh_token が取得できていない
→ prompt=consent が設定されているか確認
```

---

### ステップ2: 本番（Vercel）でのデバッグ

```bash
# 1. Vercelのログを確認
# https://vercel.com/your-project/logs

# 2. 環境変数を確認
# https://vercel.com/your-project/settings/environment-variables

# 3. 本番URLで認証を試す
# https://gmb-review-app.vercel.app/reviews
```

#### Vercel特有の確認事項:

1. **環境変数が正しく設定されているか**
   ```
   GOOGLE_REDIRECT_URI=https://gmb-review-app.vercel.app/api/callback
   ```
   （ローカルのURIではない！）

2. **Google Cloud Consoleに本番URLが登録されているか**
   ```
   https://gmb-review-app.vercel.app/api/callback
   ```

3. **最新のコードがデプロイされているか**
   - Deployments タブで最新のコミットが反映されているか確認
   - 必要なら "Redeploy" をクリック

---

## 📊 トラブルシューティング表

| 症状 | 原因 | 解決策 |
|-----|------|-------|
| Google認証画面で「invalid_scope」 | APIが有効になっていない | Google Cloud ConsoleでAPIを有効化 |
| Google認証画面で「redirect_uri_mismatch」 | リダイレクトURIが登録されていない | Google Cloud Consoleに正しいURIを登録 |
| Google認証画面で「access_denied」 | ユーザーが権限を拒否 | 「許可」をクリックする |
| 認証後「認証情報が不完全です」 | refresh_tokenが取得できていない | prompt=consentが設定されているか確認 |
| 認証後Supabaseエラー | テーブルが存在しない | 上記SQLでテーブルを作成 |
| ローカルでは動くが本番で動かない | 環境変数が異なる | Vercelの環境変数を確認 |

---

## 🔧 修正内容（今回の変更）

### 1. `/api/callback/route.js`
- エラーハンドリングを強化
- 詳細なログを追加
- エラー時はエラーパラメータ付きで `/admin/oauth/success` にリダイレクト

### 2. `/admin/oauth/success/page.jsx`
- エラーパラメータのチェックを追加
- トークン情報のログを追加
- エラー時にユーザーフレンドリーなメッセージを表示

---

## 🎯 次のステップ

1. [ ] 上記チェックリストを全て確認
2. [ ] ローカルでデバッグ手順を実行
3. [ ] エラーが出たらターミナル・ブラウザコンソールのログを確認
4. [ ] 問題を修正
5. [ ] 本番環境で確認
6. [ ] 必要なら環境変数を更新して再デプロイ

---

## 💡 よくある質問

### Q: refresh_tokenが取得できない
A: 以下を確認してください:
1. `prompt=consent` が設定されているか（`src/app/api/auth/google/route.js`）
2. 以前に認証したことがある場合、Google側で権限を取り消してから再認証
3. Google Cloud Consoleの「アプリケーションを削除」して再度追加

### Q: ローカルでは動くのに本番で動かない
A: 以下を確認してください:
1. Vercelの環境変数 `GOOGLE_REDIRECT_URI` が本番URLになっているか
2. Google Cloud Consoleに本番URLが登録されているか
3. 環境変数を変更した後、Vercelで再デプロイしたか

### Q: エラーメッセージが表示されない
A: ブラウザのコンソール（F12キー）を開いてログを確認してください。
   サーバー側のログはターミナル（ローカル）またはVercelのログ（本番）で確認できます。

---

## 📝 ログの見方

### ローカル（ターミナル）
```
=== [CALLBACK] 開始 ===
Callback URL: http://localhost:3000/api/callback?code=...
Auth Code: 受信
Error: なし
Redirect URI: http://localhost:3000/api/callback
[CALLBACK] トークン取得開始...
[CALLBACK] トークン取得結果: {
  has_access_token: true,
  has_refresh_token: true,
  access_token_length: 183,
  refresh_token_length: 103
}
[CALLBACK] /admin/oauth/success にリダイレクト
```

### ブラウザコンソール（F12キー）
```
[OAuth Success] トークン確認: {
  has_access: true,
  has_refresh: true,
  access_length: 183,
  refresh_length: 103
}
トークン保存エラー: (エラーがあれば表示される)
```

---

必要に応じてこのガイドを参照しながらデバッグを進めてください！

