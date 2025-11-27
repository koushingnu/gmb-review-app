-- マルチテナント対応: usersテーブル作成
-- Supabase Auth (auth.users) と連携し、company_idを紐付け

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- RLS有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLSポリシー1: 自分の会社のユーザーのみ閲覧可能
CREATE POLICY "Users can view company members"
  ON users
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- RLSポリシー2: adminのみ、自分の会社のユーザーを管理可能
CREATE POLICY "Admins can manage company members"
  ON users
  FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 自分自身のレコードは常に更新可能
CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  USING (id = auth.uid());

-- テストデータ投入（開発環境用）
-- 注意: 実際のauth.usersにユーザーを作成する必要があります
-- 以下はプレースホルダーです
COMMENT ON TABLE users IS 'ユーザー情報テーブル。auth.usersと1:1で紐づく。company_idで会社を識別。';

