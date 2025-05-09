"use client";

import React, { useEffect, useState, useMemo } from "react";
import ReviewsList from "./components/ReviewsList";
import {
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Stack,
  Typography,
} from "@mui/material";

// ソート項目の定義
const SORT_OPTIONS = [
  { value: "create_time_desc", label: "日時：新しい順" },
  { value: "create_time_asc", label: "日時：古い順" },
  { value: "star_rating_desc", label: "評価：高い順" },
  { value: "star_rating_asc", label: "評価：低い順" },
];

export default function ReviewsDashboard() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [sortKey, setSortKey] = useState(SORT_OPTIONS[0].value);

  // API からレビュー一覧を取得
  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "レビュー取得失敗");
      setReviews(data.reviews);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 同期ボタン押下時
  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews/sync");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "同期失敗");
      // 同期後、一覧を再フェッチ
      await fetchReviews();
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  // 初回ロード
  useEffect(() => {
    fetchReviews();
  }, []);

  // ソート済み配列を計算
  const sortedReviews = useMemo(() => {
    const copy = [...reviews];
    switch (sortKey) {
      case "create_time_asc":
        return copy.sort(
          (a, b) => new Date(a.create_time) - new Date(b.create_time)
        );
      case "create_time_desc":
        return copy.sort(
          (a, b) => new Date(b.create_time) - new Date(a.create_time)
        );
      case "star_rating_asc":
        return copy.sort((a, b) => a.star_rating - b.star_rating);
      case "star_rating_desc":
        return copy.sort((a, b) => b.star_rating - a.star_rating);
      default:
        return copy;
    }
  }, [reviews, sortKey]);

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
      <Typography variant="h4" gutterBottom>
        レビュー管理ダッシュボード
      </Typography>

      {/* 同期ボタン & ソート選択 */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Button
          variant="contained"
          onClick={handleSync}
          disabled={syncing}
          startIcon={syncing ? <CircularProgress size={16} /> : null}
        >
          {syncing ? "同期中…" : "レビュー同期"}
        </Button>

        <FormControl size="small">
          <InputLabel id="sort-label">ソート</InputLabel>
          <Select
            labelId="sort-label"
            value={sortKey}
            label="ソート"
            onChange={(e) => setSortKey(e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* 状態に応じたフィードバック */}
      {loading && (
        <Box textAlign="center" my={4}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* レビュー一覧 */}
      {!loading && !error && <ReviewsList reviews={sortedReviews} />}
    </Box>
  );
}
