# 🤖 MVP Phase 2: AI自動返信 - 実装ガイド

## 📋 フェーズ概要
Phase 1（レビュー一覧）の完成後、**AI自動返信**機能を実装します。

---

## ✅ 既存の実装（利用可能）

### API エンドポイント

#### 1. `/api/replies/generate` - AI返信生成 ✅ **新規作成済み**
- **機能**: レビューを解析してAIが返信文を自動生成
- **メソッド**: POST
- **リクエスト**:
  ```json
  { "review_id": "AbFvOql..." }
  ```
- **レスポンス**:
  ```json
  {
    "reply": "お客様\n\nこの度はご来店いただき...",
    "review_id": "AbFvOql...",
    "saved": true
  }
  ```
- **特徴**:
  - GPT-4を使用
  - 評価（星数）とコメント内容を考慮
  - 200文字以内で簡潔
  - 自動的に`review_replies`テーブルに保存（未送信として）

#### 2. `/api/replies/pending` - 未送信返信一覧 ✅ **既存**
- **機能**: まだGoogleに送信していない返信の一覧を取得
- **メソッド**: GET
- **レスポンス**:
  ```json
  {
    "replies": [
      {
        "review_id": "AbFvOql...",
        "comment": "お客様、ご来店ありがとうございました...",
        "update_time": "2024-11-16T10:00:00Z"
      }
    ]
  }
  ```

#### 3. `/api/replies/send` - Google APIへ返信送信 ✅ **既存**
- **機能**: 生成した返信をGoogle My Businessへ送信
- **メソッド**: POST
- **リクエスト**:
  ```json
  { "review_id": "AbFvOql..." }
  ```
- **処理フロー**:
  1. `review_replies`テーブルから返信取得
  2. Google Access Tokenを自動リフレッシュ
  3. Google My Business APIで返信をPUT
  4. 成功時に`sent_at`を更新

---

## 🔧 実装が必要な機能

### フロントエンドUI

#### 1. 返信モーダル/ダイアログ ⚠️ **要実装**

**場所**: `src/components/reviews/ReplyDialog.jsx`（新規作成）

**機能**:
- レビュー情報の表示
- AIで返信を自動生成ボタン
- 返信文の編集エリア
- プレビュー表示
- 送信/キャンセルボタン

**状態管理**:
```javascript
const [open, setOpen] = useState(false);
const [selectedReview, setSelectedReview] = useState(null);
const [replyText, setReplyText] = useState("");
const [generating, setGenerating] = useState(false);
const [sending, setSending] = useState(false);
```

**APIフロー**:
```
1. ユーザーが「返信する」ボタンをクリック
   ↓
2. POST /api/replies/generate { review_id }
   ↓
3. 生成された返信をテキストエリアに表示
   ↓
4. ユーザーが編集（任意）
   ↓
5. 「送信」ボタンをクリック
   ↓
6. POST /api/replies/send { review_id }
   ↓
7. 成功時にモーダルを閉じ、レビュー一覧を再取得
```

#### 2. レビュー一覧の更新 ⚠️ **要実装**

**場所**: `src/app/reviews/page.jsx`, `src/features/reviews/components/list/ReviewsList.jsx`

**変更点**:
- `onReplyClick` propを親コンポーネントから渡す
- 返信モーダルの表示/非表示制御
- 返信送信後のレビュー一覧再取得

**例**:
```javascript
const [replyDialogOpen, setReplyDialogOpen] = useState(false);
const [selectedReview, setSelectedReview] = useState(null);

const handleReplyClick = (review) => {
  setSelectedReview(review);
  setReplyDialogOpen(true);
};

<ReviewsList
  reviews={filteredReviews}
  loading={loading}
  onRefresh={handleSync}
  onReplyClick={handleReplyClick}
/>

<ReplyDialog
  open={replyDialogOpen}
  review={selectedReview}
  onClose={() => setReplyDialogOpen(false)}
  onSuccess={handleSync}
/>
```

#### 3. 未送信返信の管理画面（オプション）⚠️ **Phase 2.5**

**場所**: `src/app/replies/pending/page.jsx`（新規）

**機能**:
- 未送信の返信一覧を表示
- まとめて送信
- 個別に編集・削除

---

## 📝 実装手順

### ステップ1: 返信ダイアログの作成

1. `src/components/reviews/ReplyDialog.jsx`を作成
2. Material-UIの`Dialog`コンポーネントを使用
3. AI生成ボタン、編集エリア、送信ボタンを実装

### ステップ2: レビュー一覧への統合

1. `src/app/reviews/page.jsx`に返信モーダルの状態を追加
2. `handleReplyClick`ハンドラーを実装
3. `ReviewsList`に`onReplyClick` propを渡す

### ステップ3: 動作確認

1. レビュー一覧で「返信する」ボタンをクリック
2. モーダルが開き、「AI返信生成」ボタンをクリック
3. 返信文が自動生成される
4. 必要に応じて編集
5. 「送信」ボタンをクリック
6. Google My Businessに返信が投稿される
7. レビュー一覧に「オーナーからの返信」が表示される

---

## 🎨 UIデザイン案

### 返信ダイアログ

```
┌─────────────────────────────────────────────────┐
│  レビューへの返信                          [×]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ⭐️⭐️⭐️⭐️⭐️ (5つ星)                            │
│  山田太郎さん                                   │
│  「とても美味しかったです...」                  │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  返信文:                      [🤖 AI生成]       │
│  ┌─────────────────────────────────────────┐   │
│  │ 山田様                                   │   │
│  │                                         │   │
│  │ この度はご来店いただき、誠にあり       │   │
│  │ がとうございました。お料理をお気に     │   │
│  │ 召していただけて大変嬉しく思います...  │   │
│  │                                         │   │
│  └─────────────────────────────────────────┘   │
│  0 / 200文字                                    │
│                                                 │
│           [キャンセル]   [📤 送信]              │
└─────────────────────────────────────────────────┘
```

---

## 🐛 注意事項

### 1. OpenAI API Rate Limit
- GPT-4は1分あたりのトークン制限あり
- 連続生成時はエラーハンドリングが必要

### 2. Google API送信エラー
- アクセストークンの有効期限切れ
- `sent_at`がnullの場合のみ送信可能（重複送信防止）

### 3. 返信の編集
- AIが生成した返信は必ず確認・編集できるようにする
- 誤った情報や不適切な表現がないかチェック

---

## 📊 データベーススキーマ

### `review_replies`テーブル

```sql
CREATE TABLE review_replies (
  id BIGSERIAL PRIMARY KEY,
  review_id TEXT NOT NULL REFERENCES reviews(review_id),
  comment TEXT NOT NULL,
  update_time TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,  -- NULL: 未送信, 日時: 送信済み
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## ✅ Phase 2 完成の定義

以下が全て動作すればPhase 2完成：

- [ ] レビュー一覧から「返信する」ボタンをクリック
- [ ] 返信ダイアログが開く
- [ ] 「AI返信生成」ボタンで自動生成される
- [ ] 生成された返信文を編集できる
- [ ] 「送信」ボタンでGoogle My Businessに投稿される
- [ ] レビュー一覧に「オーナーからの返信」が表示される
- [ ] 既に返信済みのレビューには「返信する」ボタンが表示されない

---

## 🔜 Phase 3へ

Phase 2が完成したら、Phase 3（AI分析）に進みます：
- 分析グラフの表示
- 四半期比較
- AI総評の生成

