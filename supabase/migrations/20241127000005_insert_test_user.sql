-- テストユーザーのプロフィール登録
-- 
-- 注意: このSQLを実行する前に、Supabase Authentication で
-- koushin1022apple@gmail.com のユーザーを作成し、
-- そのUUIDを下記の'USER_UUID_HERE'に置き換えてください
--
-- 手順:
-- 1. Supabase Dashboard → Authentication → Users
-- 2. koushin1022apple@gmail.com を探す
-- 3. UUIDをコピー（例: 12345678-1234-1234-1234-123456789abc）
-- 4. 下記の'USER_UUID_HERE'を実際のUUIDに置き換える
-- 5. このSQLを実行

-- ユーザープロフィールを登録（会社A = スターバックス）
INSERT INTO users (id, company_id, email, display_name, role) 
VALUES (
  'USER_UUID_HERE',  -- ← ここを実際のUUIDに置き換える
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

