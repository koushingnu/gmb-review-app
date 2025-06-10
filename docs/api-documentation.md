# API仕様書

## 1. 認証API

### 1.1 Google認証

#### GET /api/auth/google

Googleログインを開始するエンドポイント

**レスポンス**

- 302 Redirect: Googleの認証ページにリダイレクト

#### GET /api/auth/google/callback

Google認証のコールバックエンドポイント

**レスポンス**

```typescript
interface AuthResponse {
  success: boolean;
  token?: string;
  error?: string;
}
```

## 2. ダッシュボードAPI

### 2.1 統計情報取得

#### GET /api/dashboard/stats

ダッシュボードの統計情報を取得

**レスポンス**

```typescript
interface DashboardStats {
  totalReviews: number; // 総レビュー数
  averageRating: number; // 平均評価
  responseRate: number; // 返信率
  recentReviews: number; // 最近のレビュー数（30日以内）
}
```

### 2.2 評価分布取得

#### GET /api/dashboard/rating-distribution

評価の分布情報を取得

**レスポンス**

```typescript
interface RatingDistribution {
  distribution: {
    [rating: number]: number; // 評価ごとの件数
  };
  trends: {
    [month: string]: {
      average: number;
      count: number;
    };
  };
}
```

## 3. レビューAPI

### 3.1 レビュー一覧取得

#### GET /api/reviews

レビュー一覧を取得

**クエリパラメータ**

```typescript
interface ReviewsQuery {
  page?: number; // ページ番号
  limit?: number; // 1ページあたりの件数
  sort?: string; // ソート条件
  filter?: {
    rating?: number; // 評価フィルター
    dateRange?: {
      // 日付範囲
      start: string;
      end: string;
    };
    hasReply?: boolean; // 返信有無
  };
}
```

**レスポンス**

```typescript
interface ReviewsResponse {
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
    reply?: {
      comment: string;
      updatedAt: string;
    };
    reviewer: {
      name: string;
      photoUrl?: string;
    };
    scores: {
      taste?: number;
      service?: number;
      price?: number;
      location?: number;
      hygiene?: number;
    };
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}
```

### 3.2 レビュー詳細取得

#### GET /api/reviews/:id

特定のレビューの詳細を取得

**パスパラメータ**

- id: レビューID

**レスポンス**

```typescript
interface ReviewDetail {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  reply?: {
    comment: string;
    updatedAt: string;
    sentAt?: string;
  };
  reviewer: {
    name: string;
    photoUrl?: string;
  };
  scores: {
    taste?: number;
    service?: number;
    price?: number;
    location?: number;
    hygiene?: number;
  };
  analysis?: {
    sentiment: string;
    keywords: string[];
    categories: string[];
  };
}
```

## 4. 返信API

### 4.1 返信作成/更新

#### POST /api/replies/:reviewId

レビューに対する返信を作成または更新

**パスパラメータ**

- reviewId: レビューID

**リクエストボディ**

```typescript
interface ReplyRequest {
  comment: string;
}
```

**レスポンス**

```typescript
interface ReplyResponse {
  success: boolean;
  reply: {
    comment: string;
    updatedAt: string;
    sentAt?: string;
  };
}
```

### 4.2 返信削除

#### DELETE /api/replies/:reviewId

レビューの返信を削除

**パスパラメータ**

- reviewId: レビューID

**レスポンス**

```typescript
interface DeleteReplyResponse {
  success: boolean;
}
```

## 5. 分析API

### 5.1 レビュー分析

#### GET /api/analysis/reviews

レビューの分析情報を取得

**クエリパラメータ**

```typescript
interface AnalysisQuery {
  dateRange?: {
    start: string;
    end: string;
  };
  groupBy?: "day" | "week" | "month";
}
```

**レスポンス**

```typescript
interface AnalysisResponse {
  summary: {
    totalReviews: number;
    averageRating: number;
    positiveRate: number;
    negativeRate: number;
    neutralRate: number;
  };
  trends: Array<{
    period: string;
    rating: number;
    count: number;
    sentiment: {
      positive: number;
      negative: number;
      neutral: number;
    };
  }>;
  keywords: Array<{
    word: string;
    count: number;
    sentiment: string;
  }>;
  categories: Array<{
    name: string;
    count: number;
    averageRating: number;
  }>;
}
```

## 6. Google同期API

### 6.1 同期実行

#### POST /api/google/sync

Googleマイビジネスとの同期を実行

**レスポンス**

```typescript
interface SyncResponse {
  success: boolean;
  metrics: {
    totalReviews: number; // 取得総数
    newReviews: number; // 新規数
    updatedReviews: number; // 更新数
    errors: number; // エラー数
  };
  duration: number; // 処理時間（秒）
}
```

### 6.2 同期状態取得

#### GET /api/google/sync/status

同期の状態を取得

**レスポンス**

```typescript
interface SyncStatus {
  isRunning: boolean;
  lastSync?: {
    startedAt: string;
    completedAt: string;
    success: boolean;
    metrics: {
      totalReviews: number;
      newReviews: number;
      updatedReviews: number;
      errors: number;
    };
  };
  nextScheduledSync?: string;
}
```

## エラーレスポンス

全てのAPIエンドポイントで、エラー時は以下の形式でレスポンスを返します：

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### エラーコード一覧

| コード              | 説明                   |
| ------------------- | ---------------------- |
| AUTH_REQUIRED       | 認証が必要             |
| INVALID_TOKEN       | 無効なトークン         |
| TOKEN_EXPIRED       | トークンの有効期限切れ |
| PERMISSION_DENIED   | 権限なし               |
| RESOURCE_NOT_FOUND  | リソースが見つからない |
| INVALID_REQUEST     | 不正なリクエスト       |
| RATE_LIMIT_EXCEEDED | レート制限超過         |
| INTERNAL_ERROR      | 内部エラー             |

## レート制限

- 認証済みユーザー: 100リクエスト/分
- 未認証ユーザー: 10リクエスト/分

レート制限に達した場合、429 Too Many Requestsを返します。

## キャッシュ

以下のエンドポイントでキャッシュを使用：

| エンドポイント                     | キャッシュ時間 |
| ---------------------------------- | -------------- |
| /api/dashboard/stats               | 5分            |
| /api/dashboard/rating-distribution | 10分           |
| /api/reviews（一覧）               | 1分            |
| /api/reviews/:id（詳細）           | 5分            |
| /api/analysis/reviews              | 30分           |

## バージョニング

APIのバージョニングは、URLパスで管理します：

- 現在のバージョン: v1
- 例: `/api/v1/reviews`

## セキュリティ

1. 認証

   - JWTベースの認証
   - トークンの有効期限: 24時間
   - リフレッシュトークンの有効期限: 30日

2. CORS設定

   - 許可オリジン: 設定された本番/開発環境のドメインのみ
   - 許可メソッド: GET, POST, PUT, DELETE, OPTIONS
   - クレデンシャル: 必須

3. レートリミット

   - IPベース
   - トークンベース
   - バーストトラフィック対応

4. 入力バリデーション
   - 全てのリクエストパラメータをバリデーション
   - SQLインジェクション対策
   - XSS対策

## 監視とロギング

1. アクセスログ

   - リクエスト元IP
   - タイムスタンプ
   - エンドポイント
   - レスポンスタイム
   - ステータスコード

2. エラーログ

   - スタックトレース
   - エラーコンテキスト
   - ユーザー情報（認証済みの場合）

3. パフォーマンスメトリクス
   - レスポンスタイム
   - エラーレート
   - リクエスト数
   - キャッシュヒット率
