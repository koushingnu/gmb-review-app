// src/app/ReviewsDashboard.jsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import ReviewsList from "./components/ReviewsList";

export default function ReviewsDashboard() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [sortKey, setSortKey] = useState("create_time");

  // レビュー取得
  useEffect(() => {
    fetchReviews();
  }, [sortKey]);

  const fetchReviews = async () => {
    setLoading(true);
    const res = await fetch(`/api/reviews?sort=${sortKey}`);
    const data = await res.json();
    setReviews(data.reviews);
    setLoading(false);
  };

  // 同期ボタン処理
  const handleSync = async () => {
    setSyncing(true);
    const res = await fetch("/api/reviews/sync");
    const data = await res.json();
    // 成功メッセージなどは任意で通知
    await fetchReviews();
    setSyncing(false);
  };

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
          {syncing ? "同期中…" : "レビューを同期"}
        </Button>

        <FormControl size="small">
          <InputLabel id="sort-label">並び替え</InputLabel>
          <Select
            labelId="sort-label"
            value={sortKey}
            label="並び替え"
            onChange={(e) => setSortKey(e.target.value)}
          >
            <MenuItem value="create_time">新着順</MenuItem>
            <MenuItem value="star_rating">評価順</MenuItem>
            {/* 他のソートも追加可能 */}
          </Select>
        </FormControl>
      </Stack>

      {/* レビューリスト */}
      {loading ? (
        <Box textAlign="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <ReviewsList reviews={reviews} />
      )}
    </Box>
  );
}
