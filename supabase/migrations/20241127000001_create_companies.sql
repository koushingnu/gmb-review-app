-- マルチテナント対応: companiesテーブル作成
-- 会社（テナント）の基本情報を管理

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);

-- RLS有効化
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: ユーザーは自分が所属する会社のみ閲覧可能
CREATE POLICY "Users can view their own company"
  ON companies
  FOR SELECT
  USING (
    id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- テストデータ投入（開発環境用）
INSERT INTO companies (id, name, slug) VALUES
  ('00000000-0000-0000-0000-000000000001', 'スターバックス', 'starbucks'),
  ('00000000-0000-0000-0000-000000000002', 'ドトールコーヒー', 'doutor')
ON CONFLICT (id) DO NOTHING;

