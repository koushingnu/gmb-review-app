-- マルチテナント対応: Row Level Security (RLS) ポリシー設定

-- 1. google_tokensテーブル
ALTER TABLE google_tokens ENABLE ROW LEVEL SECURITY;

-- 自分の会社のトークンのみ閲覧可能（通常は使わないが念のため）
CREATE POLICY "Users can view company tokens"
  ON google_tokens
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- adminのみ、自分の会社のトークンを更新可能
CREATE POLICY "Admins can manage company tokens"
  ON google_tokens
  FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2. locationsテーブル
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- 自分の会社の店舗のみ閲覧可能
CREATE POLICY "Users can view company locations"
  ON locations
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- adminのみ、自分の会社の店舗を管理可能
CREATE POLICY "Admins can manage company locations"
  ON locations
  FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. reviewsテーブル
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 自分の会社のレビューのみ閲覧可能
CREATE POLICY "Users can view company reviews"
  ON reviews
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- システムによる更新（同期処理）はRLSをバイパスする必要があるため、
-- サーバーサイド（supabaseAdmin）で実行する

-- 4. review_repliesテーブル
ALTER TABLE review_replies ENABLE ROW LEVEL SECURITY;

-- 自分の会社の返信のみ閲覧可能
CREATE POLICY "Users can view company replies"
  ON review_replies
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- member以上は返信を作成可能
CREATE POLICY "Members can create replies"
  ON review_replies
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'member')
    )
  );

-- 自分が作成した返信は編集可能（送信前のみ）
CREATE POLICY "Users can update their own replies"
  ON review_replies
  FOR UPDATE
  USING (
    created_by = auth.uid() AND sent_at IS NULL
  );

-- adminは自分の会社の全ての返信を編集可能
CREATE POLICY "Admins can manage company replies"
  ON review_replies
  FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

COMMENT ON TABLE google_tokens IS 'RLS有効: 自分の会社のトークンのみアクセス可能';
COMMENT ON TABLE locations IS 'RLS有効: 自分の会社の店舗のみアクセス可能';
COMMENT ON TABLE reviews IS 'RLS有効: 自分の会社のレビューのみアクセス可能';
COMMENT ON TABLE review_replies IS 'RLS有効: 自分の会社の返信のみアクセス可能';

