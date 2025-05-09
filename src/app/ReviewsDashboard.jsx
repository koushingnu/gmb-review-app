// src/app/ReviewsDashboard.jsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ReviewsList from "./components/ReviewsList";

export default function ReviewsDashboard() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [sortKey, setSortKey] = useState("create_time");

  // reviews を取得
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

  // GMB API からレビューを同期
  const handleSync = async () => {
    setSyncing(true);
    await fetch("/api/reviews/sync");
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
          </Select>
        </FormControl>
      </Stack>

      {/* レビュー一覧 */}
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
