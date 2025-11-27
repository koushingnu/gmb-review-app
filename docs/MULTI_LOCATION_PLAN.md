# 🏪 複数店舗対応 - 実装プラン

## 現状の問題点

### ❌ 現在は1店舗のみ対応

```javascript
// src/app/api/reviews/sync/route.js (Line 224)
const locations = locRes.data.locations || [];
const locationName = locations[0].name;  // ← 常に最初の店舗
const locationId = locationName.split("/")[1];
```

**問題**:
- Google My Businessで複数店舗を管理していても、最初の1店舗しか同期されない
- 店舗を選択・切り替える機能がない
- `google_tokens`テーブルが単一レコード（id=1）のみ

---

## 🎯 実装目標

### Phase A: 複数店舗のデータ同期（バックエンド）
1. 全店舗のレビューを同期
2. 店舗情報を`locations`テーブルに保存
3. `location_id`で店舗を区別

### Phase B: 店舗選択UI（フロントエンド）
1. Sidebarに店舗選択ドロップダウン
2. 選択した店舗のレビューのみ表示
3. 店舗ごとの統計情報

---

## 📐 データベース設計

### 1. `locations`テーブル（既存）

```sql
CREATE TABLE locations (
  id TEXT PRIMARY KEY,                    -- Google Location ID
  resource_name TEXT UNIQUE NOT NULL,      -- accounts/xxx/locations/yyy
  display_name TEXT NOT NULL,              -- 店舗名
  address TEXT,                            -- 住所
  phone TEXT,                              -- 電話番号
  website_url TEXT,                        -- ウェブサイト
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**用途**:
- Google My Businessから取得した店舗情報を保存
- `reviews.location_id`の外部キー参照先

### 2. `google_tokens`テーブル（改修案）

**現状**: 単一レコード（id=1）のみ

**改修案A**: アカウント単位で管理（推奨）
```sql
-- google_tokensは1アカウントのみ（複数店舗は同じトークンで管理）
-- 変更不要
```

**理由**:
- Google OAuth 2.0のトークンは**アカウント単位**
- 1つのGoogleアカウントで複数店舗を管理するのが一般的
- 店舗ごとにトークンを分ける必要はない

---

## 🛠️ 実装手順

### Phase A-1: `locations`テーブルへの店舗情報保存

#### 1. `/api/reviews/sync`の修正

**変更前**:
```javascript
const locations = locRes.data.locations || [];
const locationName = locations[0].name;  // 最初の1店舗のみ
const locationId = locationName.split("/")[1];
```

**変更後**:
```javascript
const locations = locRes.data.locations || [];

// 全店舗をlocationsテーブルに保存
for (const loc of locations) {
  const locationId = loc.name.split("/")[1];
  await supabaseAdmin.from("locations").upsert({
    id: locationId,
    resource_name: loc.name,
    display_name: loc.title || `店舗 ${locationId}`,
    address: loc.storefrontAddress?.addressLines?.join(", "),
    phone: loc.phoneNumbers?.primaryPhone,
    website_url: loc.websiteUri,
    updated_at: new Date().toISOString(),
  });
}

