# 👤 ユーザーセットアップガイド

## 🎯 手順

### ステップ1: Supabase Authenticationでユーザー作成

1. **Supabase Dashboard** を開く
   ```
   https://supabase.com/dashboard/project/oandetwzkdyrhqfieutg
   ```

2. 左メニュー **Authentication** → **Users** をクリック

3. 右上の **Add user** → **Create new user** をクリック

4. ユーザー情報を入力
   ```
   Email: koushin1022apple@gmail.com
   Password: Koushin1022
   Auto Confirm User: ✅ チェックを入れる
   ```

5. **Create user** をクリック

6. **作成されたユーザーのUUIDをコピー**
   - ユーザー一覧で `koushin1022apple@gmail.com` をクリック
   - `User UID` の値をコピー（例: `12345678-1234-1234-1234-123456789abc`）

---

### ステップ2: ユーザープロフィール登録（SQL実行）

1. **Supabase Dashboard** → 左メニュー **SQL Editor** をクリック

2. **New query** をクリック

3. 以下のSQLを貼り付け（**UUIDを置き換える**）

```sql
-- ユーザープロフィールを登録（会社A = スターバックス）
INSERT INTO users (id, company_id, email, display_name, role) 
VALUES (
  'ここに↑でコピーしたUUIDを貼り付け',  -- ← 実際のUUIDに置き換える
  '00000000-0000-0000-0000-000000000001',  -- 会社A (スターバックス)
  'koushin1022apple@gmail.com',
  'Koushin',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET
  company_id = EXCLUDED.company_id,
  email = EXCLUDED.email,
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role,
  updated_at = NOW();
```

4. **Run** をクリック

5. 成功したら、以下のクエリで確認

```sql
-- 確認用クエリ
SELECT 
  u.id,
  u.email,
  u.display_name,
  u.role,
  c.name as company_name
FROM users u
JOIN companies c ON u.company_id = c.id
WHERE u.email = 'koushin1022apple@gmail.com';
```

結果:
```
id: (UUID)
email: koushin1022apple@gmail.com
display_name: Koushin
role: admin
company_name: スターバックス
```

---

### ステップ3: ログインテスト

1. 開発サーバーを起動
   ```bash
   npm run dev
   ```

2. ブラウザで開く
   ```
   http://localhost:3000
   ```

3. ログインページにリダイレクトされる

4. ログイン情報を入力
   ```
   メールアドレス: koushin1022apple@gmail.com
   パスワード: Koushin1022
   ```

5. **ログイン** ボタンをクリック

6. ✅ ダッシュボードが表示される
   - Sidebar右下に「Koushin」と表示
   - 会社A（スターバックス）のレビューのみ表示

---

## 🐛 トラブルシューティング

### エラー: "User not found"

**原因**: `users`テーブルにプロフィールが登録されていない

**解決方法**: ステップ2のSQLを再実行（UUIDが正しいか確認）

---

### エラー: "Unauthorized"

**原因**: RLSポリシーが正しく設定されていない

**解決方法**: 
```sql
-- RLSポリシーを確認
SELECT * FROM pg_policies WHERE tablename IN ('companies', 'users', 'reviews');
```

---

### ログイン後、レビューが表示されない

**原因**: 既存のレビューに`company_id`が設定されていない

**解決方法**:
```sql
-- 既存レビューを会社Aに紐付け
UPDATE reviews
SET company_id = '00000000-0000-0000-0000-000000000001'
WHERE company_id IS NULL;

UPDATE locations
SET company_id = '00000000-0000-0000-0000-000000000001'
WHERE company_id IS NULL;

UPDATE google_tokens
SET company_id = '00000000-0000-0000-0000-000000000001'
WHERE company_id IS NULL AND id = 1;
```

---

## 📊 データ確認クエリ

### 会社一覧
```sql
SELECT * FROM companies;
```

### ユーザー一覧
```sql
SELECT 
  u.id,
  u.email,
  u.display_name,
  u.role,
  c.name as company_name
FROM users u
JOIN companies c ON u.company_id = c.id;
```

### レビュー数（会社別）
```sql
SELECT 
  c.name as company_name,
  COUNT(r.review_id) as review_count
FROM companies c
LEFT JOIN reviews r ON c.id = r.company_id
GROUP BY c.id, c.name;
```

---

## 🔒 セキュリティ確認

### RLSが有効か確認
```sql
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('companies', 'users', 'locations', 'reviews', 'review_replies', 'google_tokens');
```

全て `rowsecurity = true` であることを確認

---

## 🎉 完了

ログインに成功したら、マルチテナント実装は完了です！

次は：
- **Phase 2**: AI自動返信機能
- **複数店舗対応**: 店舗選択UIの追加

