-- マルチテナント対応: 既存テーブルにcompany_id追加

-- 1. google_tokensテーブル
ALTER TABLE google_tokens ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_google_tokens_company_id ON google_tokens(company_id);

-- company_idをUNIQUE制約（1会社につき1トークン）
-- 既存のid PRIMARY KEYを維持しつつ、company_idをUNIQUEに
ALTER TABLE google_tokens DROP CONSTRAINT IF EXISTS google_tokens_company_id_key;
ALTER TABLE google_tokens ADD CONSTRAINT google_tokens_company_id_key UNIQUE(company_id);

-- 2. locationsテーブル
ALTER TABLE locations ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_locations_company_id ON locations(company_id);

-- 3. reviewsテーブル
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_reviews_company_id ON reviews(company_id);
CREATE INDEX IF NOT EXISTS idx_reviews_location_id ON reviews(location_id);

-- 4. review_repliesテーブル
ALTER TABLE review_replies ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE review_replies ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);
CREATE INDEX IF NOT EXISTS idx_review_replies_company_id ON review_replies(company_id);
CREATE INDEX IF NOT EXISTS idx_review_replies_review_id ON review_replies(review_id);

-- 既存データの移行（開発環境用）
-- 既存のgoogle_tokensのid=1をスターバックスに紐付け
UPDATE google_tokens
SET company_id = '00000000-0000-0000-0000-000000000001'
WHERE id = 1 AND company_id IS NULL;

-- 既存のlocations/reviews/review_repliesも同様にスターバックスに紐付け
-- 注意: 本番環境では適切なcompany_idに更新する必要があります
UPDATE locations
SET company_id = '00000000-0000-0000-0000-000000000001'
WHERE company_id IS NULL;

UPDATE reviews
SET company_id = '00000000-0000-0000-0000-000000000001'
WHERE company_id IS NULL;

UPDATE review_replies
SET company_id = '00000000-0000-0000-0000-000000000001'
WHERE company_id IS NULL;

COMMENT ON COLUMN google_tokens.company_id IS '会社ID（外部キー）。1会社につき1つのGoogleトークン。';
COMMENT ON COLUMN locations.company_id IS '会社ID（外部キー）。この会社が管理する店舗。';
COMMENT ON COLUMN reviews.company_id IS '会社ID（外部キー）。パフォーマンスのため、locationsから取得せず直接保存。';
COMMENT ON COLUMN review_replies.company_id IS '会社ID（外部キー）。返信を作成した会社。';
COMMENT ON COLUMN review_replies.created_by IS 'ユーザーID（外部キー）。返信を作成したユーザー。';