// 全店舗のレビューを同期
for (const loc of locations) {
  const locationId = loc.name.split("/")[1];
  await syncReviewsForLocation(accountId, locationId);
}
```

#### 2. 店舗ごとの同期関数を作成

```javascript
async function syncReviewsForLocation(accountId, locationId) {
  // 既存の同期ロジックをここに移動
  // ページネーション対応
  let allReviews = [];
  let nextPageToken = null;
  
  do {
    const url = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews`;
    // ... 既存の同期ロジック
  } while (nextPageToken);
  
  return allReviews;
}
```

---

### Phase A-2: 店舗情報取得API

#### `/api/locations/route.js`（新規作成）

```javascript
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data: locations, error } = await supabaseAdmin
    .from("locations")
    .select("*")
    .order("display_name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ locations });
}
```

---

### Phase B-1: 店舗選択コンテキスト

#### `src/lib/contexts/LocationContext.jsx`（新規作成）

```javascript
"use client";
import { createContext, useContext, useState, useEffect } from "react";

const LocationContext = createContext();

export function LocationProvider({ children }) {
  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 店舗一覧を取得
    fetch("/api/locations")
      .then((res) => res.json())
      .then((data) => {
        setLocations(data.locations || []);
        // 最初の店舗を選択
        if (data.locations?.length > 0) {
          setSelectedLocationId(data.locations[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <LocationContext.Provider
      value={{
        locations,
        selectedLocationId,
        setSelectedLocationId,
        selectedLocation: locations.find((l) => l.id === selectedLocationId),
        loading,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
```

---

### Phase B-2: Sidebarに店舗選択UI追加

#### `src/components/layout/client/Sidebar.jsx`

```javascript
import { useLocation } from "@/lib/contexts/LocationContext";

// ... 既存のコード

export default function Sidebar({ ... }) {
  const { locations, selectedLocationId, setSelectedLocationId } = useLocation();

  return (
    <Box component="aside" ...>
      {/* アプリロゴ */}
      <Box>GMB Review</Box>

      {/* 🏪 店舗選択ドロップダウン（追加） */}
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>店舗</InputLabel>
        <Select
          value={selectedLocationId || ""}
          onChange={(e) => setSelectedLocationId(e.target.value)}
          label="店舗"
        >
          {locations.map((loc) => (
            <MenuItem key={loc.id} value={loc.id}>
              {loc.display_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* メニュー */}
      <List>...</List>
    </Box>
  );
}
```

---

### Phase B-3: レビュー一覧に店舗フィルター追加

#### `src/app/reviews/page.jsx`

```javascript
import { useLocation } from "@/lib/contexts/LocationContext";

export default function ReviewsPage() {
  const { selectedLocationId } = useLocation();
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!selectedLocationId) return;

    // 選択した店舗のレビューのみ取得
    fetch(`/api/reviews?location_id=${selectedLocationId}`)
      .then((res) => res.json())
      .then((data) => setReviews(data.reviews || []))
      .catch(console.error);
  }, [selectedLocationId]);

  // ...
}
```

#### `/api/reviews/route.js`の修正

```javascript
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const locationId = searchParams.get("location_id");
  
  let query = supabase.from("reviews").select("*");
  
  // 店舗フィルター
  if (locationId) {
    query = query.eq("location_id", locationId);
  }
  
  // ... 既存のクエリ
}
```

---

## 📊 UI設計

### Sidebar（左サイドバー）

```
┌──────────────────────────┐
│  GMB Review              │
│  口コミ管理システム      │
├──────────────────────────┤
│                          │
│  店舗: [ドロップダウン]  │  ← 追加
│  ├ 渋谷店               │
│  ├ 新宿店               │
│  └ 池袋店               │
│                          │
├──────────────────────────┤
│  メニュー                │
│  □ 口コミ一覧           │
│                          │
├──────────────────────────┤
│  統計情報                │
│  ⭐ 4.5 平均評価        │
│  📝 123 レビュー数      │
│  💬 85% 返信率          │
└──────────────────────────┘
```

### レビュー一覧ヘッダー

```
┌────────────────────────────────────────────┐
│  渋谷店 - 口コミ一覧                       │
│  123件のレビュー                           │
├────────────────────────────────────────────┤
│  [フィルター] [ソート] [全期間] [同期]    │
└────────────────────────────────────────────┘
```

---

## ✅ 実装チェックリスト

### Phase A: バックエンド（データ同期）

- [ ] `locations`テーブルのスキーマ確認
- [ ] `/api/reviews/sync`を全店舗対応に修正
  - [ ] 全店舗の情報を`locations`テーブルに保存
  - [ ] 各店舗のレビューを個別に同期
- [ ] `/api/locations`を作成（店舗一覧取得）
- [ ] `/api/reviews`に`location_id`フィルター追加
- [ ] `/api/reviews/stats`に`location_id`フィルター追加

### Phase B: フロントエンド（UI）

- [ ] `LocationContext`を作成
- [ ] `LocationProvider`を`layout.jsx`に追加
- [ ] Sidebarに店舗選択ドロップダウンを追加
- [ ] 統計情報を選択店舗のみに絞る
- [ ] レビュー一覧を選択店舗のみに絞る

---

## 🚀 段階的リリース

### ステップ1: データ同期のみ（ユーザーには見えない）
- 全店舗のレビューを同期
- `locations`テーブルに保存

### ステップ2: 店舗選択UI追加
- Sidebarに店舗ドロップダウン
- 最初の店舗をデフォルト選択

### ステップ3: フィルター機能
- 選択した店舗のレビューのみ表示
- 統計情報も店舗ごとに

---

## 🐛 注意事項

### 1. パフォーマンス
- 店舗数が多い場合、同期に時間がかかる
- バッチ処理やキューイングを検討

### 2. Google APIレート制限
- 店舗ごとにAPIリクエストが増える
- リトライ処理とエラーハンドリングが重要

### 3. UX
- 店舗選択後のローディング状態を適切に表示
- 店舗が1つしかない場合はドロップダウンを非表示

---

## 🔜 将来の拡張

### 店舗グループ機能
- 複数店舗をグループ化
- グループ単位での統計・比較

### 店舗横断分析
- 全店舗のレビューを集計
- 店舗間の比較グラフ

### 権限管理
- 店舗ごとのアクセス権限
- マルチテナント対応

